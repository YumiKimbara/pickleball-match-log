'use client';

interface DeleteUserButtonProps {
  userId: number;
  userEmail: string;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function DeleteUserButton({ userId, userEmail, onDelete }: DeleteUserButtonProps) {
  return (
    <form action={onDelete} className="inline">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="userEmail" value={userEmail} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Delete user ${userEmail}?\n\nThis will permanently delete:\n• User account\n• All their matches\n• All their opponents\n\nThis cannot be undone!`)) {
            e.preventDefault();
          }
        }}
        className="text-red-600 hover:text-red-800 font-semibold"
      >
        🗑️ Delete
      </button>
    </form>
  );
}

