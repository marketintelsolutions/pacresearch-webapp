import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

interface Props {
  file: File | null;
  /** Existing cover URL when editing a report. */
  existingUrl?: string;
  onChange: (file: File | null) => void;
}

/**
 * Click-or-drag cover image picker with a live preview. Falls back to the
 * report's existing cover when editing and no new file is chosen.
 */
const CoverImagePicker: React.FC<Props> = ({ file, existingUrl, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || existingUrl || null;

  const pick = (f: File | null) => {
    if (f && !f.type.startsWith("image/")) return;
    onChange(f);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    pick(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Cover image
      </label>
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
        className={`group relative h-44 rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition flex items-center justify-center ${
          dragOver
            ? "border-secondaryBlue bg-secondaryBlue/5"
            : "border-gray-300 bg-gray-50 hover:border-primaryBlue/50"
        }`}
      >
        {shown ? (
          <>
            <img
              src={shown}
              alt="cover preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-sm opacity-0 group-hover:opacity-100 transition">
              <span className="inline-flex items-center gap-1.5">
                <ImagePlus size={16} /> Change image
              </span>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 px-4">
            <ImagePlus className="mx-auto mb-1.5" size={24} />
            <p className="text-xs font-medium text-gray-500">
              Click or drag an image here
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">PNG or JPG</p>
          </div>
        )}
      </div>

      {(file || existingUrl) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="truncate max-w-[70%] text-gray-500">
            {file ? file.name : "Current cover"}
          </span>
          {file && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
            >
              <X size={12} /> Remove
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />
    </div>
  );
};

export default CoverImagePicker;
