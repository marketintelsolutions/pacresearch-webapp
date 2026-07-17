import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { ReportCategory } from "../../../types";

interface Props {
  categories: ReportCategory[];
  value: string;
  onChange: (id: string) => void;
  onAddNew: () => void;
  onRename?: (cat: ReportCategory) => void;
  onDelete?: (cat: ReportCategory) => void;
  countFor?: (id: string) => number;
}

/**
 * Custom category dropdown with a pinned "Add new category" row at the top
 * (opens a modal) and inline rename/delete on each option.
 */
const CategorySelect: React.FC<Props> = ({
  categories,
  value,
  onChange,
  onAddNew,
  onRename,
  onDelete,
  countFor,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.name : "Select a category"}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Pinned add-new row */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAddNew();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-secondaryBlue bg-secondaryBlue/5 hover:bg-secondaryBlue/10 border-b border-gray-100"
          >
            <Plus size={15} /> Add new category
          </button>

          {/* Options */}
          <div className="max-h-56 overflow-auto py-1">
            {categories.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-400">
                No categories yet — add one above.
              </p>
            ) : (
              categories.map((cat) => {
                const active = cat.id === value;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onChange(cat.id);
                      setOpen(false);
                    }}
                    className={`group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                      active ? "bg-primaryBlue/5" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-4 shrink-0 text-primaryBlue">
                      {active && <Check size={14} />}
                    </span>
                    <span className="flex-grow text-gray-800 truncate">
                      {cat.name}
                    </span>
                    {countFor && (
                      <span className="text-[11px] text-gray-400 tabular-nums">
                        {countFor(cat.id)}
                      </span>
                    )}
                    {(onRename || onDelete) && (
                      <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        {onRename && (
                          <button
                            type="button"
                            title="Rename"
                            aria-label="Rename category"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRename(cat);
                            }}
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-gray-400 hover:text-primaryBlue hover:bg-gray-100"
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            title="Delete"
                            aria-label="Delete category"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(cat);
                            }}
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
