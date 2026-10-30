"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { flow } from "@/content/flow";
import { useReducedMotion } from "@/lib/motion";
import {
  CARD_IDS,
  INTRO_DEPTH,
  LAYOUTS,
  LIFT,
  bottomEdge,
  fitScale,
  flowState,
  pickLayout,
  segment,
  topEdge,
  type CardBox,
  type Layout,
} from "./flow.geometry";
import "./flow.css";

/** Comprimento-base do fio no CSS (px de projeto); o JS estica com scaleX. */
const WIRE_BASE = 100;
const FRAME_CAP_MS = 64;

type Fx = { bar: HTMLElement; chip: HTMLElement; autoDetail: HTMLElement; manualDetail: HTMLElement };

/**
 * Quatro rotinas de escritório em 3D, todas "Manual" no começo. Uma ficha passa por cada uma e a
 * vira "Automático". São as mesmas rotinas dos atalhos da calculadora logo abaixo.
 * Só texto, nenhum ícone.
 *
 * Nitidez: o mundo nunca é escalado; todo comprimento é "px de projeto × --k" (medido aqui), então o
 * navegador rasteriza cada cartão no tamanho final.
 * Desempenho: por quadro só `transform` e `opacity`. O layout (tamanho de cada cartão, --k,
 * perspectiva) só é escrito quando a caixa muda de tamanho.
 * Movimento reduzido: a entrada e o laço da ficha continuam; balanço e flutuação saem.
 */
export function FlowScene() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>(".flow-stage");
    const world = root.querySelector<HTMLElement>(".flow-world");
    const token = root.querySelector<HTMLElement>(".flow-token");
    const wires = Array.from(root.querySelectorAll<HTMLElement>(".flow-wire"));
    const cards = CARD_IDS.map((id) => root.querySelector<HTMLElement>(`[data-card="${id}"]`));
    if (!stage || !world || !token || wires.length !== CARD_IDS.length - 1 || cards.some((card) => !card)) return;
    const els = cards as HTMLElement[];
    const fx: Fx[] = [];
    for (const el of els) {
      const bar = el.querySelector<HTMLElement>('[data-fx="bar"]');
      const chip = el.querySelector<HTMLElement>('[data-fx="chip"]');
      const autoDetail = el.querySelector<HTMLElement>('[data-fx="auto"]');
      const manualDetail = el.querySelector<HTMLElement>('[data-fx="manual"]');
      if (!bar || !chip || !autoDetail || !manualDetail) return;
      fx.push({ bar, chip, autoDetail, manualDetail });
    }

    const lively = !reduced;
    let layout: Layout = LAYOUTS.wide;
    let k = 1;
    let clock = 0;
    let prev = 0;
    let raf = 0;
    let running = false;
    let visible = true;

    /** Só quando a caixa muda: tamanho dos cartões, escala, perspectiva. */
    function place() {
      root!.dataset.layout = layout.name;
      root!.style.setProperty("--k", String(k));
      stage!.style.perspective = `${layout.perspective * k}px`;
      layout.cards.forEach((box, index) => {
        els[index].style.setProperty("--w", String(box.w));
        els[index].style.setProperty("--h", String(box.h));
      });
    }

    function apply(now: number) {
      const state = flowState(now, layout);
      const swayX = lively ? Math.sin(now / 4300) * 1.2 : 0;
      const swayY = lively ? Math.sin(now / 5600) * 2.2 : 0;
      const rx = layout.tiltX + swayX;
      const ry = layout.tiltY + swayY;
      world!.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

      const placed: CardBox[] = layout.cards.map((box, index) => ({
        ...box,
        y: box.y + (lively ? Math.sin(now / 1700 + index * 0.9) * 3 : 0),
        z: box.z + state.lift[index] * LIFT - (1 - state.enter[index]) * INTRO_DEPTH,
      }));

      placed.forEach((box, index) => {
        els[index].style.transform = `translate3d(${box.x * k}px, ${box.y * k}px, ${box.z * k}px)`;
        els[index].style.opacity = String(state.enter[index]);
        const a = state.auto[index];
        fx[index].bar.style.opacity = String(a);
        fx[index].chip.style.opacity = String(a);
        // a frase antiga sai na primeira metade e a nova entra na segunda: as duas nunca se sobrepõem
        fx[index].manualDetail.style.opacity = String(Math.max(0, 1 - 2 * a));
        fx[index].autoDetail.style.opacity = String(Math.max(0, 2 * a - 1));
      });
      wires.forEach((wire, index) => {
        const line = segment(bottomEdge(placed[index]), topEdge(placed[index + 1]));
        wire.style.transform = `translate3d(${line.from.x * k}px, ${line.from.y * k}px, ${line.from.z * k}px) rotateZ(${line.yaw}deg) rotateY(${line.pitch}deg) scaleX(${line.length / WIRE_BASE})`;
        wire.style.opacity = String(Math.min(state.enter[index], state.enter[index + 1]));
      });

      // a ficha olha sempre para a câmera: desfaz a rotação do mundo
      token!.style.transform = `translate3d(${state.token.x * k}px, ${state.token.y * k}px, ${state.token.z * k}px) rotateY(${-ry}deg) rotateX(${-rx}deg)`;
      token!.style.opacity = String(state.tokenOpacity);
      if (root!.dataset.ready !== "true") root!.dataset.ready = "true";
    }

    function measure() {
      // Layout é lido só aqui, nunca no quadro de animação.
      const width = root!.clientWidth;
      layout = pickLayout(width);
      k = fitScale(layout, width, root!.clientHeight);
      place();
      apply(clock);
    }

    function frame(time: number) {
      raf = 0;
      if (!running) return;
      clock += prev ? Math.min(time - prev, FRAME_CAP_MS) : 16;
      prev = time;
      apply(clock);
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (running || !visible || document.hidden) return;
      running = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    const onVisibility = () => (document.hidden ? pause() : play());

    const resize = new ResizeObserver(measure);
    const sight = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });

    try {
      resize.observe(root);
      sight.observe(root);
      document.addEventListener("visibilitychange", onVisibility);
      measure();
      play();
    } catch {
      // Sem a animação, volta a composição estática do CSS (tudo Automático).
      pause();
      root.dataset.ready = "static";
      const all = [world, token, ...wires, ...els, ...fx.flatMap((f) => [f.bar, f.chip, f.autoDetail, f.manualDetail])];
      all.forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
      });
    }

    return () => {
      pause();
      resize.disconnect();
      sight.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  const wide = LAYOUTS.wide;
  return (
    <div ref={rootRef} className="flow" aria-hidden="true" inert data-ui>
      <div className="flow-stage">
        <div className="flow-world">
          {wide.cards.map((box, index) => {
            const routine = flow.routines[index];
            return (
              <div key={box.id} className={`flow-card flow-card--${box.id}`} data-card={box.id} style={boxVars(box)}>
                <div className="flow-doc rt">
                  <i className="rt-bar" data-fx="bar" />
                  <p className="rt-title">{routine.title}</p>
                  <div className="rt-detail">
                    <span className="rt-detail-manual" data-fx="manual">
                      {routine.manual}
                    </span>
                    <span className="rt-detail-auto" data-fx="auto">
                      {routine.auto}
                    </span>
                  </div>
                  <div className="rt-chip">
                    <span className="rt-chip-manual">{flow.status.manual}</span>
                    <span className="rt-chip-auto" data-fx="chip">
                      {flow.status.auto}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {[0, 1, 2].map((index) => (
            <i key={index} className="flow-wire" />
          ))}
          <b className="flow-token" />
        </div>
      </div>
    </div>
  );
}

/** Composição estática de partida (a larga): vale no servidor, sem JS e se a animação falhar. */
function boxVars(box: CardBox): CSSProperties {
  return { "--w": box.w, "--h": box.h, "--x": box.x, "--y": box.y, "--z": box.z } as CSSProperties;
}
