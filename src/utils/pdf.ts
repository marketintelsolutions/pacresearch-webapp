import * as pdfjsLib from "pdfjs-dist";

// Worker version is pinned to the installed pdfjs-dist so the two never drift.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default pdfjsLib;

/** Public preview endpoint (first-few-pages PDF). Override via env if needed. */
export const PREVIEW_URL =
  process.env.REACT_APP_PREVIEW_URL ||
  "https://us-central1-pacresearch-feb77.cloudfunctions.net/previewReport";
