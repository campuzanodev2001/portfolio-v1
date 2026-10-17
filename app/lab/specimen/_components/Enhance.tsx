"use client";

import { useEffect } from "react";
import { mount } from "./fx";

/** Renders nothing: wires behaviour onto the server-rendered hero. */
export default function Enhance() {
  useEffect(() => {
    const root = document.getElementById("specimen");
    if (!root) return;
    return mount(root);
  }, []);
  return null;
}
