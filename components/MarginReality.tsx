"use client";

import { useEffect, useRef } from "react";
import { hiddenCost, marginReality } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { Reveal } from "@/components/ui/Reveal";

export function MarginReality() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".margin-compression",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 72%", end: "center 52%", scrub: 0.7 },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="custo" ref={rootRef} className="margin-section" aria-labelledby="margem-title">
      <div className="wrap">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-16 lg:gap-28 items-start">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <h2 id="margem-title" className="display-lg max-w-[13ch]">{marginReality.title}</h2>
              <p className="lede mt-7">{marginReality.text}</p>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <div className="margin-equation" aria-label="Composição qualitativa da margem por cliente">
              <div className="margin-revenue">
                <span>{marginReality.revenue}</span>
                <span className="margin-signal" aria-hidden="true" />
              </div>
              <div className="margin-deductions">
                {marginReality.deductions.map((item) => (
                  <div key={item} className="margin-deduction">
                    <span aria-hidden="true">−</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="margin-result">
                <div>
                  <span className="margin-equals" aria-hidden="true">=</span>
                  <strong>{marginReality.result}</strong>
                </div>
                <p>{marginReality.note}</p>
              </div>
              <div className="margin-compression" aria-hidden="true" />
            </div>
          </Reveal>
        </div>

        <div className="hidden-cost-head-block">
          <Reveal>
            <p className="mono-label hidden-cost-eyebrow">{hiddenCost.eyebrow}</p>
            <p className="lede mt-5">{hiddenCost.intro}</p>
          </Reveal>
        </div>

        <ol className="hidden-cost-list">
          {hiddenCost.items.map((item, index) => (
            <Reveal as="li" key={item.n} delay={index * 0.035} className="hidden-cost-row">
              <span className="hidden-cost-index">{item.n}</span>
              <div className="hidden-cost-head">
                <h3>{item.title}</h3>
                <span className="tag-chip">{item.dept}</span>
              </div>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
