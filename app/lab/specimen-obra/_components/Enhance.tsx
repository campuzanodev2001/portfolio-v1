"use client";

import { useEffect } from "react";
import { mountPage } from "./page";

/** No renderiza nada: engancha el comportamiento al HTML que vino del server. */
export default function Enhance() {
  useEffect(() => {
    const root = document.getElementById("so");
    if (!root) return;
    return mountPage(root);
  }, []);
  return null;
}
