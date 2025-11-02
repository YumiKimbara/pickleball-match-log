import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

export function getAvatarUrl(
  photoUrl: string | null,
  name: string,
  email: string | null
): string {
  if (photoUrl) return photoUrl;

  // Use email as seed if available, otherwise use name
  const seed = email || name;

  const avatar = createAvatar(initials, {
    seed,
    backgroundColor: ['00897b', '00acc1', '039be5', '3f51b5', '5e35b1', '8e24aa'],
  });

  return avatar.toDataUri();
}
