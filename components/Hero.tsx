"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cta, hero, site } from "@/content/site";

const FINAL_VIDEO_AVAILABLE = false;
const VIDEO_WEBM = "/media/procemiza/hero/hero-system-loop.webm";
const VIDEO_MP4 = "/media/procemiza/hero/hero-system-loop.mp4";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    const video = videoRef.current;
    if (!media || !video || !FINAL_VIDEO_AVAILABLE) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const connection = (navigator as NavigatorWithConnection).connection;
    let inView = false;

    const canUseVideo = () =>
      !reducedMotion.matches &&
      desktop.matches &&
      !connection?.saveData &&
      document.visibilityState === "visible";

    const ensureSource = () => {
      if (video.src) return;
      const webm = video.canPlayType('video/webm; codecs="vp9"');
      video.src = webm ? VIDEO_WEBM : VIDEO_MP4;
      video.load();
    };

    const syncPlayback = () => {
      if (canUseVideo() && inView) {
        ensureSource();
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.15 }
    );

    observer.observe(media);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    desktop.addEventListener("change", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      desktop.removeEventListener("change", syncPlayback);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <section id="topo" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker mono-label">Inteligência operacional / escritórios contábeis</p>
          <h1 id="hero-title" className="display-xl">
            {hero.title}
          </h1>
          <p className="lede hero-lede">{hero.text}</p>
          <div className="hero-actions">
            <a
              href={site.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {cta.primary} <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a href="#camadas" className="btn btn-ghost">
              {cta.secondary} <span className="arrow arrow-down" aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>

      <div ref={mediaRef} className="hero-media" aria-hidden="true">
        <div className="hero-media-label">
          <span>Documentos dispersos</span>
          <span>Rotina organizada</span>
        </div>
        <Image
          src="/media/procemiza/hero/hero-system-prototype.svg"
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 64vw"
          className="hero-poster"
        />
        <video ref={videoRef} muted loop playsInline preload="none" className="hero-video" />
      </div>

      <div className="hero-axis" aria-hidden="true">
        <span>origens</span>
        <i />
        <span>entrega</span>
      </div>
    </section>
  );
}
