"use client";

import { useEffect, useState, type RefObject } from "react";

/** Se o elemento está na tela agora. Sem IntersectionObserver, fica `false` (o que depende dele some). */
export function useInView(ref: RefObject<Element | null>, threshold = 0.25): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const sight = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    sight.observe(el);
    return () => sight.disconnect();
  }, [ref, threshold]);

  return inView;
}

/** Vira `true` na primeira vez que o elemento aparece na tela e não volta atrás. */
export function useSeen(ref: RefObject<Element | null>, threshold = 0.5): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const sight = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        sight.disconnect();
      },
      { threshold },
    );
    sight.observe(el);
    return () => sight.disconnect();
  }, [ref, threshold]);

  return seen;
}
