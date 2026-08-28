"use client";

import React, { useEffect, useRef } from "react";

interface NetworkSphereProps {
  className?: string;
  size?: number;
}

export default function NetworkSphere({ className = "w-full h-full min-h-[300px]", size = 320 }: NetworkSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || size);
    let height = (canvas.height = canvas.parentElement?.clientHeight || size);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || size;
      height = canvas.height = canvas.parentElement?.clientHeight || size;
    };

    window.addEventListener("resize", handleResize);

    // Generate 3D Spherical Network Points
    const numPoints = 42;
    const radius = Math.min(width, height) * 0.38;
    const points: { x: number; y: number; z: number; origX: number; origY: number; origZ: number; isBinaryNode: boolean }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      points.push({ x, y, z, origX: x, origY: y, origZ: z, isBinaryNode: i % 3 === 0 });
    }

    let angleX = 0;
    let angleY = 0;

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 400;

      angleX += 0.004;
      angleY += 0.006;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project 3D points to 2D
      const projected = points.map((p) => {
        // Rotate Y
        const x1 = p.origX * cosY - p.origZ * sinY;
        const z1 = p.origZ * cosY + p.origX * sinY;

        // Rotate X
        const y2 = p.origY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.origY * sinX;

        const scale = fov / (fov + z2);
        const x2d = x1 * scale + centerX;
        const y2d = y2 * scale + centerY;

        return { x: x2d, y: y2d, z: z2, scale, isBinaryNode: p.isBinaryNode };
      });

      // Sort by Z for proper depth
      projected.sort((a, b) => b.z - a.z);

      // Draw connection lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 75) {
            const alpha = (1 - dist / 75) * 0.35;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.strokeStyle = `rgba(0, 109, 54, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw glowing nodes
      projected.forEach((p) => {
        const radius = (p.isBinaryNode ? 4.5 : 2.5) * p.scale;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, radius), 0, Math.PI * 2);
        if (p.isBinaryNode) {
          ctx.fillStyle = "#50c878";
          ctx.shadowColor = "#50c878";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = "#4f378a";
          ctx.shadowColor = "#4f378a";
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [size]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
