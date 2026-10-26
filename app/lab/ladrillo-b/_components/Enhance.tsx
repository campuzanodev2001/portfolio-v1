"use client";

import { useEffect } from "react";
import { mount } from "./kinetic";

/** No renderiza nada: engancha el comportamiento al HTML que vino del server. */
export default function Enhance() {
  useEffect(() => {
    const root = document.getElementById("lb");
    if (!root) return;
    return mount(root);
  }, []);
  return null;
}
