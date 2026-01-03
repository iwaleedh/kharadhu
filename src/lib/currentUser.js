export const CURRENT_USER_ID_KEY = 'currentUserId';

export const getCurrentUserId = () => {
  try {
    return localStorage.getItem(CURRENT_USER_ID_KEY) || null;
  } catch {
    return null;
  }
};

export const setCurrentUserId = (userId) => {
  try {
    if (userId == null) localStorage.removeItem(CURRENT_USER_ID_KEY);
    else localStorage.setItem(CURRENT_USER_ID_KEY, String(userId));
  } catch {
    // ignore
  }
};
