import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((current: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);

      if (stored === null) {
        return initialValue;
      }

      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // La persistance locale peut échouer si le navigateur
      // bloque le stockage ou si le quota est dépassé.
    }
  }, [key, value]);

  const updateValue = useCallback(
    (nextValue: T | ((current: T) => T)) => {
      setValue((current) =>
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(current)
          : nextValue
      );
    },
    []
  );

  return [value, updateValue];
}