import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A procedural jellyfish — no model file, no textures, no footage.
 *
 * The bell is a shaded dome with radial ribs, a mottled margin, a fresnel rim
 * and an inner glow; the tentacles and oral arms undulate via a travelling wave
 * in the vertex shader. Recoloured from the original pink to the site's gold so
 * it belongs to this palette rather than importing another one.
 *
 * Cost control: the strand count is well below the reference (12 tentacles and
 * 5 arms rather than 28 and 8) and the canvas is dpr-capped, because this sits
 * on a page that already carries seven full-bleed photographs. It is mounted
 * lazily by its section and unmounted when scrolled away.
 */

function useTime() {
  const t = useRef({ value: 0 });
  useFrame((s) => (t.current.value = s.clock.elapsedTime));
  return t.current;
}

const BELL_VERT = /* glsl */ `
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
  void main(){
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const BELL_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }

  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N,V),0.0), 2.4);

    float h = clamp((vPos.y + 0.40)/1.40, 0.0, 1.0);   // 1 apex -> 0 margin
    float ang = atan(vPos.z, vPos.x);

    // Gold gradient: warm apex -> amber -> pale champagne at the margin.
    vec3 top  = vec3(0.62, 0.46, 0.14);
    vec3 mid  = vec3(0.78, 0.63, 0.29);
    vec3 edge = vec3(0.89, 0.80, 0.55);
    vec3 col = mix(edge, mid, smoothstep(0.0,0.5,h));
    col = mix(col, top, smoothstep(0.45,1.0,h));

    // Radial ribs, faded out at apex and margin.
    float ribs = abs(fract(ang/(2.0*3.14159265)*18.0) - 0.5) * 2.0;
    float ribLine = smoothstep(0.80, 0.99, ribs);
    float ribMask = smoothstep(0.98,0.55,h) * smoothstep(-0.02,0.22,h);
    col *= 1.0 - ribLine * 0.5 * ribMask;

    // The inward-facing wall is drawn too (DoubleSide). Left alone its dark
    // mottling punches a wobbling shadow band through the translucent dome, so
    // back faces drop the mottling and fade down to a faint hint instead.
    float backw = gl_FrontFacing ? 1.0 : 0.0;

    float band = smoothstep(0.34, 0.02, h);
    float spots = noise(vec2(ang*7.0, h*12.0));
    float wart = smoothstep(0.58, 0.86, spots) * band;
    col = mix(col, vec3(0.24,0.16,0.06), wart*0.8*backw);

    col += fres * vec3(0.30, 0.24, 0.10);
    col += (1.0 - fres) * vec3(0.16,0.11,0.03) * (0.5 + 0.5*h);

    float alpha = 0.46 + fres*0.44 + ribLine*ribMask*0.2 + wart*0.3*backw;
    alpha *= mix(0.28, 1.0, backw);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.94));
  }
`;

function Bell({ time }: { time: { value: number } }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: BELL_VERT, fragmentShader: BELL_FRAG,
    uniforms: { uTime: time },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  }), [time]);
  return (
    <mesh material={mat} scale={[1, 0.84, 1]}>
      <sphereGeometry args={[1, 96, 96, 0, Math.PI * 2, 0, 1.98]} />
    </mesh>
  );
}

function Glow() {
  return (
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshBasicMaterial color="#e3c274" transparent opacity={0.42}
        blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const STRAND_VERT = /* glsl */ `
  uniform float uTime; uniform float uLen; uniform float uPhase;
  uniform float uAmp; uniform float uFreq;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    vec3 p = position;
    float k = clamp(-p.y / uLen, 0.0, 1.0);
    float amp = k*k*uAmp;
    p.x += sin(uTime*1.5 + k*uFreq + uPhase) * amp;
    p.z += cos(uTime*1.2 + k*uFreq*0.9 + uPhase*1.3) * amp;
    vK = k;
    vWorldY = (modelMatrix * vec4(p,1.0)).y;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const STRAND_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uTop; uniform vec3 uTip; uniform float uOpacity;
  uniform vec2 uFade; uniform vec2 uFadeTop;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)),0.0), 1.6);
    // Dissolve at the bottom so strands trail into wisps instead of being
    // clipped flat, and at the top so their attachment hides inside the bell.
    float vis = smoothstep(uFade.x, uFade.y, vWorldY)
              * smoothstep(uFadeTop.y, uFadeTop.x, vWorldY);
    vec3 col = mix(uTop, uTip, vK) + fres*0.22;
    float alpha = ((1.0 - vK*0.92) * uOpacity + fres*0.1) * vis;
    gl_FragColor = vec4(col, clamp(alpha,0.0,1.0));
  }
`;

function strandGeometry(length: number, thickness: number, curl: number) {
  const seg = 28, radial = 5;
  const spine: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    spine.push(new THREE.Vector3(Math.sin(t * 3) * curl * t, -t * length, Math.cos(t * 2) * curl * t));
  }
  const curve = new THREE.CatmullRomCurve3(spine);
  const frames = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = curve.getPointAt(t);
    const r = thickness * (1 - Math.pow(t, 0.75));
    const Nf = frames.normals[i], Bf = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      pos.push(p.x + (c * Nf.x + s * Bf.x) * r,
               p.y + (c * Nf.y + s * Bf.y) * r,
               p.z + (c * Nf.z + s * Bf.z) * r);
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Strand(p: {
  time: { value: number }; angle: number; radius: number; yOffset: number;
  length: number; thickness: number; curl: number; amp: number; freq: number;
  phase: number; top: string; tip: string; opacity: number;
}) {
  const geometry = useMemo(
    () => strandGeometry(p.length, p.thickness, p.curl), [p.length, p.thickness, p.curl]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: STRAND_VERT, fragmentShader: STRAND_FRAG,
    uniforms: {
      uTime: p.time, uLen: { value: p.length }, uPhase: { value: p.phase },
      uAmp: { value: p.amp }, uFreq: { value: p.freq },
      uTop: { value: new THREE.Color(p.top) }, uTip: { value: new THREE.Color(p.tip) },
      uOpacity: { value: p.opacity },
      uFade: { value: new THREE.Vector2(-1.85, -0.7) },
      uFadeTop: { value: new THREE.Vector2(-0.62, -0.22) },
    },
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  }), [p.time, p.length, p.phase, p.amp, p.freq, p.top, p.tip, p.opacity]);

  return <mesh geometry={geometry} material={mat}
    position={[Math.cos(p.angle) * p.radius, p.yOffset, Math.sin(p.angle) * p.radius]} />;
}

function Jelly({ loop }: { loop: number }) {
  const time = useTime();
  const grp = useRef<THREE.Group>(null!);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    grp.current.rotation.y = -(t / loop) * Math.PI * 2;
    grp.current.position.y = Math.sin(t * 0.6) * 0.08;
    const k = Math.sin(t * 1.7);
    grp.current.scale.set(1 + k * 0.05, 1 - k * 0.06, 1 + k * 0.05);
  });

  const tentacles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ angle: (i / 12) * Math.PI * 2, phase: i * 0.5 })), []);
  const arms = useMemo(
    () => Array.from({ length: 5 }, (_, i) => ({ angle: (i / 5) * Math.PI * 2, phase: i + 0.4 })), []);

  return (
    <group ref={grp}>
      <Bell time={time} />
      <Glow />
      {tentacles.map((s, i) => (
        <Strand key={`t${i}`} time={time} angle={s.angle} radius={0.82} yOffset={-0.25}
          length={4.2} thickness={0.016} curl={0.05} amp={0.5} freq={7} phase={s.phase}
          top="#e3c274" tip="#f3e6c8" opacity={0.5} />
      ))}
      {arms.map((s, i) => (
        <Strand key={`a${i}`} time={time} angle={s.angle} radius={0.22} yOffset={-0.1}
          length={2} thickness={0.07} curl={0.14} amp={0.32} freq={10} phase={s.phase}
          top="#f0dcae" tip="#c8a04a" opacity={0.66} />
      ))}
    </group>
  );
}

export default function Jellyfish({ loop = 20 }: { loop?: number }) {
  return (
    <Canvas
      flat
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.4, 6], fov: 34 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <Jelly loop={loop} />
    </Canvas>
  );
}
