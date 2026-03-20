"use client";

import { useEffect } from "react";

export default function DetailModal() {
  useEffect(() => {
    window.location.replace(window.location.href);
  }, []);

  return null;
}
