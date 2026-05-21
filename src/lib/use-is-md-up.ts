"use client";

import { useSyncExternalStore } from "react";

const MD_UP_QUERY = "(min-width: 768px)";

function subscribeMdUp(onStoreChange: () => void) {
  const mq = window.matchMedia(MD_UP_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMdUpSnapshot() {
  return window.matchMedia(MD_UP_QUERY).matches;
}

/** True from the `md` breakpoint up (768px). False on server and before hydrate. */
export function useIsMdUp() {
  return useSyncExternalStore(
    subscribeMdUp,
    getMdUpSnapshot,
    () => false,
  );
}
