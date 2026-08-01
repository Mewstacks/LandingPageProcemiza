"use client";

import { useEffect, useRef } from "react";
import { companyStory } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { Reveal } from "@/components/ui/Reveal";

export function OperationalStory() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const matchMedia = gsap.matchMedia();
    matchMedia.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const context = gsap.context(() => {
          const timeline = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: root.querySelector(".operational-field"),
              start: "top 82%",
              once: true,
            },
          });

          timeline
            .fromTo(
              ".op-input",
              { x: -14, opacity: 0.45 },
              { x: 0, opacity: 1, duration: 0.62, stagger: 0.045 },
              0
            )
            .fromTo(
              ".op-gate",
              { scaleX: 0.84, opacity: 0.45 },
              { scaleX: 1, opacity: 1, duration: 0.54, stagger: 0.1 },
              0.18
            )
            .fromTo(
              ".op-route-active",
              { strokeDashoffset: 520 },
              { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" },
              0.24
            )
            .fromTo(
              ".op-output",
              { x: 14, opacity: 0.45 },
              { x: 0, opacity: 1, duration: 0.58, stagger: 0.07 },
              0.48
            )
            .fromTo(
              ".op-exit-rail",
              { scaleX: 0.72, opacity: 0.35 },
              { scaleX: 1, opacity: 1, duration: 0.48, stagger: 0.06 },
              0.7
            );
        }, root);

        return () => context.revert();
      }
    );

    return () => matchMedia.revert();
  }, []);

  return (
    <section
      id="empresa"
      ref={rootRef}
      className="company-story"
      aria-labelledby="empresa-title"
    >
      <div className="wrap">
        <div className="operational-intro">
          <Reveal>
            <p className="mono-label operational-eyebrow">Do trabalho real ao sistema útil</p>
            <h2 id="empresa-title" className="display-lg">
              {companyStory.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lede">{companyStory.text}</p>
          </Reveal>
        </div>

        <div className="operational-field" aria-label="Trabalho disperso organizado em um sistema útil">
          <div className="op-column op-input-column">
            <header>
              <span className="mono-label">01 / Origens</span>
              <h3>O trabalho chega de todos os lados.</h3>
            </header>
            <ul className="op-inputs">
              {companyStory.inputs.map((item, index) => (
                <li key={item} className="op-input" style={{ "--offset": `${(index % 3) * 0.7}rem` } as React.CSSProperties}>
                  <i aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="op-core-column">
            <header>
              <span className="mono-label">02 / Lógica</span>
              <p>Contexto vira critério. Critério vira caminho.</p>
            </header>
            <div className="op-core">
              <svg className="op-routes" viewBox="0 0 420 520" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 52H86L132 136H212" />
                <path d="M0 164H92L132 188H212" />
                <path d="M0 274H100L132 246H212" />
                <path d="M0 386H88L132 300H212" />
                <path className="op-route-active" pathLength="520" d="M0 164H92L132 188H212V246H268V190H320L350 136H420" />
                <path d="M268 246H320L350 248H420" />
                <path d="M268 246V302H320L350 360H420" />
                <path d="M268 246V358H320L350 464H420" />
              </svg>

              <ol className="op-gates">
                {companyStory.logic.map((item, index) => (
                  <li key={item} className="op-gate">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                    <i aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="op-column op-output-column">
            <header>
              <span className="mono-label">03 / Entrega</span>
              <h3>A operação recebe algo que consegue usar.</h3>
            </header>
            <ol className="op-outputs">
              {companyStory.outputs.map((item, index) => (
                <li key={item} className="op-output">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="op-transition" aria-hidden="true">
          <span className="mono-label">O mesmo sistema, agora aberto em quatro níveis</span>
          <div className="op-exit-rails">
            {companyStory.logic.map((item, index) => (
              <i key={item} className={`op-exit-rail ${index === 2 ? "is-active" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
