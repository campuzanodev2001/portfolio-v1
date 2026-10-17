"use client";

import { useSyncExternalStore } from "react";
import { baTime } from "./time";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 5000);
  return () => clearInterval(id);
};

/** Hora real en Buenos Aires. En el server no hay hora: guiones. */
export default function Clock() {
  const time = useSyncExternalStore(subscribe, () => baTime(), () => "--:--");
  return <time>{time}</time>;
}
