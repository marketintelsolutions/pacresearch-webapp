import React, { useEffect, useRef, useState } from "react";
import { X, Lock } from "lucide-react";
import pdfjsLib, { PREVIEW_URL } from "../../utils/pdf";

interface Props {
  open: boolean;
  editionId: string;
  title: string;
  onClose: () => void;
  onBuy: () => void;
}

/**
 * Renders the server-truncated preview PDF (first few pages only) in a modal.
 * The bytes come from the public `previewReport` function, so no auth is needed
 * and the full report is never fetched.
 */
const ReportPreviewModal: React.FC<Props> = ({
  open,
  editionId,
  title,
  onClose,
  onBuy,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setPages(0);
      try {
        const res = await fetch(
          `${PREVIEW_URL}?editionId=${encodeURIComponent(editionId)}`
        );
        if (!res.ok)
          throw new Error("Preview isn't available for this report.");
        const bytes = await res.arrayBuffer();
        if (cancelled) return;

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;
        setPages(pdf.numPages);

        const container = containerRef.current;
        if (container) {
          container.innerHTML = "";
          const width = Math.min(container.clientWidth || 640, 800);
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const unscaled = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({
              scale: width / unscaled.width,
            });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.className = "mx-auto mb-4 shadow rounded max-w-full";
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            container.appendChild(canvas);
            await page.render({ canvasContext: ctx, viewport }).promise;
          }
        }
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Preview failed to load.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, editionId]);

  // View-only deterrents while the preview is open (mirrors the secure reader).
  useEffect(() => {
    if (!open) return;
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
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
  }, [open]);

  if (!open) return null;

  return (
    <div className="preview-modal fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Hide the preview from print output. */}
      <style>{`
        @media print { .preview-modal { display: none !important; } }
        .preview-viewer, .preview-viewer canvas {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
      `}</style>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[75vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="min-w-0">
            <h3 className="font-semibold text-primaryBlue">Preview</h3>
            <p className="text-xs text-gray-500 truncate">
              {title}
              {pages > 0 && ` • first ${pages} page${pages > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          {loading && (
            <div className="py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primaryBlue border-r-transparent" />
              <p className="mt-3 text-sm text-gray-500">Loading preview…</p>
            </div>
          )}
          {error && (
            <div className="py-16 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          <div ref={containerRef} className="preview-viewer" />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t bg-white">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Lock size={12} /> Preview only — buy to read in full
          </span>
          <button
            onClick={onBuy}
            className="px-5 py-2.5 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 whitespace-nowrap"
          >
            Buy full report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
