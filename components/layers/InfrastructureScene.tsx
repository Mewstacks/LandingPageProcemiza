"use client";

import { useEffect, useImperativeHandle, useRef, type CSSProperties, type Ref } from "react";
import { LayerVisual } from "./LayerVisuals";
import { LAYERS, SCENE } from "./layers.data";
import { getSceneState, layerDepth, projectPoint, type SceneViewport } from "./scene.geometry";
import "./scene.css";

export type InfrastructureSceneHandle = {
  isReady: () => boolean;
  setProgress: (progress: number | null) => void;
};

type Props = {
  variant?: "hero" | "exploded";
  controllerRef?: Ref<InfrastructureSceneHandle>;
};

/** One physical model. The hero is a static view and never creates a timeline. */
export function InfrastructureScene({ variant = "exploded", controllerRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number | null>(null);
  const renderRef = useRef<() => void>(() => {});
  const readyRef = useRef(false);

  useImperativeHandle(controllerRef, () => ({
    isReady: () => readyRef.current,
    setProgress(progress) { progressRef.current = progress; renderRef.current(); },
  }), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let observer: ResizeObserver | undefined;
    const world = root.querySelector<HTMLElement>(".scene-world");
    const token = root.querySelector<HTMLElement>(".scene-request");
    const planes = Array.from(root.querySelectorAll<HTMLElement>(".scene-plane"));
    const connectors = Array.from(root.querySelectorAll<HTMLElement>(".scene-connector"));
    const routes = Array.from(root.querySelectorAll<SVGPolylineElement>(".scene-path-progress"));
    const labels = Array.from(root.querySelectorAll<HTMLElement>(".scene-label"));
    const leaders = Array.from(root.querySelectorAll<SVGPolylineElement>(".scene-leader"));
    const points = Array.from(root.querySelectorAll<SVGCircleElement>(".scene-leader-point"));
    if (!world || !token || [planes, routes, labels, leaders, points].some((items) => items.length !== LAYERS.length) || connectors.length !== LAYERS.length - 1) return;
    let viewport: SceneViewport = { width: 0, height: 0, scale: 1 };
    function render() {
      const state = getSceneState(progressRef.current, variant === "hero");
      root!.style.setProperty("--scene-gap", `${state.gap}px`);
      world!.style.transform = `translate(-50%, -50%) rotateX(${state.rotationX}deg) rotateZ(${state.rotationZ}deg) scale3d(${viewport.scale}, ${viewport.scale}, ${viewport.scale})`;
      token!.style.transform = `translate3d(${state.token.x - 8}px, ${state.token.y - 10}px, ${state.token.z}px)`;
      token!.style.opacity = `${state.tokenOpacity}`;
      root!.dataset.active = String(state.active);
      planes.forEach((plane, index) => {
        const active = state.active < 0 || state.active === index;
        plane.style.setProperty("--scene-emphasis", active ? "1" : "0.38");
        routes[index].style.strokeDashoffset = String(1 - state.routeProgress[index]);
        const anchor = projectPoint({ ...LAYERS[index].anchor, z: layerDepth(index, state.gap) }, state, viewport);
        const labelX = Math.min(viewport.width - (viewport.width < 500 ? 84 : 112), anchor.x + 30);
        labels[index].style.transform = `translate(${labelX}px, ${anchor.y - 9}px)`;
        labels[index].dataset.current = String(state.active === index);
        leaders[index].setAttribute("points", `${anchor.x},${anchor.y} ${anchor.x + 12},${anchor.y} ${labelX - 7},${anchor.y}`);
        points[index].setAttribute("cx", `${anchor.x}`);
        points[index].setAttribute("cy", `${anchor.y}`);
      });
      connectors.forEach((connector, index) => {
        connector.style.setProperty("--connector-fill", `${state.connectorProgress[index]}`);
      });
      root!.dataset.measured = "true";
    }
    function measure() {
      // Layout is read only on resize, never in the scroll animation.
      viewport = {
        width: root!.clientWidth,
        height: root!.clientHeight,
        scale: Math.min(root!.clientWidth / (variant === "hero" ? 655 : 760), root!.clientHeight / (variant === "hero" ? 490 : 680), 1.28),
      };
      render();
    }
    try {
      observer = new ResizeObserver(measure);
      observer.observe(root);
      measure();
      renderRef.current = render;
      readyRef.current = true;
    } catch {
      observer?.disconnect();
      readyRef.current = false;
      renderRef.current = () => {};
      // Restore the CSS-only composition if setup failed after a partial render.
      root.style.setProperty("--scene-gap", `${variant === "hero" ? SCENE.heroGap : SCENE.openGap}px`);
      delete root.dataset.active;
      delete root.dataset.measured;
      world.style.removeProperty("transform");
      token.style.removeProperty("transform");
      token.style.removeProperty("opacity");
      planes.forEach((plane) => plane.style.removeProperty("--scene-emphasis"));
      routes.forEach((route) => route.style.removeProperty("stroke-dashoffset"));
      connectors.forEach((connector) => connector.style.removeProperty("--connector-fill"));
      labels.forEach((label) => { label.style.removeProperty("transform"); delete label.dataset.current; });
      leaders.forEach((leader) => leader.removeAttribute("points"));
      points.forEach((point) => { point.removeAttribute("cx"); point.removeAttribute("cy"); });
    }
    return () => {
      observer?.disconnect();
      readyRef.current = false;
      renderRef.current = () => {};
    };
  }, [variant]);

  return <div ref={rootRef} className={`scene scene--${variant}`} aria-hidden="true" style={{ "--scene-gap": `${variant === "hero" ? SCENE.heroGap : SCENE.openGap}px` } as CSSProperties}>
    <div className="scene-ground" />
    <div className="scene-perspective">
      <div className="scene-world">
        {LAYERS.map((layer, index) => <div key={layer.id} className={`scene-plane scene-plane--${layer.id}`} style={{ "--layer-depth": 1.5 - index } as CSSProperties}>
          <div className="scene-face scene-face--front" />
          <div className="scene-face scene-face--right" />
          <LayerVisual id={layer.id} />
        </div>)}
        {LAYERS.slice(1).map((layer, index) => <div key={layer.id} className="scene-connector" style={{ left: layer.route[0].x, top: layer.route[0].y, "--connector-depth": 0.5 - index } as CSSProperties}><i /></div>)}
        <div className="scene-request"><span /><span /></div>
      </div>
    </div>
    <svg className="scene-leaders">
      {LAYERS.map((layer) => <g key={layer.id}><polyline className="scene-leader" /><circle className="scene-leader-point" r="2" /></g>)}
    </svg>
    <div className="scene-labels">
      {LAYERS.map((layer) => <div key={layer.id} className="scene-label"><span>{layer.n}</span><strong>{layer.name}</strong></div>)}
    </div>
    <div className="scene-caption"><span className="scene-caption-line" /><span>Uma informação. Um caminho.</span></div>
  </div>;
}
