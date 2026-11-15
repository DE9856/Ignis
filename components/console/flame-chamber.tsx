"use client";

import { useEffect, useRef, useState } from "react";

import { motionAllowed } from "@/components/motion/gsap";
import { cn } from "@/lib/utils/cn";

export interface ChamberValues {
  oxygen: number;
  pressure: number;
  gravity: number;
  /** Null when airflow is not part of the scenario; drawn as still air. */
  airflow: number | null;
}

const VERTEX = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

/*
 * Illustrative flame. Shape responds to gravity (teardrop to sphere), oxygen
 * (size, heat), pressure (bluer at low pressure) and airflow (drift). It is
 * decoration, not a combustion model: nothing here is computed from evidence.
 */
const FRAGMENT = `precision highp float;
uniform vec2 uRes;uniform float uTime,uMorph,uSize,uInt,uFlow,uHeat,uBlue,uPx;
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy)*2.-1.;}
float gnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);
 float a=dot(hash22(i),f),b=dot(hash22(i+vec2(1,0)),f-vec2(1,0)),c=dot(hash22(i+vec2(0,1)),f-vec2(0,1)),d=dot(hash22(i+vec2(1,1)),f-vec2(1,1));
 return .5+.75*mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
const mat2 R=mat2(.8,.6,-.6,.8);
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*gnoise(p);p=R*p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
vec3 earth(vec2 p,float t){
 float y=(p.y+.8)/1.75;float yc=clamp(y,0.,1.);
 vec2 q=vec2(p.x*2.4,p.y*1.4-t*2.2);
 vec2 wv=vec2(fbm(q+vec2(0.,t*.3)),fbm(q+vec2(5.2,1.3)));
 float n=fbm(q+1.5*wv-vec2(0.,t*.6));
 float det=fbm(q*2.6+wv*2.-vec2(0.,t*1.4));
 float sway=(n-.5)*.5*yc+sin(t*1.7)*.03*yc+uFlow*1.1*yc*yc;
 float w=.6*pow(yc,.45)*pow(1.-yc,.8)+.001;
 float dx=abs(p.x-sway)/w;
 float top=y+(n-.5)*.36+(det-.5)*.12;
 float body=(1.-smoothstep(.6,.97,dx+(det-.5)*.25))*smoothstep(-.02,.015,y)*(1.-smoothstep(.8,.95,top));
 float core=(1.-smoothstep(.05,.58,dx))*smoothstep(.06,.26,y)*(1.-smoothstep(.46,.76,top));
 float blue=(1.-smoothstep(0.,.2,y))*smoothstep(-.03,0.,y)*(1.-smoothstep(.35,.95,dx));
 vec3 bc=mix(vec3(1.,.34,.05),vec3(.35,.45,1.),clamp(uBlue*.55+uMorph*.3,0.,.7));
 vec3 c=bc*body*(1.3+.9*det)+mix(vec3(1.,.8,.45),vec3(1.,.95,.85),uHeat)*core*(2.+1.4*uHeat)*(1.-.65*uMorph)+vec3(.15,.35,1.)*blue*(1.4+uBlue);
 c*=(.78+.44*n)*(1.-.45*uMorph);
 float bz=(1.-smoothstep(0.,.35,y))*smoothstep(-.03,0.,y)*(1.-smoothstep(.4,1.,dx))*uMorph;c+=vec3(.2,.4,1.)*bz*1.2;
 vec2 hp=p*vec2(1.5,1.05)-vec2(sway*.5,.05);c+=bc*exp(-dot(hp,hp)*3.)*.26;
 return c;}
vec3 orb(vec2 p,float t){
 float b=1.-uMorph;
 p.y=(p.y-b*.55)/(1.+b*1.6);p.x/=(1.-b*.35);
 p.x=(p.x-uFlow*.55)/(1.+uFlow*1.3);
 float r=length(p)/.6;
 vec2 q=p*3.;
 float nn=fbm(q+vec2(t*.45,-t*.35)+.7*fbm(q*1.6-vec2(0.,t*.25)));
 float fil=fbm(p*8.-vec2(t*.3,t*.5)+nn*1.6);
 float sh=exp(-pow((r-.72-(nn-.5)*.1)/(.12+.05*uHeat),2.));
 float shell=sh*(.65+.7*fil);
 vec3 c=vec3(.25,.4,1.)*exp(-r*r*3.)*.35*b+vec3(.2,.42,1.)*shell*1.75+vec3(.7,.55,1.)*pow(sh,6.)*.9+vec3(1.,.6,.25)*pow(sh,3.)*uHeat*.9
   +vec3(.25,.35,1.)*exp(-r*r*2.2)*.26+vec3(.12,.22,.9)*exp(-r*r*.8)*.15;
 c*=(.85+.3*nn)*smoothstep(1.25,.7,length(p));
 return c;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 float t=uTime;
 vec2 p=uv/(.36*uSize);
 vec2 pe=p+vec2(0.,.12);pe.y=(pe.y+.8)*mix(1.,2.1,uMorph)-.8;pe.x*=mix(1.,.75,smoothstep(0.,.6,uMorph))*mix(1.,1.8,smoothstep(.55,.85,uMorph));
 float w=smoothstep(.5,.8,uMorph);
 vec3 ce=vec3(0.),cs=vec3(0.);
 if(w<.999)ce=earth(pe,t);
 if(w>.001)cs=orb((p-vec2(0.,-.35*(1.-w)))/mix(.4,1.,w),t);
 vec3 col=(ce*(1.-w)*(1.-w)+cs*w)*uInt;
 vec3 ec=mix(vec3(1.,.55,.2),vec3(.5,.62,1.),uMorph);
 for(int i=0;i<28;i++){
  float fi=float(i);float h1=hash12(vec2(fi,1.3)),h2=hash12(vec2(fi,7.1)),h3=hash12(vec2(fi,3.7));
  float life=fract(t*(.1+.1*h3)+h1);
  float ang=h2*6.2832;
  vec2 dirMicro=vec2(cos(ang),sin(ang))*.55;
  vec2 dirUp=vec2((h2-.5)*.25+sin(t*1.3+fi)*.04,1.1);
  vec2 dir=mix(dirUp,dirMicro,uMorph)+vec2(uFlow*1.6,0.);
  vec2 ep=vec2((h1-.5)*.12,-.05)+dir*life*.9*uSize*.36;
  vec2 dv=(uv-ep)*uRes.y/uPx;float d2=dot(dv,dv);
  float sz=.8+h3*1.1;
  float fade=smoothstep(0.,.1,life)*(1.-smoothstep(.45,1.,life));
  col+=ec*(exp(-d2/(sz*sz))*1.1+exp(-d2/(sz*sz*18.))*.22)*fade*uInt;
 }
 col=aces(col*.85);
 vec3 bg=vec3(.018,.022,.05)*(1.1-.9*length(uv));
 vec2 sc=floor(gl_FragCoord.xy/(2.*uPx));float sr=hash12(sc);
 bg+=vec3(.6,.7,1.)*.05*step(.9965,sr)*(.6+.4*sin(t*(1.+3.*fract(sr*91.))+sr*40.));
 vec3 o=bg+col;
 o+=(hash12(gl_FragCoord.xy+fract(t)*137.)-.5)/255.;
 gl_FragColor=vec4(o,1.);}`;

const UNIFORMS = ["uRes", "uTime", "uMorph", "uSize", "uInt", "uFlow", "uHeat", "uBlue", "uPx"] as const;
type Uniform = (typeof UNIFORMS)[number];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function gravityMode(g: number): string {
  if (g <= 0.01) return "Microgravity";
  if (Math.abs(g - 1) <= 0.05) return "Earth gravity";
  return g > 1 ? "Hypergravity" : "Partial gravity";
}

/** Compile the flame program; null when WebGL or the shader is unavailable. */
function createProgram(gl: WebGLRenderingContext): Record<Uniform, WebGLUniformLocation | null> | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("createShader failed");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "");
    return shader;
  };
  try {
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    return Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
      Uniform,
      WebGLUniformLocation | null
    >;
  } catch {
    return null;
  }
}

/**
 * A view port into a combustion chamber. The chamber stays dark: it is a
 * window onto a flame, not page chrome. Renders only while on screen; with
 * reduced motion the flame is drawn still and changes without easing.
 */
export function FlameChamber({ values, className }: { values: ChamberValues; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(values);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    target.current = values;
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    const uniforms = gl ? createProgram(gl) : null;
    if (!gl || !uniforms) {
      queueMicrotask(() => setSupported(false));
      return;
    }

    const animate = motionAllowed();
    const shown = { ...target.current, airflow: target.current.airflow ?? 0 };
    const maxScale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1));
    let scale = maxScale;
    let frameAverage = 16.7;
    let slowFrames = 0;
    let warmup = 90;
    let visible = true;
    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const width = Math.round(canvas.clientWidth * scale);
      const height = Math.round(canvas.clientHeight * scale);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      const heat = clamp01((shown.oxygen - 16) / 20);
      const lowPressure = clamp01((101 - shown.pressure) / 70);
      gl.uniform2f(uniforms.uRes, width, height);
      gl.uniform1f(uniforms.uTime, animate ? now / 1000 : 12);
      gl.uniform1f(uniforms.uPx, scale);
      gl.uniform1f(uniforms.uMorph, 1 - clamp01(Math.sqrt(shown.gravity / 0.6)));
      gl.uniform1f(uniforms.uSize, 0.75 + 0.55 * heat + 0.25 * lowPressure);
      gl.uniform1f(
        uniforms.uInt,
        (0.25 + 0.75 * clamp01((shown.oxygen - 10) / 9)) * (0.85 + 0.25 * heat) * (1 - 0.25 * lowPressure),
      );
      gl.uniform1f(uniforms.uFlow, shown.airflow);
      gl.uniform1f(uniforms.uHeat, heat);
      gl.uniform1f(uniforms.uBlue, lowPressure);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      frame = 0;
      const elapsed = now - last;
      last = now;
      // Supersample for crisp edges; step down if the GPU cannot hold 60 fps.
      if (warmup > 0) warmup--;
      else {
        frameAverage += (elapsed - frameAverage) * 0.05;
        slowFrames = frameAverage > 24 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        if (slowFrames > 45 && scale > 0.75) {
          scale = Math.max(0.75, scale * 0.82);
          slowFrames = 0;
          frameAverage = 16.7;
          warmup = 30;
        }
      }
      const goal = target.current;
      const blend = animate ? 1 - Math.exp(-Math.min(0.05, elapsed / 1000) * 14) : 1;
      shown.oxygen += (goal.oxygen - shown.oxygen) * blend;
      shown.pressure += (goal.pressure - shown.pressure) * blend;
      shown.gravity += (goal.gravity - shown.gravity) * blend;
      shown.airflow += ((goal.airflow ?? 0) - shown.airflow) * blend;
      draw(now);
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame === 0 && visible && !document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", start);
    start();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const hud = "absolute flex flex-col gap-px";
  const value = "font-mono text-[0.9375rem] font-medium text-ink tabular-nums";

  return (
    <figure className={className}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-[oklch(0.12_0.02_265)]">
        {supported ? (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Illustrative flame that changes shape with gravity, oxygen, pressure and airflow"
            className="absolute inset-0 block size-full"
          />
        ) : (
          <p className="absolute inset-0 grid place-items-center hatch px-6 text-center text-xs text-ink-muted">
            The flame illustration needs WebGL, which this browser has turned off. Everything else on this
            page works without it.
          </p>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 font-mono text-2xs text-ink-muted">
          <div className={cn(hud, "top-3 left-3.5")}>
            O₂<b className={value}>{values.oxygen.toFixed(1)} %</b>
          </div>
          <div className={cn(hud, "top-3 right-3.5 text-right")}>
            Pressure<b className={value}>{values.pressure.toFixed(1)} kPa</b>
          </div>
          <div className={cn(hud, "bottom-3 left-3.5")}>
            Gravity<b className={value}>{values.gravity.toFixed(3)} g</b>
          </div>
          <div className={cn(hud, "right-3.5 bottom-3 text-right")}>
            Airflow
            <b className={value}>
              {values.airflow === null ? "not set" : `${values.airflow.toFixed(2)} m/s`}
            </b>
          </div>
          <p className="absolute top-3 left-1/2 -translate-x-1/2 tracking-[0.14em] whitespace-nowrap text-accent uppercase">
            {gravityMode(values.gravity)}
          </p>
        </div>
      </div>
      <figcaption className="mt-2 text-2xs text-ink-faint">
        Illustration only. IGNIS does not simulate or predict fire.
      </figcaption>
    </figure>
  );
}
