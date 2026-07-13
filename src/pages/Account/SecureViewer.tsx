import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { Lock, ZoomIn, ZoomOut } from "lucide-react";
import { auth } from "../../firebase/firebaseConfig";

// Worker version is pinned to the installed pdfjs-dist so the two never drift.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STREAM_URL =
  process.env.REACT_APP_SECURE_VIEW_URL ||
  "https://us-central1-pacresearch-feb77.cloudfunctions.net/issueSecureViewStream";

const SecureViewer = () => {
  const { editionId } = useParams<{ editionId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the loaded document around so zoom re-renders don't re-download it.
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  /** Paint every page of the loaded document into the container at `zoom`. */
  const renderPages = useCallback(async () => {
    const pdf = pdfRef.current;
    const container = containerRef.current;
    if (!pdf || !container) return;

    container.innerHTML = "";
    const baseWidth = container.clientWidth || 800;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const unscaled = page.getViewport({ scale: 1 });
      const scale = (baseWidth / unscaled.width) * zoom;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = "mx-auto mb-6 shadow rounded max-w-full";
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      container.appendChild(canvas);
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
  }, [zoom]);

  // Fetch the bytes once (auth-checked server-side), then render.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be signed in.");
        const token = await user.getIdToken();

        const res = await fetch(
          `${STREAM_URL}?editionId=${encodeURIComponent(editionId || "")}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 403) throw new Error("You don't have access to this report.");
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
          setError(err instanceof Error ? err.message : "Failed to load report.");
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

  // Re-render (not re-fetch) when zoom changes.
  useEffect(() => {
    if (pdfRef.current) renderPages();
  }, [zoom, renderPages]);

  // ---- best-effort viewing deterrents ----
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // Print / Save / Copy shortcuts.
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
            className="text-secondaryBlue hover:underline text-sm font-['Inter']"
          >
            ← Back to my account
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Lock size={14} /> View-only • not downloadable
            </span>
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
