"use client";

import { useEffect } from "react";
import { mountPage } from "./engine";

/** No renderiza nada: engancha el comportamiento al HTML que vino del server. */
export default function Enhance() {
  useEffect(() => {
    const root = document.getElementById("la");
    if (!root) return;
    return mountPage(root);
  }, []);
  return null;
}
