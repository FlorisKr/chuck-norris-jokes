import type * as z from "zod";

export function createLocalStorageStore<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  const listeners = new Set<() => void>();
  // React needs the same value back while nothing changed, so the parse is cached per stored string
  let cachedRaw: string | null = null;
  let cachedValue = fallback;

  function parse(raw: string | null): T {
    if (raw === null) {
      return fallback;
    }
    try {
      const result = schema.safeParse(JSON.parse(raw));
      return result.success ? result.data : fallback;
    } catch {
      // Corrupt storage shouldn't crash the app, so it counts as nothing stored
      return fallback;
    }
  }

  function readRaw(): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      // Browsers that block site data throw on access, which would otherwise crash the render
      return null;
    }
  }

  function get(): T {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw);
    }
    return cachedValue;
  }

  function set(value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { get, set, subscribe };
}
