import { requireAuth } from '@/lib/auth-guards';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAvatarUrl } from '@/lib/avatar';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import { put } from '@vercel/blob';

async function updateProfile(formData: FormData) {
  'use server';
  const session = await requireAuth();
  
  const name = formData.get('name') as string;
  
  if (!name || name.trim().length === 0) {
    throw new Error('Name is required');
  }

  await db.updateUserName(session.user.id, name.trim());
  revalidatePath('/dashboard/profile');
  redirect('/dashboard/profile');
}

async function uploadPhoto(file: File) {
  'use server';
  const session = await requireAuth();
  
  try {
    const blob = await put(`user-photos/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: 'public',
    });
    
    await db.updateUserPhoto(session.user.id, blob.url);
    revalidatePath('/dashboard/profile');
    return blob.url;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw new Error('Failed to upload photo');
  }
}

async function removePhoto() {
  'use server';
  const session = await requireAuth();
  await db.updateUserPhoto(session.user.id, null);
  revalidatePath('/dashboard/profile');
}

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await db.getUserById(session.user.id);

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={getAvatarUrl(user.photo_url, user.name, user.email)}
            alt={user.name || 'User'}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
          />
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">{user.name || 'No name set'}</h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              ELO: {user.elo}
            </div>
          </div>

          <ProfilePhotoUpload
            currentPhotoUrl={user.photo_url}
            userName={user.name || 'User'}
            userEmail={user.email}
            userId={user.id}
            onPhotoUpload={uploadPhoto}
            onPhotoRemove={removePhoto}
          />
        </div>

        {/* Edit Form */}
        <form action={updateProfile} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={user.name || ''}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              💾 Save Changes
            </button>
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Info</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Member since: {new Date(user.created_at).toLocaleDateString()}</li>
            <li>• Last updated: {new Date(user.updated_at).toLocaleDateString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

