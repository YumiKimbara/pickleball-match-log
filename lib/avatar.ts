import { createAvatar } from '@dicebear/core';
import { personas } from '@dicebear/collection';

export function getAvatarUrl(
  photoUrl: string | null,
  name: string,
  email: string | null
): string {
  if (photoUrl) return photoUrl;

  // Use email as seed if available, otherwise use name
  // This ensures the same person always gets the same avatar
  const seed = email || name;

  const avatar = createAvatar(personas, {
    seed,
    // Friendly illustrated style with consistent generation
    size: 128,
  });

  return avatar.toDataUri();
}
