import { requireAdmin } from '@/lib/auth-guards';
import { db } from '@/lib/db';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { ADMIN_EMAIL } from '@/lib/constants';
import DeleteUserButton from './DeleteUserButton';

async function deleteUser(formData: FormData) {
  'use server';
  await requireAdmin();
  
  const userId = parseInt(formData.get('userId') as string);
  const userEmail = formData.get('userEmail') as string;
  
  // Prevent deleting the admin account
  if (userEmail === ADMIN_EMAIL) {
    throw new Error('Cannot delete the admin account');
  }
  
  await db.deleteUser(userId);
  revalidatePath('/dashboard/admin/users');
}

export default async function AdminUsersPage() {
  // This ensures only admins can access this page
  await requireAdmin();

  // Fetch all users from the database (including their roles)
  const users = await db.getAllUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard/admin"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">
          All users in the system (roles fetched from database)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ELO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name || '(not set)'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'admin' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      👑 Admin
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      👤 User
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(Number(user.elo))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.email === ADMIN_EMAIL ? (
                    <span className="text-gray-400 text-xs">Protected</span>
                  ) : (
                    <DeleteUserButton 
                      userId={user.id}
                      userEmail={user.email}
                      onDelete={deleteUser}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About Roles</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Roles are stored in the <code className="bg-blue-100 px-1 rounded">users</code> table in the database</li>
          <li>• <code className="bg-blue-100 px-1 rounded">a13158y@gmail.com</code> is set as admin during user creation</li>
          <li>• All other emails are set as regular users</li>
          <li>• Roles are fetched from DB on every session refresh</li>
        </ul>
      </div>
    </div>
  );
}

