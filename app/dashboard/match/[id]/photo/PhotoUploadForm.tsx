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
          <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="block w-full h-14 text-base text-gray-700 mb-4 border-2 border-gray-300 rounded-lg px-2
            file:mr-4 file:py-3 file:px-6
            file:rounded-full file:border-0
            file:text-base file:font-bold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

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
          className="w-full h-16 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isUploading ? "Uploading..." : "📷 Upload Photo"}
        </button>

        {error && error.includes('Network') ? (
          <button
            onClick={handleRetryLater}
            className="w-full h-16 mt-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg"
          >
            I'll Add Photo Later
          </button>
        ) : (
          <button
            onClick={handleSkip}
            disabled={isUploading}
            className="w-full h-16 mt-3 bg-gray-200 text-gray-900 rounded-lg font-bold text-lg hover:bg-gray-300 disabled:opacity-50 shadow-lg"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}


