"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Mobile navigation. Opened by the toggle, closed by:
 * - the toggle (click stays on the button; backdrop is behind the header)
 * - Escape (focus returns to the toggle, preventScroll)
 * - a nav link (then Next navigates)
 * - the full-viewport backdrop (close only): it stays mounted through
 *   the whole pointer sequence. pointerdown preventDefault; the menu
 *   closes on click with preventDefault + stopPropagation so a touch
 *   compatibility click cannot activate the page underneath.
 * Hidden from `lg` via the wrapper class; the command palette stays available.
 */
export function MobileNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const finishCloseRef = useRef<() => void>(() => {});
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
    setMounted(true);
  }, []);

  function finishClose() {
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  }
  finishCloseRef.current = finishClose;

  function isMenuChrome(target: EventTarget | null) {
    if (!(target instanceof Element)) return false;
    if (buttonRef.current?.contains(target)) return true;
    return Boolean(target.closest("#mobile-nav"));
  }

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("a, button");
    first?.focus({ preventScroll: true });

    function focusables() {
      return Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        finishCloseRef.current();
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
        lastNode.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus({ preventScroll: true });
      }
    }

    function onOutsideClick(event: MouseEvent) {
      if (isMenuChrome(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      finishCloseRef.current();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onOutsideClick, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onOutsideClick, true);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="relative z-50 text-[0.72rem] uppercase tracking-[0.14em]"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={dict.nav.menu}
        onClick={() => {
          if (open) {
            finishClose();
            return;
          }
          setOpen(true);
        }}
      >
        {open ? dict.nav.close : dict.nav.menu}
      </button>
      {open && mounted
        ? createPortal(
            <div
              id="mobile-nav-backdrop"
              aria-hidden="true"
              className="fixed inset-0 z-30 touch-none lg:hidden"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                finishClose();
              }}
            />,
            document.body,
          )
        : null}
      {open ? (
        <div
          ref={panelRef}
          id="mobile-nav"
          className="absolute left-0 right-0 top-full z-40 border-b border-rule bg-paper px-5 py-4"
        >
          <nav aria-label={dict.nav.menu} className="grid gap-3 text-[0.8rem] uppercase tracking-[0.14em]">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => finishClose()}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
