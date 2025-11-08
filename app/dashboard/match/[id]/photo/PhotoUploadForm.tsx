"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PhotoUploadFormProps {
  matchId: number;
}

export default function PhotoUploadForm({ matchId }: PhotoUploadFormProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a photo first");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const response = await fetch(`/api/matches/${matchId}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload photo";
      if (errorMessage.includes('network') || errorMessage.includes('offline') || errorMessage.includes('fetch')) {
        setError("Network error. Your match is saved. You can retry uploading the photo later from your match history.");
      } else {
        setError(errorMessage);
      }
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleRetryLater = () => {
    // Match is already saved, just go to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Add a photo?</h1>
        <p className="text-gray-600 mb-6">Capture this moment with your opponent!</p>

        {previewUrl && (
          <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden border-4 border-green-200">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <label className="block w-full h-14 mb-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center justify-center h-full text-blue-600 font-semibold">
            {selectedFile ? (
              <span>✓ {selectedFile.name}</span>
            ) : (
              <span>📁 Choose File</span>
            )}
          </div>
        </label>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold text-sm">{error}</p>
            {error.includes('Network') && (
              <p className="text-red-500 text-xs mt-2">
                ✓ Don't worry - your match data is already saved!
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full h-16 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          {isUploading ? "Uploading..." : "📷 Upload Photo"}
        </button>

        {error && error.includes('Network') ? (
          <button
            onClick={handleRetryLater}
            className="w-full h-16 mt-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg"
          >
            I'll Add Photo Later
          </button>
        ) : (
          <button
            onClick={handleSkip}
            disabled={isUploading}
            className="w-full h-16 mt-3 bg-gray-200 text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-300 disabled:opacity-50 shadow-lg"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}


