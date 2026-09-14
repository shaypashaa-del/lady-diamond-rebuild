import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Returns false during SSR/first paint and true after hydration, without
// triggering the "no setState in effect" lint rule.
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
