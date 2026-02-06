import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import "./Particle.css";

const defaultColors = ["#6366f1", "#22d3ee", "#a5b4fc"];

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex, 16);
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;

  varying vec3 vColor;

  void main() {
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 6.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;

    mPos.x += sin(t + random.x * 6.28) * 0.6;
    mPos.y += cos(t + random.y * 6.28) * 0.6;
    mPos.z += sin(t + random.z * 6.28) * 0.6;

    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = uBaseSize / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    gl_FragColor = vec4(vColor, 0.85);
  }
`;

export default function Particles({
  particleCount = 160,
  particleSpread = 12,
  speed = 0.12,
  particleColors,
  particleBaseSize = 120,
  cameraDistance = 18,
  pixelRatio = window.devicePixelRatio || 1,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: pixelRatio,
      alpha: true,
      depth: false,
    });

    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.z = cameraDistance;

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({
        aspect: gl.canvas.width / gl.canvas.height,
      });
    };

    resize();
    window.addEventListener("resize", resize);

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette =
      particleColors && particleColors.length
        ? particleColors
        : defaultColors;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        i * 4
      );

      const col = hexToRgb(
        palette[Math.floor(Math.random() * palette.length)]
      );
      colors.set(col, i3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let raf;
    const update = (t) => {
      raf = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001 * speed;
      renderer.render({ scene: mesh, camera });
    };

    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    particleBaseSize,
    cameraDistance,
    pixelRatio,
  ]);

  return <div ref={containerRef} className="particles-container" />;
}
