"use client";

import React, { useEffect, useRef } from "react";

interface HeroShaderProps {
  className?: string;
  opacity?: number;
}

export default function HeroShader({ className = "w-full h-full", opacity = 0.85 }: HeroShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let gl: WebGLRenderingContext | null = null;

    try {
      gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      return;
    }

    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    syncSize();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    float time = u_time * 0.4;
    
    // Organic fluid movement
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / max(u_resolution.y, 1.0);
    
    float noise = 0.0;
    for(float i = 1.0; i < 4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + time + i);
        p.y += 0.3 / i * cos(i * 3.0 * p.x + time + i);
        noise += abs(p.x + p.y);
    }
    
    // Stitch Lumina Momentum Color Palette (Deep Violet, Emerald Accent & Bright Cyan)
    vec3 color1 = vec3(0.0, 0.427, 0.212);   // #006D36 (Avira Emerald)
    vec3 color2 = vec3(0.314, 0.784, 0.471); // #50C878 (Bright Green)
    vec3 color3 = vec3(0.31, 0.216, 0.541);  // #4F378A (Momentum Violet)
    vec3 color4 = vec3(0.0, 0.8, 0.9);       // Bright Cyan
    
    vec3 blendA = mix(color1, color2, 0.5 + 0.5 * sin(noise * 0.4 + time));
    vec3 blendB = mix(color3, color4, 0.5 + 0.5 * cos(noise * 0.3 - time));
    vec3 finalColor = mix(blendA, blendB, 0.45);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function createShader(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const vertShader = createShader(gl.VERTEX_SHADER, vs);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;

    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let isRunning = true;

    function render(t: number) {
      if (!isRunning || !gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`} style={{ opacity }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
