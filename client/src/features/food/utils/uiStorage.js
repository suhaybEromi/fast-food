const SENSITIVE_STORAGE_KEY_PATTERN =
  /(auth|cookie|csrf|jwt|password|secret|session|token)/i;

const assertUiStorageKey = key => {
  if (SENSITIVE_STORAGE_KEY_PATTERN.test(String(key))) {
    throw new Error(
      "Security-sensitive values must use secure server cookies, not browser storage.",
    );
  }
};

export const readUiStorage = (key, fallback) => {
  assertUiStorageKey(key);

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const writeUiStorage = (key, value) => {
  assertUiStorageKey(key);

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // UI persistence is optional; auth/session state never belongs here.
  }
};

export const removeUiStorage = key => {
  assertUiStorageKey(key);

  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to recover: stale guest UI state can be ignored.
  }
};
