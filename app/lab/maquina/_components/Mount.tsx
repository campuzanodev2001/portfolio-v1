"use client";

import { useEffect } from "react";
import { mount } from "./engine";

/** Attaches the imperative engine to the server-rendered stage. Renders nothing. */
export default function Mount() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-mq-root]");
    if (!root) return;
    return mount(root);
  }, []);
  return null;
}
