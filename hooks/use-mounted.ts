import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and hydration, true after; gate client-only values like the stored theme. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
