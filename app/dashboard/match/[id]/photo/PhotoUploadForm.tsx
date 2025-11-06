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
      setError(err.message || "Failed to upload photo");
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
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
          className="block w-full text-sm text-gray-500 mb-4
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full h-12 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload Photo"}
        </button>

        <button
          onClick={handleSkip}
          disabled={isUploading}
          className="w-full h-12 mt-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}


