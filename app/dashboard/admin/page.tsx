import { requireAdmin } from '@/lib/auth-guards';
import Link from 'next/link';

export default async function AdminDashboard() {
  // This ensures only admins can access this page
  const session = await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Welcome, {session.user.email}! You have admin privileges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">👥 User Management</h2>
          <p className="text-gray-600 mb-4">
            View and manage all users in the system
          </p>
          <Link 
            href="/dashboard/admin/users"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Users →
          </Link>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">🎯 Opponent Management</h2>
          <p className="text-gray-600 mb-4">
            View, edit, and delete all opponents
          </p>
          <Link 
            href="/dashboard/admin/opponents"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Opponents →
          </Link>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">🔗 Duplicate Detection</h2>
          <p className="text-gray-600 mb-4">
            Find and merge duplicate users/opponents
          </p>
          <Link 
            href="/dashboard/admin/duplicates"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Find Duplicates →
          </Link>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">📧 Invite Management</h2>
          <p className="text-gray-600 mb-4">
            View, expire, and delete invite tokens
          </p>
          <Link 
            href="/dashboard/admin/invites"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Invites →
          </Link>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">📸 Photo Management</h2>
          <p className="text-gray-600 mb-4">
            View and delete photos from all entities
          </p>
          <Link 
            href="/dashboard/admin/photos"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Photos →
          </Link>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">🏓 Match Management</h2>
          <p className="text-gray-600 mb-4">
            Edit scores and delete matches
          </p>
          <Link 
            href="/dashboard/admin/matches"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Matches →
          </Link>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">📊 ELO Recalculation</h2>
          <p className="text-gray-600 mb-4">
            Recalculate ELO ratings for all users
          </p>
          <Link 
            href="/dashboard/admin/stats"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            System Tools →
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <Link 
          href="/dashboard"
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

