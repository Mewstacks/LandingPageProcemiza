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

/**
 * Quatro documentos reais em 3D: o pedido no WhatsApp, a linha na planilha, a nota fiscal e a resposta.
 * Uma ficha anda de um ao outro e o que ela alcança acende. Só texto de verdade, nenhum ícone.
 *
 * Nitidez: o mundo nunca é escalado; todo comprimento é "px de projeto × --k" (medido aqui), então o
 * navegador rasteriza cada documento no tamanho final.
 * Desempenho: por quadro só `transform` e `opacity`. O layout (tamanho de cada documento, --k,
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
    const row = root.querySelector<HTMLElement>('[data-fx="row"]');
    const stamp = root.querySelector<HTMLElement>('[data-fx="stamp"]');
    const reply = root.querySelector<HTMLElement>('[data-fx="reply"]');
    if (!stage || !world || !token || !row || !stamp || !reply || wires.length !== CARD_IDS.length - 1 || cards.some((card) => !card)) return;
    const els = cards as HTMLElement[];

    const lively = !reduced;
    let layout: Layout = LAYOUTS.wide;
    let k = 1;
    let clock = 0;
    let prev = 0;
    let raf = 0;
    let running = false;
    let visible = true;

    /** Só quando a caixa muda: tamanho dos documentos, escala, perspectiva. */
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
      });
      wires.forEach((wire, index) => {
        const line = segment(bottomEdge(placed[index]), topEdge(placed[index + 1]));
        wire.style.transform = `translate3d(${line.from.x * k}px, ${line.from.y * k}px, ${line.from.z * k}px) rotateZ(${line.yaw}deg) rotateY(${line.pitch}deg) scaleX(${line.length / WIRE_BASE})`;
        wire.style.opacity = String(Math.min(state.enter[index], state.enter[index + 1]));
      });

      // a ficha olha sempre para a câmera: desfaz a rotação do mundo
      token!.style.transform = `translate3d(${state.token.x * k}px, ${state.token.y * k}px, ${state.token.z * k}px) rotateY(${-ry}deg) rotateX(${-rx}deg)`;
      token!.style.opacity = String(state.tokenOpacity);
      row!.style.opacity = String(state.row);
      stamp!.style.opacity = String(state.stamp);
      stamp!.style.transform = `rotate(-8deg) scale(${1.35 - 0.35 * state.stamp})`;
      reply!.style.opacity = String(state.reply);
      reply!.style.transform = `translateY(${(1 - state.reply) * 10 * k}px)`;
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
      // Sem a animação, volta a composição estática do CSS.
      pause();
      root.dataset.ready = "static";
      [world, token, row, stamp, reply, ...wires, ...els].forEach((el) => {
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
          {wide.cards.map((box) => (
            <div key={box.id} className={`flow-card flow-card--${box.id}`} data-card={box.id} style={boxVars(box)}>
              <div className="flow-doc">
                {box.id === "in" ? <ChatIn /> : null}
                {box.id === "sheet" ? <Sheet /> : null}
                {box.id === "invoice" ? <Invoice /> : null}
                {box.id === "out" ? <ChatOut /> : null}
              </div>
            </div>
          ))}
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

function ChatHead() {
  const { chat } = flow;
  return (
    <p className="wa-head">
      <span>{chat.contact}</span>
      <b>{chat.app}</b>
    </p>
  );
}

function ChatIn() {
  const { chat } = flow;
  return (
    <>
      <ChatHead />
      <div className="wa-body">
        <p className="wa-bubble wa-bubble--in">
          {chat.incoming.text}
          <time>{chat.incoming.time}</time>
        </p>
      </div>
    </>
  );
}

function ChatOut() {
  const { chat } = flow;
  return (
    <>
      <ChatHead />
      <div className="wa-body">
        <p className="wa-bubble wa-bubble--out" data-fx="reply">
          {chat.outgoing.text}
          <time>{chat.outgoing.time}</time>
        </p>
      </div>
    </>
  );
}

function Sheet() {
  const { sheet } = flow;
  return (
    <>
      <p className="sheet-title">{sheet.title}</p>
      <table className="sheet">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "30%" }} />
        </colgroup>
        <thead>
          <tr>
            {sheet.head.map((cell) => (
              <th key={cell}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.rows.map((cells) => (
            <tr key={cells[0]}>
              {cells.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
          <tr className="sheet-fresh" data-fx="row">
            {sheet.fresh.map((cell) => (
              <td key={cell}>{cell}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}

function Invoice() {
  const { invoice } = flow;
  return (
    <>
      <div className="inv-top">
        <strong>{invoice.kind}</strong>
        <span>{invoice.number}</span>
      </div>
      <p className="inv-to">{invoice.to}</p>
      <p className="inv-item">{invoice.item}</p>
      <div className="inv-total">
        <span>{invoice.totalLabel}</span>
        <strong>{invoice.total}</strong>
      </div>
      <div className="inv-status">
        <span>{invoice.statusLabel}</span>
        <p className="inv-stamp" data-fx="stamp">
          {invoice.stamp}
        </p>
      </div>
    </>
  );
}
