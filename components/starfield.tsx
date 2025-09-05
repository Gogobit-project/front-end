// components/starfield.tsx
"use client";
import { useEffect, useRef } from "react";

type Star = { x:number; y:number; z:number; r:number; a:number; av:number; vx:number; vy:number; };

export default function Starfield({
  density = 0.0016,
  baseSpeed = 0.08,
  maxParallax = 18,
  className = "",
}: {
  density?: number; baseSpeed?: number; maxParallax?: number; className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const resize = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.floor(w * h * density);
    const arr: Star[] = [];
    for (let i = 0; i < count; i++) {
      const z = Math.random();
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        r: 0.6 + z * 1.4,
        a: Math.random() * Math.PI * 2,
        av: (0.2 + Math.random() * 0.8) * 0.005,
        vx: (Math.random() - 0.5) * baseSpeed * (0.4 + z),
        vy: (Math.random() - 0.5) * baseSpeed * (0.4 + z),
      });
    }
    starsRef.current = arr;
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onResize = () => resize();
    onResize();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });

    const loop = () => {
      const ctx = c.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const w = c.clientWidth;
      const h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const px = (mouseRef.current.x - 0.5) * maxParallax;
      const py = (mouseRef.current.y - 0.5) * maxParallax;

      for (const s of starsRef.current) {
        s.a += s.av;
        const tw = 0.35 + 0.35 * Math.sin(s.a * 6.283);
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = w + 5; else if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5; else if (s.y > h + 5) s.y = -5;

        const ox = px * s.z;
        const oy = py * s.z;

        ctx.beginPath();
        ctx.fillStyle = `rgba(226,239,255,${tw * (0.6 + s.z * 0.6)})`;
        ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(96,165,250,${tw * 0.12})`;
        ctx.arc(s.x + ox, s.y + oy, s.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [density, baseSpeed, maxParallax]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-90 mix-blend-screen ${className}`}
    />
  );
}
