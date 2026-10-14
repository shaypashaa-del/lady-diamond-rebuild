"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// On phones the floating buttons (accessibility, chat) sit on top of whatever
// is at the bottom of the screen. Elements marked `data-fab-avoid` (e.g. the
// product page's quantity / add-to-cart rows) ask them to step aside while any
// part of that element is on screen.
export function useFloatingAvoid(): boolean {
  const [avoid, setAvoid] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 639px)");
    const visible = new Set<Element>();
    const update = () => setAvoid(phone.matches && visible.size > 0);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll("[data-fab-avoid]").forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    scan();
    // Client-rendered content appears a moment after navigation.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    phone.addEventListener("change", update);
    return () => {
      io.disconnect();
      mo.disconnect();
      phone.removeEventListener("change", update);
      visible.clear();
      setAvoid(false);
    };
  }, [pathname]);

  return avoid;
}
