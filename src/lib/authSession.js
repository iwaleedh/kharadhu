import { getCurrentUserId } from './currentUser';

export const requireUserId = () => {
  const userId = Number(getCurrentUserId());
  if (!Number.isFinite(userId)) return null;
  return userId;
};
