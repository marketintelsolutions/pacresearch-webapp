import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { Lock, ZoomIn, ZoomOut, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { auth } from "../../firebase/firebaseConfig";

// Worker version is pinned to the installed pdfjs-dist so the two never drift.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STREAM_URL =
  process.env.REACT_APP_SECURE_VIEW_URL ||
  "https://us-central1-pacresearch-feb77.cloudfunctions.net/issueSecureViewStream";

// One page's rendering state we keep so search can highlight without re-drawing
// the (non-selectable) canvas. `wrap` positions the highlight overlay; `layer`
// receives the translucent match boxes.
interface PageView {
  pageNum: number;
  wrap: HTMLDivElement;
  layer: HTMLDivElement;
  canvas: HTMLCanvasElement;
  viewport: pdfjsLib.PageViewport;
}

// A single search hit: which page, and the concatenated-text offset range.
interface Match {
  pageNum: number;
  start: number;
  end: number;
}

// Cached text of a page: the full lowercased string plus, for each text item,
// its char offset in that string and its pdf.js geometry.
interface PageText {
  text: string;
  items: {
    offset: number;
    length: number;
    transform: number[];
    width: number;
    height: number;
  }[];
}

const SecureViewer = () => {
  const { editionId } = useParams<{ editionId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the loaded document around so zoom re-renders don't re-download it.
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  // Per-page render state and cached text, rebuilt on each (re)render.
  const pageViewsRef = useRef<PageView[]>([]);
  const pageTextRef = useRef<Map<number, PageText>>(new Map());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  // ---- search state ----
  const [showSearch, setShowSearch] = useState(false);
  const [term, setTerm] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /** Paint every page into the container at `zoom`, caching per-page state. */
  const renderPages = useCallback(async () => {
    const pdf = pdfRef.current;
    const container = containerRef.current;
    if (!pdf || !container) return;

    container.innerHTML = "";
    pageViewsRef.current = [];
    const baseWidth = container.clientWidth || 800;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const unscaled = page.getViewport({ scale: 1 });
      const scale = (baseWidth / unscaled.width) * zoom;
      const viewport = page.getViewport({ scale });

      // A positioned wrapper holds the canvas + an absolutely-positioned
      // highlight layer. The layer only ever contains translucent boxes — never
      // text — so nothing here is selectable or copyable.
      const wrap = document.createElement("div");
      wrap.className = "relative mx-auto mb-6 w-fit";

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = "shadow rounded max-w-full block";
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      const layer = document.createElement("div");
      layer.className = "pointer-events-none absolute inset-0";

      wrap.appendChild(canvas);
      wrap.appendChild(layer);
      container.appendChild(wrap);

      await page.render({ canvasContext: ctx, viewport }).promise;

      pageViewsRef.current.push({ pageNum, wrap, layer, canvas, viewport });

      // Extract + cache the page text once (keyed by page, geometry captured in
      // PDF user space so it survives zoom re-renders). In memory only.
      //
      // Items are joined with a single space so word-runs don't fuse across item
      // boundaries; that space belongs to no item, so a match's characters map
      // only to real item geometry. Each recorded item keeps its own transform,
      // width and length — highlight boxes interpolate WITHIN one item, never
      // across the whole page string, so positional error can't accumulate.
      if (!pageTextRef.current.has(pageNum)) {
        const content = await page.getTextContent();
        let text = "";
        const items: PageText["items"] = [];
        content.items.forEach((it, idx) => {
          const item = it as {
            str?: string;
            transform: number[];
            width: number;
            height: number;
          };
          const str = item.str ?? "";
          if (idx > 0) text += " "; // separator, not part of any item
          if (str.length > 0) {
            items.push({
              offset: text.length,
              length: str.length,
              transform: item.transform,
              width: item.width,
              height: item.height,
            });
          }
          text += str;
        });
        pageTextRef.current.set(pageNum, { text: text.toLowerCase(), items });
      }
    }
  }, [zoom]);

  // Fetch the bytes once (auth-checked server-side), then render.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      pageTextRef.current = new Map();
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be signed in.");
        const token = await user.getIdToken();

        const res = await fetch(
          `${STREAM_URL}?editionId=${encodeURIComponent(editionId || "")}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 403)
          throw new Error("You don't have access to this report.");
        if (!res.ok) throw new Error("Could not load this report.");

        const bytes = await res.arrayBuffer();
        if (cancelled) return;

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        await renderPages();
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load report."
          );
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // renderPages intentionally omitted: zoom changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editionId]);

  // Compute matches from the cached page text whenever the term changes.
  const runSearch = useCallback((raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) {
      setMatches([]);
      setActiveMatch(0);
      return;
    }
    const found: Match[] = [];
    // Preserve page order for stable next/prev navigation.
    const pages = Array.from(pageTextRef.current.keys()).sort((a, b) => a - b);
    for (const pageNum of pages) {
      const pt = pageTextRef.current.get(pageNum)!;
      let idx = pt.text.indexOf(q);
      while (idx !== -1) {
        found.push({ pageNum, start: idx, end: idx + q.length });
        idx = pt.text.indexOf(q, idx + q.length);
      }
    }
    setMatches(found);
    setActiveMatch(0);
  }, []);

  // Paint highlight boxes for the current matches over each page's overlay.
  const paintHighlights = useCallback(() => {
    const views = new Map(pageViewsRef.current.map((v) => [v.pageNum, v]));
    // Clear all layers first.
    pageViewsRef.current.forEach((v) => (v.layer.innerHTML = ""));
    if (matches.length === 0) return;

    matches.forEach((m, i) => {
      const view = views.get(m.pageNum);
      const pt = pageTextRef.current.get(m.pageNum);
      if (!view || !pt) return;

      const isActive = i === activeMatch;

      // A match can span several text items. Draw one box per item it overlaps,
      // interpolating only within that item — so error stays bounded to a single
      // run and a box can never land on the wrong line.
      for (const item of pt.items) {
        const itemEnd = item.offset + item.length;
        const from = Math.max(m.start, item.offset);
        const to = Math.min(m.end, itemEnd);
        if (from >= to) continue; // no overlap with this item

        const [, , , , e, f] = item.transform;
        // (e,f) is the text baseline origin in PDF user space (bottom-left
        // origin). Map the item's glyph box corners through the viewport.
        const [x1, y1] = view.viewport.convertToViewportPoint(e, f + item.height);
        const [x2, y2] = view.viewport.convertToViewportPoint(
          e + item.width,
          f
        );
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const fullW = Math.abs(x2 - x1);
        const fullH = Math.abs(y2 - y1) || 12;

        const perChar = fullW / item.length;
        const boxLeft = left + (from - item.offset) * perChar;
        const boxW = Math.max((to - from) * perChar, 3);

        const box = document.createElement("div");
        box.style.position = "absolute";
        box.style.left = `${boxLeft}px`;
        box.style.top = `${top}px`;
        box.style.width = `${boxW}px`;
        box.style.height = `${fullH}px`;
        box.style.borderRadius = "2px";
        box.style.background = isActive
          ? "rgba(242,104,54,0.45)"
          : "rgba(255,214,0,0.4)";
        box.style.outline = isActive ? "1px solid rgba(242,104,54,0.9)" : "none";
        view.layer.appendChild(box);
      }
    });
  }, [matches, activeMatch]);

  // Scroll the active match into view.
  const scrollToActive = useCallback(() => {
    const m = matches[activeMatch];
    if (!m) return;
    const view = pageViewsRef.current.find((v) => v.pageNum === m.pageNum);
    view?.wrap.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [matches, activeMatch]);

  useEffect(() => {
    paintHighlights();
  }, [paintHighlights]);

  useEffect(() => {
    scrollToActive();
  }, [activeMatch, scrollToActive]);

  // Re-render (not re-fetch) when zoom changes, then repaint highlights.
  useEffect(() => {
    if (!pdfRef.current) return;
    (async () => {
      await renderPages();
      paintHighlights();
    })();
    // paintHighlights covered by its own effect; avoid double-run on match change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, renderPages]);

  const stepMatch = useCallback(
    (dir: 1 | -1) => {
      setActiveMatch((cur) => {
        if (matches.length === 0) return 0;
        return (cur + dir + matches.length) % matches.length;
      });
    },
    [matches.length]
  );

  // ---- best-effort viewing deterrents (unchanged: copy/print stay disabled) ----
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // Ctrl/Cmd+F opens OUR in-memory search instead of the browser's find
      // (which would otherwise do nothing useful over a canvas).
      if ((e.ctrlKey || e.metaKey) && k === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }
      // Print / Save / Copy / View-source shortcuts stay blocked.
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "c", "u"].includes(k)) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  const matchLabel = useMemo(() => {
    if (!term.trim()) return "";
    if (matches.length === 0) return "No matches";
    return `${activeMatch + 1} of ${matches.length}`;
  }, [term, matches.length, activeMatch]);

  return (
    <>
      {/* Blank the report if the page is sent to a printer / PDF-print. */}
      <style>{`
        @media print {
          body { display: none !important; }
        }
        .secure-viewer, .secure-viewer canvas {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
      `}</style>

      <section className="w-full px-6 xl:px-0 max-w-max mx-auto mt-[40px] mb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/account"
            className="text-secondaryBlue border border-secondaryBlue px-4 py-2 rounded-[16px] hover:underline text-sm font-['Inter']"
          >
            ← Back to my account
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Lock size={14} /> View-only • not downloadable
            </span>
            <button
              onClick={() => {
                setShowSearch((s) => !s);
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }}
              className={`p-2 rounded-full border ${
                showSearch
                  ? "border-secondaryBlue text-secondaryBlue"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              aria-label="Search in report"
              title="Search (Ctrl/Cmd+F)"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-24 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primaryBlue border-r-transparent" />
            <p className="mt-3 text-sm text-gray-600">Loading secure reader…</p>
          </div>
        )}

        {error && (
          <div className="py-16 text-center">
            <p className="text-red-600">{error}</p>
            <Link
              to="/account"
              className="mt-4 inline-block px-5 py-2 bg-primaryBlue text-white rounded-full text-sm"
            >
              Back to my account
            </Link>
          </div>
        )}

        {!error && (
          <>
            {numPages > 0 && (
              <p className="mb-3 text-sm text-gray-500">{numPages} pages</p>
            )}
            {/* Search bar — fixed to the bottom-center of the viewport so it's
                easy to spot and never scrolls with the pages (no bounce between
                the input and the highlighted match). */}
            {showSearch && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg flex items-center gap-2.5 p-2.5 pl-4 bg-white/95 backdrop-blur rounded-full border border-primaryBlue shadow-xl">
                <Search size={18} className="text-primaryBlue shrink-0" />
                <input
                  ref={searchInputRef}
                  value={term}
                  onChange={(e) => {
                    setTerm(e.target.value);
                    runSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      stepMatch(e.shiftKey ? -1 : 1);
                    } else if (e.key === "Escape") {
                      setShowSearch(false);
                    }
                  }}
                  placeholder="Search in this report…"
                  className="flex-1 min-w-0 text-base outline-none bg-transparent"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                  {matchLabel}
                </span>
                <button
                  onClick={() => stepMatch(-1)}
                  disabled={matches.length === 0}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Previous match"
                >
                  <ChevronUp size={17} />
                </button>
                <button
                  onClick={() => stepMatch(1)}
                  disabled={matches.length === 0}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Next match"
                >
                  <ChevronDown size={17} />
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setTerm("");
                    runSearch("");
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close search"
                >
                  <X size={17} />
                </button>
              </div>
            )}
            <div
              ref={containerRef}
              className="secure-viewer bg-gray-100 rounded-xl p-4 md:p-8 overflow-auto"
            />
          </>
        )}
      </section>
    </>
  );
};

export default SecureViewer;
