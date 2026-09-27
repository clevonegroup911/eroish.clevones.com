"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Mobile navigation. Opened by the toggle, closed by:
 * - the toggle (click, not a pointerdown-outside)
 * - Escape (focus returns to the toggle)
 * - a nav link (then Next navigates)
 * - pointerdown outside the panel and the toggle — close only: the event is
 *   swallowed so the underlying page is not activated.
 * Hidden from `lg` via the wrapper class; the command palette stays available.
 */
export function MobileNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefix = `/${locale}`;
  const links = [
    [dict.nav.who, `${prefix}/identity`],
    [dict.nav.now, `${prefix}/now`],
    [dict.nav.record, `${prefix}/record`],
    [dict.nav.proof, `${prefix}/proof`],
    [dict.nav.ask, `${prefix}/ask`],
    [dict.nav.connect, `${prefix}/connect`],
    [dict.nav.journey, `${prefix}/journey`],
    [dict.nav.places, `${prefix}/places`],
    [dict.nav.ledger, `${prefix}/ledger`],
  ] as const;

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("a, button");
    first?.focus();

    function focusables() {
      return Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!firstNode || !lastNode) return;
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      // Close only: swallow the event so the tap does not activate the page.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="text-[0.72rem] uppercase tracking-[0.14em]"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={dict.nav.menu}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? dict.nav.close : dict.nav.menu}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id="mobile-nav"
          className="absolute left-0 right-0 top-full z-40 border-b border-rule bg-paper px-5 py-4"
        >
          <nav aria-label={dict.nav.menu} className="grid gap-3 text-[0.8rem] uppercase tracking-[0.14em]">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
