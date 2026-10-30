"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cta, nav, site } from "@/content/site";

const FOCUSABLE =
  'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const [compact, setCompact] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sentinel = document.querySelector<HTMLElement>("[data-header-sentinel]");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    let previouslyFocused: HTMLElement | null = null;

    const close = () => {
      if (!details.open) return;
      details.open = false;
      document.body.classList.remove("menu-open");
      summaryRef.current?.focus();
    };

    const onToggle = () => {
      if (details.open) {
        previouslyFocused = document.activeElement as HTMLElement;
        document.body.classList.add("menu-open");
        requestAnimationFrame(() => {
          const firstLink = details.querySelector<HTMLElement>(".mobile-nav a");
          firstLink?.focus();
        });
      } else {
        document.body.classList.remove("menu-open");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!details.open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(details.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onDesktop = () => {
      if (window.innerWidth >= 1024 && details.open) {
        details.open = false;
        document.body.classList.remove("menu-open");
        previouslyFocused?.focus();
      }
    };

    details.addEventListener("toggle", onToggle);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onDesktop, { passive: true });

    return () => {
      details.removeEventListener("toggle", onToggle);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onDesktop);
      document.body.classList.remove("menu-open");
    };
  }, []);

  const closeMobileMenu = () => {
    const details = detailsRef.current;
    if (!details) return;
    details.open = false;
    document.body.classList.remove("menu-open");
  };

  return (
    <>
      <span className="header-sentinel" data-header-sentinel aria-hidden="true" />
      <header className="site-header" data-compact={compact ? "true" : "false"}>
        <div className="wrap header-frame">
          <Link href="/" className="header-brand" aria-label="Procemiza — página inicial">
            <span className="header-brand-lockup">
              <Image
                src="/media/procemiza/brand/logo-header.png"
                alt="Procemiza"
                width={2100}
                height={356}
                priority
                sizes="168px"
                className="header-wordmark"
              />
              <Image
                src="/media/procemiza/brand/icon-512.png"
                alt=""
                width={512}
                height={512}
                sizes="32px"
                className="header-symbol"
              />
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <ul className="desktop-nav-shell">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* secundário: a ação principal de cada tela é a do próprio conteúdo; aparece em todas as larguras */}
          <a
            href={site.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn header-cta"
            aria-label={`${cta.whatsapp} (abre em nova aba)`}
          >
            <span className="cta-long" aria-hidden="true">{cta.whatsapp}</span>
            <span className="cta-short" aria-hidden="true">WhatsApp</span>
          </a>

          <details ref={detailsRef} className="mobile-menu">
            <summary ref={summaryRef} className="mobile-menu-trigger">
              <span className="sr-only">Abrir ou fechar menu</span>
              <span className="menu-line" />
              <span className="menu-line" />
            </summary>
            <div className="mobile-menu-panel">
              <nav className="mobile-nav" aria-label="Navegação móvel">
                <ol>
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} onClick={closeMobileMenu}>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <a
                  href={site.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mobile-menu-cta"
                  onClick={closeMobileMenu}
                >
                  {cta.whatsapp}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </nav>
            </div>
          </details>
        </div>
      </header>
    </>
  );
}
