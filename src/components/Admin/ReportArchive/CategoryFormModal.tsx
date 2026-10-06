import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  initialName?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void> | void;
}

/** Small centered modal with a single name field, for add / rename category. */
const CategoryFormModal: React.FC<Props> = ({
  open,
  title,
  initialName = "",
  submitLabel = "Save",
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setSaving(false);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open, initialName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primaryBlue">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit}>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue"
            required
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
