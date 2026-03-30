const STORAGE_PREFIX = 'femnexa_';

function encode(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function decode<T>(encoded: string): T {
  return JSON.parse(decodeURIComponent(atob(encoded)));
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return fallback;
      return decode<T>(raw);
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(STORAGE_PREFIX + key, encode(value));
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clearAll(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },

  exportAll(): string {
    const data: Record<string, unknown> = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => {
        try {
          data[k.replace(STORAGE_PREFIX, '')] = decode(localStorage.getItem(k)!);
        } catch {
          data[k.replace(STORAGE_PREFIX, '')] = localStorage.getItem(k);
        }
      });
    return JSON.stringify(data, null, 2);
  },

  getStorageSize(): number {
    let total = 0;
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => {
        total += (localStorage.getItem(k) || '').length * 2;
      });
    return total;
  },
};
