import React, { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import pdfjsLib, { PREVIEW_URL } from "../../utils/pdf";
import { formatNaira } from "../../utils/format";

interface Props {
  editionId: string;
  price?: number;
  onBuy: () => void;
}

/**
 * Inline, read-in-page preview (not a modal) of the opening pages of a report.
 * The lower half of the last previewed page gradually blurs and fades out as a
 * teaser, with a purchase CTA beneath. Bytes come from the public previewReport
 * function, so no auth and the rest of the report never reaches the browser.
 */
const ReportPreview: React.FC<Props> = ({ editionId, price, onBuy }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Height (px) of the fade/blur overlay = half the last page.
  const [overlayHeight, setOverlayHeight] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setOverlayHeight(0);
      try {
        const res = await fetch(
          `${PREVIEW_URL}?editionId=${encodeURIComponent(editionId)}`
        );
        if (!res.ok) throw new Error("Preview isn't available for this report.");
        const bytes = await res.arrayBuffer();
        if (cancelled) return;

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (container) {
          container.innerHTML = "";
          const width = Math.min(container.clientWidth || 640, 780);
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const unscaled = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({ scale: width / unscaled.width });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.className = "mx-auto mb-5 shadow rounded max-w-full last:mb-0";
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            container.appendChild(canvas);
            await page.render({ canvasContext: ctx, viewport }).promise;
          }
          // Blur/fade the bottom half of the last previewed page.
          const last = container.lastElementChild as HTMLElement | null;
          if (last && !cancelled) {
            setOverlayHeight(Math.round(last.getBoundingClientRect().height / 2));
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
  }, [editionId]);

  return (
    <div className="preview-inline">
      {/* View-only deterrents on the preview area only. */}
      <style>{`
        .preview-inline canvas { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
      `}</style>

      <div
        className="relative bg-gray-100 rounded-2xl p-4 md:p-8 overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primaryBlue border-r-transparent" />
            <p className="mt-3 text-sm text-gray-500">Loading preview…</p>
          </div>
        )}
        {error && (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        )}

        <div ref={containerRef} />

        {/* Gradual blur (mask ramps the blur strength) + fade to the surface. */}
        {overlayHeight > 0 && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: overlayHeight,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 60%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 60%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: overlayHeight,
                background:
                  "linear-gradient(to bottom, rgba(243,244,246,0) 0%, rgba(243,244,246,0.85) 78%, #f3f4f6 100%)",
              }}
            />
          </>
        )}
      </div>

      {/* Purchase CTA beneath the faded preview. */}
      {!loading && !error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-3">
            This is a short preview. Purchase to read the full report securely.
          </p>
          <button
            onClick={onBuy}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90"
          >
            <Lock size={16} />
            {price != null
              ? `Buy for ${formatNaira(price)}`
              : "Buy & read in full"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportPreview;
