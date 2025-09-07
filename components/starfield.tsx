// components/starfield.tsx
"use client";
import { useEffect, useRef } from "react";

type Particle = { 
  x: number; 
  y: number; 
  z: number; 
  size: number; 
  opacity: number;
  prevX?: number; 
  prevY?: number;
};

export default function Starfield({
  density = 0.003,
  speed = 4,
  maxParallax = 15,
  className = "",
}: {
  density?: number; 
  speed?: number; 
  maxParallax?: number; 
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
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
    const arr: Particle[] = [];
    const centerX = w / 2;
    const centerY = h / 2;
    
    for (let i = 0; i < count; i++) {
      // Generate particles in a wider spread area
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.max(w, h) * 0.8;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const z = Math.random() * 1500 + 100; // Start farther away
      
      arr.push({
        x,
        y,
        z,
        size: Math.random() * 0.8 + 0.2, // Very small dust particles
        opacity: Math.random() * 0.6 + 0.2,
        prevX: x,
        prevY: y,
      });
    }
    particlesRef.current = arr;
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
      const centerX = w / 2;
      const centerY = h / 2;
      
      // Create motion blur effect by not completely clearing
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, w, h);

      const px = (mouseRef.current.x - 0.5) * maxParallax;
      const py = (mouseRef.current.y - 0.5) * maxParallax;

      for (const p of particlesRef.current) {
        // Store previous position
        p.prevX = p.x;
        p.prevY = p.y;
        
        // Move particle toward us (decrease z)
        p.z -= speed * (1 + Math.random() * 0.5); // Variable speed for more organic feel
        
        // Reset particle if it gets too close
        if (p.z <= 10) {
          p.z = 1500;
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * Math.max(w, h) * 0.8;
          p.x = centerX + Math.cos(angle) * radius;
          p.y = centerY + Math.sin(angle) * radius;
          p.opacity = Math.random() * 0.6 + 0.2;
        }
        
        // 3D to 2D projection with perspective
        const scale = 300 / p.z;
        const projectedX = centerX + (p.x - centerX) * scale;
        const projectedY = centerY + (p.y - centerY) * scale;
        
        // Apply mouse parallax (stronger effect when closer)
        const parallaxStrength = (1500 - p.z) / 1500;
        const ox = px * parallaxStrength * 0.3;
        const oy = py * parallaxStrength * 0.3;
        
        const screenX = projectedX + ox;
        const screenY = projectedY + oy;
        
        // Skip if outside screen bounds
        if (screenX < -50 || screenX > w + 50 || screenY < -50 || screenY > h + 50) {
          continue;
        }
        
        // Calculate particle properties based on distance
        const size = p.size * scale;
        const alpha = Math.min(1, scale * 0.6) * p.opacity;
        const velocity = speed * scale * 0.5;
        
        // Draw motion streak for particles moving fast
        if (p.prevX !== undefined && p.prevY !== undefined && velocity > 2) {
          const prevProjectedX = centerX + (p.prevX - centerX) * scale;
          const prevProjectedY = centerY + (p.prevY - centerY) * scale;
          const prevScreenX = prevProjectedX + ox;
          const prevScreenY = prevProjectedY + oy;
          
          const streakLength = Math.sqrt(
            Math.pow(screenX - prevScreenX, 2) + Math.pow(screenY - prevScreenY, 2)
          );
          
          if (streakLength > 1) {
            // Create gradient for streak
            const gradient = ctx.createLinearGradient(
              prevScreenX, prevScreenY, screenX, screenY
            );
            gradient.addColorStop(0, `rgba(200, 220, 255, 0)`);
            gradient.addColorStop(1, `rgba(200, 220, 255, ${alpha * 0.4})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.3, size * 0.8);
            ctx.lineCap = 'round';
            ctx.moveTo(prevScreenX, prevScreenY);
            ctx.lineTo(screenX, screenY);
            ctx.stroke();
          }
        }
        
        // Draw main particle as small dot/dust
        if (size > 0.3) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(220, 235, 255, ${alpha})`;
          ctx.arc(screenX, screenY, Math.min(2, size), 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle glow for closer particles
          if (scale > 0.5) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(160, 190, 255, ${alpha * 0.2})`;
            ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // For very small particles, just draw a pixel
          ctx.fillStyle = `rgba(230, 240, 255, ${alpha})`;
          ctx.fillRect(Math.floor(screenX), Math.floor(screenY), 1, 1);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [density, speed, maxParallax]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-95 mix-blend-screen ${className}`}
    />
  );
}