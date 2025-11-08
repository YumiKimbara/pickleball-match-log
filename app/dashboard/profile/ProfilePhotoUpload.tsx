'use client';

import { useState } from 'react';

interface PhotoUploadProps {
  currentPhotoUrl: string | null;
  userName: string;
  userEmail: string;
  userId: number;
  onPhotoUpload: (file: File) => Promise<string>;
  onPhotoRemove: () => Promise<void>;
}

export default function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  userName, 
  userEmail, 
  userId,
  onPhotoUpload,
  onPhotoRemove
}: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onPhotoUpload(selectedFile);
      
      alert('✅ Photo updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove your profile photo? Your avatar will be auto-generated.')) {
      return;
    }

    setIsUploading(true);
    try {
      await onPhotoRemove();
      alert('✅ Photo removed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Remove error:', error);
      alert('❌ Failed to remove photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="flex flex-col items-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isUploading ? '⏳ Uploading...' : '✓ Confirm Upload'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              disabled={isUploading}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!previewUrl && (
        <div className="flex flex-col items-center gap-3">
          <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            📷 Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          
          {currentPhotoUrl && (
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
            >
              Remove Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
