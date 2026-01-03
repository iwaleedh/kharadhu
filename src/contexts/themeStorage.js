// Non-React helpers for theme persistence.

export const getCurrentUserId = () => {
  try {
    return localStorage.getItem('currentUserId') || null;
  } catch {
    return null;
  }
};

export const storageKey = (userId) =>
  userId ? `faaraveri_theme_${userId}` : 'faaraveri_theme';
