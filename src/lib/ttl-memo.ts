// Per-process memo with a short time-to-live, for data read on every page render
// (navigation categories, announcement bar). Concurrent callers share one load.
export function ttlMemo<A extends unknown[], T>(fn: (...args: A) => Promise<T>, ttlMs: number) {
  const store = new Map<string, { at: number; value: T }>();
  const inflight = new Map<string, Promise<T>>();
  return async (...args: A): Promise<T> => {
    const key = JSON.stringify(args);
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.value;
    let p = inflight.get(key);
    if (!p) {
      p = fn(...args)
        .then((value) => {
          store.set(key, { at: Date.now(), value });
          return value;
        })
        .finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    try {
      return await p;
    } catch (err) {
      if (hit) return hit.value; // serve the last good copy if the refresh fails
      throw err;
    }
  };
}
