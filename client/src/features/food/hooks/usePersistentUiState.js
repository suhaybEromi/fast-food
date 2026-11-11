import { useCallback, useEffect, useRef, useState } from "react";

import { readUiStorage, writeUiStorage } from "../utils/uiStorage";

export function usePersistentUiState(key, fallback) {
  const fallbackRef = useRef(fallback);

  const [stored, setStored] = useState(() => ({
    key,
    value: readUiStorage(key, fallback),
  }));

  useEffect(() => {
    setStored({
      key,
      value: readUiStorage(key, fallbackRef.current),
    });
  }, [key]);

  useEffect(() => {
    writeUiStorage(stored.key, stored.value);
  }, [stored]);

  const setValue = useCallback(
    updater => {
      setStored(current => ({
        key,
        value:
          typeof updater === "function"
            ? updater(
                current.key === key
                  ? current.value
                  : readUiStorage(key, fallbackRef.current),
              )
            : updater,
      }));
    },
    [key],
  );

  return [stored.key === key ? stored.value : fallback, setValue];
}
