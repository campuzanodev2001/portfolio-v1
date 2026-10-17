"use client";

import { useEffect } from "react";
import s from "../sf.module.css";
import { ROOT_ID } from "./boot";
import { mount } from "./fx";

/** Renders nothing: wires behaviour onto the server-rendered page. */
export default function Enhance() {
  useEffect(() => {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    return mount(root, s);
  }, []);
  return null;
}
