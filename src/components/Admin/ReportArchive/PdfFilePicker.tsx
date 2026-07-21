import React, { useRef, useState } from "react";
import { FileUp, FileText, X } from "lucide-react";

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
}

const prettySize = (bytes: number) =>
  bytes >= 1_048_576
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Click-or-drag PDF picker showing the chosen file's name and size. */
const PdfFilePicker: React.FC<Props> = ({
  file,
  onChange,
  label = "Report file (PDF)",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = (f: File | null) => {
    if (f && f.type !== "application/pdf") return;
    onChange(f);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-primaryBlue/20 bg-primaryBlue/[0.03]">
          <span className="p-2 rounded-lg bg-primaryBlue/10 text-primaryBlue shrink-0">
            <FileText size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{prettySize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              pick(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            title="Remove file"
            aria-label="Remove file"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pick(e.dataTransfer.files?.[0] || null);
          }}
          className={`h-28 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition ${
            dragOver
              ? "border-secondaryBlue bg-secondaryBlue/5"
              : "border-gray-300 bg-gray-50 hover:border-primaryBlue/50"
          }`}
        >
          <FileUp className="text-gray-400 mb-1.5" size={22} />
          <p className="text-xs font-medium text-gray-500">
            Click or drag the PDF here
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">PDF only</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />
    </div>
  );
};

export default PdfFilePicker;
