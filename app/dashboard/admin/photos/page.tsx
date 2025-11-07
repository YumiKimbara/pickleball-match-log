'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Photo {
  entity_id: number;
  photo_url: string;
  type: 'user' | 'opponent' | 'match';
  name?: string;
  email?: string;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      const res = await fetch('/api/admin/photos');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(type: string, entityId: number) {
    if (!confirm('Delete this photo?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, entityId }),
      });

      if (res.ok) {
        setPhotos(photos.filter(p => !(p.type === type && p.entity_id === entityId)));
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete photo');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const userPhotos = photos.filter(p => p.type === 'user');
  const opponentPhotos = photos.filter(p => p.type === 'opponent');
  const matchPhotos = photos.filter(p => p.type === 'match');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard/admin"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Photo Management</h1>
        <p className="text-gray-600 mt-2">
          {photos.length} photos total ({userPhotos.length} users, {opponentPhotos.length} opponents, {matchPhotos.length} matches)
        </p>
      </div>

      {/* User Photos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPhotos.map((photo) => (
            <div key={`user-${photo.entity_id}`} className="bg-white rounded-lg shadow p-4">
              <div className="relative w-full h-48 mb-3 bg-gray-100 rounded">
                <Image
                  src={photo.photo_url}
                  alt={photo.name || 'User photo'}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="mb-2">
                <p className="font-semibold">{photo.name || '(no name)'}</p>
                <p className="text-sm text-gray-600">{photo.email}</p>
                <p className="text-xs text-gray-400">User ID: {photo.entity_id}</p>
              </div>
              <button
                onClick={() => handleDelete('user', photo.entity_id)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Photo
              </button>
            </div>
          ))}
          {userPhotos.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No user photos
            </div>
          )}
        </div>
      </div>

      {/* Opponent Photos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Opponent Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opponentPhotos.map((photo) => (
            <div key={`opponent-${photo.entity_id}`} className="bg-white rounded-lg shadow p-4">
              <div className="relative w-full h-48 mb-3 bg-gray-100 rounded">
                <Image
                  src={photo.photo_url}
                  alt={photo.name || 'Opponent photo'}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="mb-2">
                <p className="font-semibold">{photo.name || '(no name)'}</p>
                {photo.email && <p className="text-sm text-gray-600">{photo.email}</p>}
                <p className="text-xs text-gray-400">Opponent ID: {photo.entity_id}</p>
              </div>
              <button
                onClick={() => handleDelete('opponent', photo.entity_id)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Photo
              </button>
            </div>
          ))}
          {opponentPhotos.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No opponent photos
            </div>
          )}
        </div>
      </div>

      {/* Match Photos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Match Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchPhotos.map((photo) => (
            <div key={`match-${photo.entity_id}`} className="bg-white rounded-lg shadow p-4">
              <div className="relative w-full h-48 mb-3 bg-gray-100 rounded">
                <Image
                  src={photo.photo_url}
                  alt="Match photo"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-600">Match ID: {photo.entity_id}</p>
              </div>
              <button
                onClick={() => handleDelete('match', photo.entity_id)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Photo
              </button>
            </div>
          ))}
          {matchPhotos.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No match photos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

