"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { layeredInfrastructure as copy } from "@/content/site";
import { LayerVisual } from "./LayerVisuals";
import { LAYERS, type LayerCallout } from "./layers.data";

const OPEN_POSITIONS = [
  { y: -138, z: -96 },
  { y: -46, z: -64 },
  { y: 46, z: -32 },
  { y: 138, z: 0 },
] as const;

const COMPACT_POSITIONS = [
  { y: -24, z: -42 },
  { y: -8, z: -28 },
  { y: 8, z: -14 },
  { y: 24, z: 0 },
] as const;

const CHAPTER_STARTS = [0.1, 0.28, 0.46, 0.64] as const;

function connectorPoints(callout: LayerCallout) {
  const { anchor, labelPosition, align } = callout;
  const labelEdge = align === "start" ? labelPosition.x + 5 : labelPosition.x - 3;
  const elbowX = anchor.x + (labelEdge - anchor.x) * 0.58;
  const labelY = labelPosition.y + 2;
  return `${anchor.x},${anchor.y} ${elbowX},${anchor.y} ${labelEdge},${labelY}`;
}

export function LayeredInfrastructure() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const matchMedia = gsap.matchMedia();
    matchMedia.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const context = gsap.context(() => {
          const planes = Array.from(root.querySelectorAll<HTMLElement>(".li-plane"));
          const surfaces = Array.from(root.querySelectorAll<SVGPathElement>(".layer-plane-surface"));
          const papers = planes.map((plane) => Array.from(plane.querySelectorAll<SVGElement>(".layer-paper")));
          const routes = planes.map((plane) => Array.from(plane.querySelectorAll<SVGElement>(".layer-route")));
          const chapters = Array.from(root.querySelectorAll<HTMLElement>(".li-chapter"));
          const calloutGroups = Array.from(root.querySelectorAll<HTMLElement>(".li-callout-group"));
          const navItems = Array.from(root.querySelectorAll<HTMLElement>(".li-nav-item"));
          const intro = root.querySelector<HTMLElement>(".li-intro-copy");
          const systemStatus = root.querySelector<HTMLElement>(".li-system-status");

          gsap.set(planes, {
            xPercent: -50,
            yPercent: -50,
            rotationX: 58,
            rotationZ: -7,
            transformOrigin: "50% 50%",
          });
          planes.forEach((plane, index) => {
            gsap.set(plane, {
              y: COMPACT_POSITIONS[index].y,
              z: COMPACT_POSITIONS[index].z,
              opacity: 0.72,
            });
          });
          gsap.set(chapters, { autoAlpha: 0, y: 14 });
          gsap.set(calloutGroups, { autoAlpha: 0 });
          gsap.set(navItems, { opacity: 0.34 });
          gsap.set(papers.flat(), { fill: "#777066" });
          gsap.set(routes.flat(), { opacity: 0.34 });
          gsap.set(intro, { autoAlpha: 1, y: 0 });

          const timeline = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          planes.forEach((plane, index) => {
            timeline.to(
              plane,
              {
                y: OPEN_POSITIONS[index].y,
                z: OPEN_POSITIONS[index].z,
                opacity: 0.58,
                duration: 0.1,
              },
              0
            );
          });

          LAYERS.forEach((layer, index) => {
            const at = CHAPTER_STARTS[index];
            const previous = index - 1;

            if (index === 0) {
              timeline.to(intro, { autoAlpha: 0, y: -12, duration: 0.04 }, at - 0.02);
            } else {
              timeline
                .to(chapters[previous], { autoAlpha: 0, y: -12, duration: 0.04 }, at - 0.02)
                .to(calloutGroups[previous], { autoAlpha: 0, duration: 0.035 }, at - 0.02)
                .to(navItems[previous], { opacity: 0.46, duration: 0.04 }, at - 0.02)
                .to(
                  planes[previous],
                  {
                    x: 0,
                    z: OPEN_POSITIONS[previous].z,
                    scale: 1,
                    opacity: 0.58,
                    duration: 0.04,
                  },
                  at - 0.02
                )
                .to(surfaces[previous], { fill: "#171512", duration: 0.04 }, at - 0.02)
                .to(papers[previous], { fill: "#777066", duration: 0.04 }, at - 0.02)
                .to(routes[previous], { opacity: 0.34, duration: 0.04 }, at - 0.02);
            }

            timeline
              .to(chapters[index], { autoAlpha: 1, y: 0, duration: 0.04 }, at)
              .to(navItems[index], { opacity: 1, duration: 0.04 }, at)
              .to(
                planes[index],
                {
                  x: -18,
                  z: OPEN_POSITIONS[index].z + 42,
                  scale: 1.025,
                  opacity: 1,
                  duration: 0.045,
                },
                at
              )
              .to(surfaces[index], { fill: "#2a251f", duration: 0.04 }, at)
              .to(papers[index], { fill: "#eeeae2", duration: 0.04 }, at)
              .to(routes[index], { opacity: 1, duration: 0.04 }, at)
              .to(calloutGroups[index], { autoAlpha: 1, duration: 0.04 }, at + 0.015);

            if (systemStatus) {
              timeline.to(systemStatus, { opacity: 1, duration: 0.01 }, at);
            }
          });

          timeline
            .to(calloutGroups[3], { autoAlpha: 0, duration: 0.04 }, 0.82)
            .to(navItems, { opacity: 0.78, duration: 0.05 }, 0.82);

          planes.forEach((plane, index) => {
            timeline.to(
              plane,
              {
                x: 0,
                y: [-66, -22, 22, 66][index],
                z: [-54, -36, -18, 0][index],
                scale: 1,
                opacity: 0.86,
                rotationX: 54,
                duration: 0.12,
              },
              0.82
            );
            timeline
              .to(surfaces[index], { fill: "#201c18", duration: 0.08 }, 0.82)
              .to(papers[index], { fill: "#b4ada3", duration: 0.08 }, 0.82)
              .to(routes[index], { opacity: 0.68, duration: 0.08 }, 0.82);
          });

          timeline.to(systemStatus, { opacity: 0.58, duration: 0.08 }, 0.9);
        }, root);

        return () => context.revert();
      }
    );

    return () => matchMedia.revert();
  }, []);

  return (
    <section
      id="camadas"
      ref={rootRef}
      className="li-track"
      aria-label="Infraestrutura operacional em camadas"
    >
      <div className="li-sticky">
        <div className="li-narrative">
          <div className="li-narrative-inner">
            <ol className="li-chapter-nav" aria-label="Capítulos da infraestrutura">
              {LAYERS.map((layer) => (
                <li key={layer.id} className="li-nav-item">
                  <span>{layer.n}</span>
                  <strong>{layer.name}</strong>
                </li>
              ))}
            </ol>

            <div className="li-copy-stack">
              <header className="li-intro-copy">
                <span className="mono-label">Sistema completo</span>
                <h2>{copy.title}</h2>
                <p>{copy.text}</p>
              </header>

              {LAYERS.map((layer) => (
                <article key={layer.id} className="li-chapter">
                  <span className="mono-label">{layer.n} / {layer.name}</span>
                  <h3>{layer.headline}</h3>
                  <p>{layer.micro}</p>
                  <ul>
                    {layer.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="li-stage" aria-hidden="true">
          <div className="li-stage-dots" />
          <div className="li-stage-meta">
            <span className="mono-label">Infraestrutura operacional</span>
            <span className="li-system-status">04 níveis / 01 sistema</span>
          </div>

          <div className="li-stack">
            {LAYERS.map((layer) => (
              <div key={layer.id} className={`li-plane li-plane--${layer.id}`}>
                <div className="li-plane-label">
                  <span>{layer.n}</span>
                  <strong>{layer.name}</strong>
                </div>
                <LayerVisual id={layer.id} />
              </div>
            ))}
          </div>

          <div className="li-callouts">
            {LAYERS.map((layer) => (
              <div key={layer.id} className={`li-callout-group li-callout-group--${layer.id}`}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  {layer.callouts.map((callout) => (
                    <g key={callout.label}>
                      <polyline points={connectorPoints(callout)} />
                      <circle cx={callout.anchor.x} cy={callout.anchor.y} r="0.52" />
                    </g>
                  ))}
                </svg>
                {layer.callouts.map((callout) => (
                  <span
                    key={callout.label}
                    className={`li-callout-label is-${callout.align}`}
                    style={{
                      "--callout-x": `${callout.labelPosition.x}%`,
                      "--callout-y": `${callout.labelPosition.y}%`,
                    } as React.CSSProperties}
                  >
                    {callout.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="li-static wrap">
        <header className="li-static-intro">
          <span className="mono-label">Quatro níveis, um sistema</span>
          <h2>{copy.title}</h2>
          <p>{copy.text}</p>
        </header>
        <ol className="li-static-list">
          {LAYERS.map((layer) => (
            <li key={layer.id} className="li-static-layer">
              <div className="li-static-visual"><LayerVisual id={layer.id} /></div>
              <div className="li-static-copy">
                <span className="mono-label">{layer.n} / {layer.name}</span>
                <h3>{layer.headline}</h3>
                <p>{layer.micro}</p>
                <ul>{layer.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
