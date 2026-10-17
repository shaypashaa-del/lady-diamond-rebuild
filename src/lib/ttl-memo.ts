// Per-process memo with a short time-to-live, for data read on every page render
// (navigation categories, announcement bar). Concurrent callers share one load.
//
// With `swr: true` an expired entry is still returned instantly while a fresh
// copy loads in the background, so visitors never wait on the database after the
// first load of that key.
//
// `name` identifies the cache on globalThis: the server start-up hook (warm-up)
// and the page routes are separate bundles, so module-level state would not be
// shared between them, but globalThis is.
type Entry = { store: Map<string, { at: number; value: unknown }>; inflight: Map<string, Promise<unknown>> };
const registry = globalThis as unknown as { __ttlMemo?: Map<string, Entry> };

export function ttlMemo<A extends unknown[], T>(
  name: string,
  fn: (...args: A) => Promise<T>,
  ttlMs: number,
  opts: { swr?: boolean } = {}
) {
  const all = (registry.__ttlMemo ??= new Map());
  let entry = all.get(name);
  if (!entry) all.set(name, (entry = { store: new Map(), inflight: new Map() }));
  const store = entry.store as Map<string, { at: number; value: T }>;
  const inflight = entry.inflight as Map<string, Promise<T>>;
  return async (...args: A): Promise<T> => {
    const key = JSON.stringify(args);
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.value;
    if (store.size > 500) store.clear(); // bound memory
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
    if (hit && opts.swr) {
      p.catch(() => undefined);
      return hit.value;
    }
    try {
      return await p;
    } catch (err) {
      if (hit) return hit.value; // serve the last good copy if the refresh fails
      throw err;
    }
  };
}
