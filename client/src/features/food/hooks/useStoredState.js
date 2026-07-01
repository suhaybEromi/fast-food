import { useCallback, useEffect, useRef, useState } from "react";

function loadStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function useStoredState(key, fallback) {
  const fallbackRef = useRef(fallback);
  const activeKeyRef = useRef(key);
  activeKeyRef.current = key;

  const [stored, setStored] = useState(() => ({
    key,
    value: loadStoredValue(key, fallback),
  }));

  useEffect(() => {
    setStored({
      key,
      value: loadStoredValue(key, fallbackRef.current),
    });
  }, [key]);

  useEffect(() => {
    localStorage.setItem(stored.key, JSON.stringify(stored.value));
  }, [stored]);

  const setValue = useCallback(updater => {
    setStored(current => ({
      key: activeKeyRef.current,
      value:
        typeof updater === "function"
          ? updater(
              current.key === activeKeyRef.current
                ? current.value
                : loadStoredValue(activeKeyRef.current, fallbackRef.current),
            )
          : updater,
    }));
  }, []);

  return [stored.key === key ? stored.value : fallbackRef.current, setValue];
}
