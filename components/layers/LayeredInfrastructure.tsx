"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { InfrastructureScene, type InfrastructureSceneHandle } from "./InfrastructureScene";
import { INFRA_COPY, LAYERS } from "./layers.data";
import { clamp } from "./scene.geometry";

const ANIMATED_QUERY = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

export function LayeredInfrastructure() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<InfrastructureSceneHandle>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const matchMedia = gsap.matchMedia();
    matchMedia.add(ANIMATED_QUERY, () => {
      const copies = Array.from(root.querySelectorAll<HTMLElement>(".infra-copy"));
      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(".infra-chapter-button"));
      const progress = { value: 0 };
      let context: gsap.Context | undefined;
      function render() {
        const p = progress.value;
        sceneRef.current?.setProgress(p);
        const phase = p < 0.12 ? 0 : p >= 0.84 ? 5 : Math.min(4, Math.floor((p - 0.12 + 0.00001) / 0.18) + 1);
        const start = phase === 0 ? 0 : phase === 5 ? 0.84 : LAYERS[phase - 1].startsAt;
        const visibility = phase === 0 ? 1 : clamp((p - start) / 0.025);
        copies.forEach((copy, index) => {
          const opacity = index === phase ? visibility : index === phase - 1 ? 1 - visibility : 0;
          copy.style.opacity = String(opacity);
          copy.style.visibility = opacity > 0.001 ? "visible" : "hidden";
          copy.style.transform = `translateY(${index === phase ? (1 - visibility) * 8 : -visibility * 8}px)`;
        });
        buttons.forEach((button, index) => {
          if (phase - 1 === index) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
      }
      try {
        // Keep the readable document until all required scene elements exist.
        if (!sceneRef.current?.isReady() || copies.length !== 6 || buttons.length !== 4) return;
        root.dataset.enhanced = "true";
        context = gsap.context(() => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          });
          timeline.to(progress, { value: 1, duration: 1, ease: "none", onUpdate: render });
          triggerRef.current = timeline.scrollTrigger ?? null;
          render();
        }, root);
        // The content height changes only after enhancement succeeds.
        ScrollTrigger.refresh();
      } catch {
        context?.revert();
        delete root.dataset.enhanced;
        sceneRef.current?.setProgress(null);
        return;
      }
      return () => {
        context?.revert();
        triggerRef.current = null;
        delete root.dataset.enhanced;
        sceneRef.current?.setProgress(null);
        copies.forEach((copy) => { copy.style.removeProperty("opacity"); copy.style.removeProperty("visibility"); copy.style.removeProperty("transform"); });
        buttons.forEach((button) => button.removeAttribute("aria-current"));
      };
    });
    return () => matchMedia.revert();
  }, []);

  function goToChapter(index: number) {
    const trigger = triggerRef.current;
    if (!trigger) return;
    // Land in the reading interval after the information has reached that layer.
    const progress = LAYERS[index].startsAt + 0.11;
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * progress, behavior: "smooth" });
  }

  function skip(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("solucoes-title");
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    document.getElementById("solucoes")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#solucoes");
  }

  return <section id="camadas" ref={rootRef} className="infra-track" aria-labelledby="infra-title">
    <header className="infra-intro">
      <span className="infra-kicker">Por dentro de uma operação conectada</span>
      <h2 id="infra-title">{INFRA_COPY.title}</h2>
      <p>{INFRA_COPY.text}</p>
    </header>
    <div className="infra-stage">
      <div className="infra-stage-meta" aria-hidden="true"><span><i />Infraestrutura operacional</span><span>Demonstração ilustrativa</span></div>
      <div className="infra-overlays" aria-hidden="true">
        <div className="infra-copy"><span className="infra-kicker">Por dentro de uma operação conectada</span><h2>{INFRA_COPY.title}</h2><p>{INFRA_COPY.text}</p></div>
        {LAYERS.map((layer) => <div key={layer.id} className="infra-copy"><span className="infra-kicker">{layer.n} / {layer.name}</span><h2>{layer.headline}</h2><p>{layer.micro}</p><ul className="infra-story-items">{layer.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="infra-story-result">{layer.result}</div></div>)}
        <div className="infra-copy"><span className="infra-kicker">Do começo ao próximo passo</span><h2>{INFRA_COPY.conclusion}</h2><p>{INFRA_COPY.conclusionText}</p><div className="infra-story-result">Mais clareza para a equipe. Mais espaço para crescer.</div></div>
      </div>
      <div className="infra-visual"><InfrastructureScene controllerRef={sceneRef} /></div>
      <div className="infra-controls">
        <nav aria-label="Capítulos da demonstração"><ol className="infra-chapter-nav">{LAYERS.map((layer, index) => <li key={layer.id}><button type="button" className="infra-chapter-button" onClick={() => goToChapter(index)} aria-label={`Ir para ${layer.name}`}><span>{layer.n}</span>{layer.name}</button></li>)}</ol></nav>
        <a href="#solucoes" className="infra-skip" onClick={skip}>Pular demonstração</a>
      </div>
    </div>
    <ol className="infra-story">
      {LAYERS.map((layer) => <li key={layer.id} id={`camada-${layer.id}`}>
        <span className="infra-story-marker" aria-hidden="true">{layer.n}</span>
        <div><span className="infra-story-name">{layer.name}</span><h3>{layer.headline}</h3><p>{layer.micro}</p><ul className="infra-story-items">{layer.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="infra-story-result">{layer.result}</div></div>
      </li>)}
    </ol>
  </section>;
}
