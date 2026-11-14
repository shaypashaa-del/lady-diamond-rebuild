// A round brilliant diamond, ray-traced in a fragment shader.
//
// The stone is a convex solid: the intersection of 57 half-spaces, one per facet
// (table, 8 bezels, 8 stars, 16 upper girdles, 8 pavilion mains, 16 lower girdles),
// cut to ideal proportions. Every pixel follows a real light path: Fresnel
// reflection off the crown, refraction in at n = 2.42, total internal reflection
// off the pavilion, and a dispersed exit (slightly different index per colour
// channel), which is where the "fire" comes from. No textures, no libraries.

const DEG = Math.PI / 180;
export const FACETS = 57;

function facetPlanes(stretch = 1): Float32Array {
  const out: number[] = [];
  const table = 0.56; // table width as a share of the diameter
  const crown = 34.5 * DEG;
  const star = 26.5 * DEG;
  const upper = 37.5 * DEG;
  const pavilion = 40.75 * DEG;
  const lower = 40.95 * DEG;
  const yTable = (1 - table) * Math.tan(crown);
  const side = (tilt: number, az: number, down: boolean, d: number) =>
    out.push(Math.sin(tilt) * Math.cos(az), (down ? -1 : 1) * Math.cos(tilt), Math.sin(tilt) * Math.sin(az), d);

  out.push(0, 1, 0, yTable);
  for (let k = 0; k < 8; k++) {
    const az = k * 45 * DEG;
    side(crown, az, false, Math.sin(crown));
    side(star, az + 22.5 * DEG, false, Math.sin(star) * table * Math.cos(22.5 * DEG) + Math.cos(star) * yTable);
    side(upper, az + 11.25 * DEG, false, Math.sin(upper));
    side(upper, az - 11.25 * DEG, false, Math.sin(upper));
    side(pavilion, az, true, Math.sin(pavilion));
    side(lower, az + 11.25 * DEG, true, Math.sin(lower));
    side(lower, az - 11.25 * DEG, true, Math.sin(lower));
  }
  // An oval is the same cut pulled along one axis: scaling the solid by `stretch`
  // in x turns each plane n.p <= d into (n.x / stretch, n.y, n.z).p <= d.
  if (stretch !== 1) {
    for (let i = 0; i < out.length; i += 4) {
      const nx = out[i] / stretch;
      const len = Math.hypot(nx, out[i + 1], out[i + 2]);
      out[i] = nx / len;
      out[i + 1] /= len;
      out[i + 2] /= len;
      out[i + 3] /= len;
    }
  }
  return new Float32Array(out);
}

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const frag = (bounces: number, samples: number) => `precision highp float;
uniform vec2 uRes;
uniform mat3 uRot;
uniform vec4 uP[${FACETS}];
uniform vec3 uLight;
uniform float uZoom;
uniform vec3 uAbsorb;
const float IOR=2.42;
const float F0=0.172;

float box(vec3 d,vec3 c,vec3 r,vec3 u,float w,float h){
  float f=dot(d,c);
  float x=dot(d,r)/max(f,1e-3);
  float y=dot(d,u)/max(f,1e-3);
  return step(0.,f)*smoothstep(w,w*.7,abs(x))*smoothstep(h,h*.7,abs(y));
}
// The room the stone sits in: almost black, a few soft panels and a field of small
// hard lights. Contrast between dark and light is what reads as brilliance, and
// the small lights are what flash as the stone turns.
vec3 env(vec3 d){
  float up=d.y*.5+.5;
  vec3 c=mix(vec3(.003,.003,.003),vec3(.022,.021,.02),up*up);
  c+=vec3(3.2,3.15,3.05)*box(d,vec3(0.,1.,.1),vec3(1.,0.,0.),vec3(0.,-.1,1.),.5,.34);
  c+=vec3(2.6,2.35,1.9)*box(d,normalize(vec3(-.86,.3,.42)),vec3(.44,0.,.86),vec3(0.,1.,0.),.1,.8);
  c+=vec3(2.2,2.35,2.6)*box(d,normalize(vec3(.9,.16,.4)),vec3(-.4,0.,.9),vec3(0.,1.,0.),.08,.66);
  c+=vec3(1.5,1.4,1.2)*box(d,normalize(vec3(.15,-.3,-.94)),vec3(1.,0.,.15),vec3(0.,1.,0.),.55,.1);
  // A lattice of pinpoint lights across the upper room.
  vec3 q=d*5.5;
  vec3 cell=floor(q);
  vec3 f=fract(q)-.5;
  float h=fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);
  float dotl=smoothstep(.16,.02,length(f))*step(.55,h)*smoothstep(-.35,.25,d.y);
  c+=dotl*mix(vec3(9.,8.2,6.6),vec3(7.,7.8,9.5),fract(h*7.3))*(.5+h);
  // A broken ring of light around the viewer: what a well-cut stone throws back
  // when it faces you, so the face-up view is the brightest moment of the turn.
  float ring=smoothstep(.3,.46,d.z)*smoothstep(.9,.76,d.z);
  c+=vec3(1.9,1.85,1.75)*ring*(.55+.45*sin(d.x*11.)*sin(d.y*11.+1.3));
  float k=max(dot(d,uLight),0.);
  c+=vec3(1.,.97,.9)*(pow(k,320.)*30.+pow(k,30.)*1.1);
  // The viewer's own silhouette blocks light from straight ahead.
  c*=1.-.9*smoothstep(.93,.99,d.z);
  return c;
}
vec3 envG(vec3 d){return env(uRot*d);}

vec4 shade(vec2 frag){
  vec2 uv=(frag*2.-uRes)/min(uRes.x,uRes.y);
  vec3 ro=vec3(0.,0.,5.6)*uRot;
  vec3 rd=normalize(vec3(uv*.232/uZoom,-1.))*uRot;

  float tN=-1e9,tF=1e9;vec3 n=vec3(0.);
  for(int i=0;i<${FACETS};i++){
    vec4 p=uP[i];
    float dn=dot(p.xyz,rd);
    float t=(p.w-dot(p.xyz,ro))/dn;
    if(dn<0.){if(t>tN){tN=t;n=p.xyz;}}else{tF=min(tF,t);}
  }
  if(tN>=tF||tN<0.)return vec4(0.);

  vec3 p=ro+rd*tN;
  float c0=max(dot(-rd,n),0.);
  float F=F0+(1.-F0)*pow(1.-c0,5.);
  vec3 col=F*envG(reflect(rd,n));
  vec3 d=refract(rd,n,1./IOR);
  vec3 thr=vec3(1.-F);

  for(int b=0;b<${bounces};b++){
    float t=1e9;vec3 m=vec3(0.,1.,0.);
    for(int i=0;i<${FACETS};i++){
      vec4 q=uP[i];
      float dn=dot(q.xyz,d);
      if(dn>1e-5){float tt=(q.w-dot(q.xyz,p))/dn;if(tt<t){t=tt;m=q.xyz;}}
    }
    p+=d*t;
    // Coloured stones: the body absorbs light along the path travelled inside.
    thr*=exp(-uAbsorb*t);
    float ci=dot(d,m);
    float s2=IOR*IOR*(1.-ci*ci);
    if(s2<1.){
      float ct=sqrt(1.-s2);
      float Fi=F0+(1.-F0)*pow(1.-ct,5.);
      // Dispersion: each colour leaves at its own angle. This is the "fire".
      vec3 e=vec3(envG(refract(d,-m,2.408)).r,envG(refract(d,-m,2.42)).g,envG(refract(d,-m,2.434)).b);
      e=mix(vec3(dot(e,vec3(.299,.587,.114))),e,.72);
      col+=thr*(1.-Fi)*e;
      thr*=Fi;
    }
    d=reflect(d,m);
    p-=m*2e-4;
  }
  col+=thr*envG(d)*.5;
  col=1.-exp(-col*1.25);
  return vec4(pow(col,vec3(.4545)),1.);
}

void main(){
  ${samples > 1
    ? "vec4 c=shade(gl_FragCoord.xy+vec2(.25,.12))+shade(gl_FragCoord.xy+vec2(-.25,-.12))+shade(gl_FragCoord.xy+vec2(.12,-.3));c/=3.;"
    : "vec4 c=shade(gl_FragCoord.xy);"}
  gl_FragColor=vec4(c.rgb,c.a);
}`;

export type GemOptions = {
  /** Body colour as absorption per unit length (0,0,0 is a colourless diamond). */
  absorb?: [number, number, number];
  /** 1 is round; above 1 pulls the outline into an oval. */
  stretch?: number;
  /** Internal reflections to follow (6 by default; 4 is plenty for a small accent). */
  bounces?: number;
};

export type Gem = {
  /** yaw and pitch in radians; light is a unit vector in room space. */
  draw(yaw: number, pitch: number, light: [number, number, number], zoom: number): void;
  /** Match the drawing buffer to the canvas' CSS size times `scale`. Returns true when it changed. */
  resize(scale: number): boolean;
  /** Fewer internal bounces: cheaper, slightly less sparkle. */
  lighten(): void;
  destroy(): void;
};

/** `fine` asks for 3 samples per pixel (smooth facet edges); phones use 1 at high density. */
export function createGem(canvas: HTMLCanvasElement, fine = false, options: GemOptions = {}): Gem | null {
  const opts: WebGLContextAttributes = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: "high-performance" };
  const gl = (canvas.getContext("webgl", opts) ?? canvas.getContext("experimental-webgl", opts)) as WebGLRenderingContext | null;
  if (!gl) return null;
  const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!hp || hp.precision < 23) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const link = (bounces: number, samples: number) => {
    const v = compile(gl.VERTEX_SHADER, VERT);
    const f = compile(gl.FRAGMENT_SHADER, frag(bounces, samples));
    const prog = gl.createProgram();
    if (!v || !f || !prog) return null;
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.bindAttribLocation(prog, 0, "a");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    return {
      prog,
      res: gl.getUniformLocation(prog, "uRes"),
      rot: gl.getUniformLocation(prog, "uRot"),
      planes: gl.getUniformLocation(prog, "uP"),
      light: gl.getUniformLocation(prog, "uLight"),
      zoom: gl.getUniformLocation(prog, "uZoom"),
      absorb: gl.getUniformLocation(prog, "uAbsorb"),
    };
  };

  let program = link(options.bounces ?? 6, fine ? 3 : 1);
  if (!program) return null;
  let light = 0;
  const steps: [number, number][] = fine ? [[6, 1], [4, 1]] : [[4, 1]];
  const planes = facetPlanes(options.stretch ?? 1);
  const absorb = options.absorb ?? [0, 0, 0];
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const rot = new Float32Array(9);

  return {
    draw(yaw, pitch, l, zoom) {
      if (!program || gl.isContextLost()) return;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
      // gem -> room: Rx(pitch) * Ry(yaw), column-major.
      rot[0] = cy; rot[1] = sx * sy; rot[2] = -cx * sy;
      rot[3] = 0; rot[4] = cx; rot[5] = sx;
      rot[6] = sy; rot[7] = -sx * cy; rot[8] = cx * cy;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program.prog);
      gl.uniform2f(program.res, canvas.width, canvas.height);
      gl.uniformMatrix3fv(program.rot, false, rot);
      gl.uniform4fv(program.planes, planes);
      gl.uniform3f(program.light, l[0], l[1], l[2]);
      gl.uniform1f(program.zoom, zoom);
      gl.uniform3f(program.absorb, absorb[0], absorb[1], absorb[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    resize(scale) {
      const w = Math.max(2, Math.round(canvas.clientWidth * scale));
      const h = Math.max(2, Math.round(canvas.clientHeight * scale));
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w;
      canvas.height = h;
      return true;
    },
    lighten() {
      // First drop the extra samples, then two of the internal bounces.
      const step = steps[light];
      if (!step) return;
      light++;
      const cheaper = link(step[0], step[1]);
      if (cheaper) program = cheaper;
    },
    destroy() {
      // The context itself is left alive: React re-runs effects on the same canvas,
      // and a context that was explicitly lost cannot be used again.
      if (program) gl.deleteProgram(program.prog);
      program = null;
      gl.deleteBuffer(buf);
    },
  };
}
