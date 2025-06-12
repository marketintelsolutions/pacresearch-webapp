import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";

interface NewsCommentaryItem {
  id?: string;
  title: string;
  description: string;
  interviewer: string;
  videoUrl: string;
  thumbnailUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const NewsCommentaryManager: React.FC = () => {
  const [items, setItems] = useState<NewsCommentaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<NewsCommentaryItem | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  // YouTube thumbnail helper
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    )?.[1];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return "";
  };

  // Initialize empty item
  const createEmptyItem = (): NewsCommentaryItem => ({
    title: "",
    description: "",
    interviewer: "",
    videoUrl: "",
    thumbnailUrl: "",
    displayOrder: items.length,
    isActive: true,
  });

  // Fetch items from Firestore
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "newsCommentary"),
        orderBy("displayOrder", "asc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedItems: NewsCommentaryItem[] = [];

      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as NewsCommentaryItem);
      });

      setItems(fetchedItems);
    } catch (err) {
      setError("Failed to fetch news commentary items");
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Clear messages after timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success || error) {
      timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, error]);

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    const storageRef = ref(
      storage,
      `news-commentary/${Date.now()}_${file.name}`
    );
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  // Handle save/update item
  const handleSaveItem = async (item: NewsCommentaryItem) => {
    setSaving(true);
    try {
      const itemData = {
        ...item,
        updatedAt: serverTimestamp(),
      };

      if (item.id) {
        // Update existing item
        await updateDoc(doc(db, "newsCommentary", item.id), itemData);
        setSuccess("Item updated successfully");
      } else {
        // Create new item
        itemData.createdAt = serverTimestamp();
        await addDoc(collection(db, "newsCommentary"), itemData);
        setSuccess("Item created successfully");
      }

      setShowForm(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      setError("Failed to save item");
      console.error("Error saving item:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string, thumbnailUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "newsCommentary", itemId));

      // Delete custom thumbnail from Storage if it exists and is not YouTube auto-generated
      if (thumbnailUrl && !thumbnailUrl.includes("img.youtube.com")) {
        try {
          const thumbnailRef = ref(storage, thumbnailUrl);
          await deleteObject(thumbnailRef);
        } catch (storageErr) {
          console.warn("Failed to delete thumbnail from storage:", storageErr);
        }
      }

      setSuccess("Item deleted successfully");
      fetchItems();
    } catch (err) {
      setError("Failed to delete item");
      console.error("Error deleting item:", err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    itemId: string
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");

    if (draggedId === targetId) return;

    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedItems = [...items];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);

    // Update display orders
    const updates = reorderedItems.map((item, index) => ({
      ...item,
      displayOrder: index,
    }));

    setItems(updates);

    // Update in Firestore
    try {
      const updatePromises = updates.map((item) =>
        updateDoc(doc(db, "newsCommentary", item.id!), {
          displayOrder: item.displayOrder,
          updatedAt: serverTimestamp(),
        })
      );
      await Promise.all(updatePromises);
      setSuccess("Order updated successfully");
    } catch (err) {
      setError("Failed to update order");
      console.error("Error updating order:", err);
      fetchItems(); // Revert on error
    }

    setDraggedItem(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage News Commentary</h2>
        <button
          onClick={() => {
            setEditingItem(createEmptyItem());
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Item
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const displayThumbnail =
              item.thumbnailUrl || getYouTubeThumbnail(item.videoUrl);
            const isAutoThumbnail =
              item.thumbnailUrl === getYouTubeThumbnail(item.videoUrl) ||
              (!item.thumbnailUrl && item.videoUrl);

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id!)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id!)}
                className={`p-4 border rounded-lg ${
                  item.id === draggedItem
                    ? "opacity-40"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="cursor-move text-gray-500">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="8" cy="6" r="1" />
                      <circle cx="15" cy="6" r="1" />
                      <circle cx="8" cy="12" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="8" cy="18" r="1" />
                      <circle cx="15" cy="18" r="1" />
                    </svg>
                  </div>

                  <div className="text-lg font-medium text-gray-600 w-8">
                    #{index + 1}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-2">
                      {displayThumbnail && (
                        <div className="relative">
                          <img
                            src={displayThumbnail}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="absolute -bottom-1 -right-1">
                            {isAutoThumbnail ? (
                              <div
                                className="w-3 h-3 bg-blue-500 rounded-full border border-white"
                                title="Auto-generated thumbnail"
                              ></div>
                            ) : (
                              <div
                                className="w-3 h-3 bg-green-500 rounded-full border border-white"
                                title="Custom thumbnail"
                              ></div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          by {item.interviewer}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        {item.videoUrl && (
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Video
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteItem(item.id!, item.thumbnailUrl)
                      }
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Form */}
      {showForm && editingItem && (
        <div className="mt-6 border-t pt-6">
          <NewsCommentaryForm
            item={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            onFileUpload={handleFileUpload}
            saving={saving}
            getYouTubeThumbnail={getYouTubeThumbnail}
          />
        </div>
      )}
    </div>
  );
};

// Form Component
interface NewsCommentaryFormProps {
  item: NewsCommentaryItem;
  onSave: (item: NewsCommentaryItem) => Promise<void>;
  onCancel: () => void;
  onFileUpload: (file: File) => Promise<string>;
  saving: boolean;
  getYouTubeThumbnail: (url: string) => string;
}

const NewsCommentaryForm: React.FC<NewsCommentaryFormProps> = ({
  item,
  onSave,
  onCancel,
  onFileUpload,
  saving,
  getYouTubeThumbnail,
}) => {
  const [formData, setFormData] = useState(item);
  const [uploading, setUploading] = useState(false);
  const [autoThumbnail, setAutoThumbnail] = useState<string>("");

  const handleInputChange = (field: keyof NewsCommentaryItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate thumbnail when video URL changes
    if (field === "videoUrl" && value) {
      const generatedThumbnail = getYouTubeThumbnail(value);
      setAutoThumbnail(generatedThumbnail);
      // Set auto-generated thumbnail if no custom thumbnail exists
      if (
        !formData.thumbnailUrl ||
        formData.thumbnailUrl.includes("img.youtube.com")
      ) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: generatedThumbnail }));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const downloadURL = await onFileUpload(file);
      setFormData((prev) => ({ ...prev, thumbnailUrl: downloadURL }));
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const useAutoThumbnail = () => {
    if (autoThumbnail) {
      setFormData((prev) => ({ ...prev, thumbnailUrl: autoThumbnail }));
    }
  };

  // Initialize auto-thumbnail on component mount
  useEffect(() => {
    if (formData.videoUrl) {
      const generatedThumbnail = getYouTubeThumbnail(formData.videoUrl);
      setAutoThumbnail(generatedThumbnail);
    }
  }, [formData.videoUrl, getYouTubeThumbnail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const currentThumbnail = formData.thumbnailUrl || autoThumbnail;
  const isUsingAutoThumbnail =
    formData.thumbnailUrl === autoThumbnail ||
    formData.thumbnailUrl.includes("img.youtube.com");
  const isCustomThumbnail =
    formData.thumbnailUrl && !formData.thumbnailUrl.includes("img.youtube.com");

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {item.id ? "Edit" : "Add"} News Commentary Item
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Interviewer
            </label>
            <input
              type="text"
              value={formData.interviewer}
              onChange={(e) => handleInputChange("interviewer", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://youtube.com/watch?v=..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Thumbnail Image
          </label>

          {/* Show auto-generated thumbnail option */}
          {autoThumbnail && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">
                  Auto-generated from YouTube
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={autoThumbnail}
                  alt="Auto-generated thumbnail"
                  className="w-24 h-16 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={useAutoThumbnail}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    isUsingAutoThumbnail
                      ? "bg-blue-100 text-blue-700 cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={isUsingAutoThumbnail}
                >
                  {isUsingAutoThumbnail
                    ? "Currently Using"
                    : "Use Auto-Generated"}
                </button>
              </div>
            </div>
          )}

          {/* Custom upload section */}
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Upload a custom thumbnail or use the auto-generated YouTube
              thumbnail above
            </p>
          </div>

          {uploading && (
            <div className="mt-2 text-sm text-blue-600">
              Uploading custom thumbnail...
            </div>
          )}

          {/* Show current thumbnail preview */}
          {currentThumbnail && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Current Thumbnail:</span>
                {isCustomThumbnail ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Custom Upload
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Auto-Generated
                  </span>
                )}
              </div>
              <img
                src={currentThumbnail}
                alt="Current thumbnail preview"
                className="w-40 h-24 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsCommentaryManager;
