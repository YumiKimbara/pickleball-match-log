"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface PhotoUploadModalProps {
  opponentId: number;
  opponentName: string;
  currentPhotoUrl: string | null;
  onClose: () => void;
}

export default function PhotoUploadModal({
  opponentId,
  opponentName,
  currentPhotoUrl,
  onClose,
}: PhotoUploadModalProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select a photo");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", fileInputRef.current.files[0]);
      formData.append("opponentId", opponentId.toString());

      const response = await fetch("/api/opponents/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload photo");
      }

      router.refresh();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload photo";
      if (errorMessage.includes('network') || errorMessage.includes('offline') || errorMessage.includes('fetch')) {
        setError("Network error. Please check your connection and try again. You can also retry later - the opponent info is saved.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentPhotoUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/opponents/photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove photo");
      }

      setPreview(null);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Update Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Upload a photo for <strong>{opponentName}</strong>
        </p>

        {/* Preview Area */}
        <div className="mb-6">
          <div className="relative w-48 h-48 mx-auto mb-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-full border-4 border-gray-200 shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-200">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />

          <label
            htmlFor="photo-upload"
            className="block w-full text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors font-medium"
          >
            📷 Choose Photo
          </label>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpload}
            disabled={!preview || isUploading || !fileInputRef.current?.files?.[0]}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Uploading..." : "Upload Photo"}
          </button>

          {currentPhotoUrl && (
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 active:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Remove Current Photo
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
