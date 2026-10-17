"use client";

import { useEffect } from "react";
import { mountHero } from "./hero";
import { mountPress } from "./press";

/** Renders nothing: wires behaviour onto the server-rendered page. */
export default function Enhance() {
  useEffect(() => {
    const root = document.getElementById("imprenta");
    if (!root) return;
    const a = mountHero(root);
    const b = mountPress(root);
    return () => {
      a();
      b();
    };
  }, []);
  return null;
}
