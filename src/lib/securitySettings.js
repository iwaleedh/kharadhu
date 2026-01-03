// Simple localStorage-backed security settings (device-local)
const KEY = 'kharadhu_security_settings_v1';

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const write = (obj) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj || {}));
  } catch {
    // ignore
  }
};

export const getSecuritySettings = () => {
  const s = read();
  return {
    requirePinOnSwitch: s.requirePinOnSwitch ?? true,
    idleTimeoutMinutes: s.idleTimeoutMinutes ?? 0,
  };
};

export const updateSecuritySettings = (updates) => {
  const cur = read();
  write({ ...cur, ...updates });
};
