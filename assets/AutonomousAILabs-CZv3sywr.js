import{r as a,j as e,u as Q,m as A}from"./index-DAwiYBkR.js";import{R as Y,T as $,P as J,M as K}from"./Triangle-DfWMHKQ0.js";const X="#ffffff",B=d=>{const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(d);return t?[parseInt(t[1],16)/255,parseInt(t[2],16)/255,parseInt(t[3],16)/255]:[1,1,1]},G=(d,t,n)=>{switch(d){case"top-left":return{anchor:[0,-.2*n],dir:[0,1]};case"top-right":return{anchor:[t,-.2*n],dir:[0,1]};case"left":return{anchor:[-.2*t,.5*n],dir:[1,0]};case"right":return{anchor:[(1+.2)*t,.5*n],dir:[-1,0]};case"bottom-left":return{anchor:[0,(1+.2)*n],dir:[0,-1]};case"bottom-center":return{anchor:[.5*t,(1+.2)*n],dir:[0,-1]};case"bottom-right":return{anchor:[t,(1+.2)*n],dir:[0,-1]};default:return{anchor:[.5*t,-.2*n],dir:[0,1]}}},Z=({raysOrigin:d="top-center",raysColor:t=X,raysSpeed:n=1,lightSpread:f=1,rayLength:g=2,pulsating:p=!1,fadeDistance:v=1,saturation:u=1,followMouse:y=!0,mouseInfluence:s=.1,noiseAmount:b=0,distortion:w=0,className:L=""})=>{const o=a.useRef(null),C=a.useRef(null),R=a.useRef(null),I=a.useRef({x:.5,y:.5}),j=a.useRef({x:.5,y:.5}),S=a.useRef(null),E=a.useRef(null),h=a.useRef(null),[F,H]=a.useState(!1),D=a.useRef(null);return a.useEffect(()=>{if(o.current)return D.current=new IntersectionObserver(r=>{const i=r[0];H(i.isIntersecting)},{threshold:.1}),D.current.observe(o.current),()=>{D.current&&(D.current.disconnect(),D.current=null)}},[]),a.useEffect(()=>!F||!o.current?void 0:(h.current&&(h.current(),h.current=null),(async()=>{if(!o.current||(await new Promise(c=>setTimeout(c,10)),!o.current))return;const i=new Y({dpr:Math.min(window.devicePixelRatio,2),alpha:!0});R.current=i;const l=i.gl;for(l.canvas.style.width="100%",l.canvas.style.height="100%";o.current.firstChild;)o.current.removeChild(o.current.firstChild);o.current.appendChild(l.canvas);const P=`
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`,N=`precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`,m={iTime:{value:0},iResolution:{value:[1,1]},rayPos:{value:[0,0]},rayDir:{value:[0,1]},raysColor:{value:B(t)},raysSpeed:{value:n},lightSpread:{value:f},rayLength:{value:g},pulsating:{value:p?1:0},fadeDistance:{value:v},saturation:{value:u},mousePos:{value:[.5,.5]},mouseInfluence:{value:s},noiseAmount:{value:b},distortion:{value:w}};C.current=m;const T=new $(l),U=new J(l,{vertex:P,fragment:N,uniforms:m}),z=new K(l,{geometry:T,program:U});E.current=z;const k=()=>{if(!o.current||!i)return;i.dpr=Math.min(window.devicePixelRatio,2);const{clientWidth:c,clientHeight:x}=o.current;i.setSize(c,x);const W=i.dpr,O=c*W,V=x*W;m.iResolution.value=[O,V];const{anchor:_,dir:q}=G(d,O,V);m.rayPos.value=_,m.rayDir.value=q},M=c=>{if(!(!R.current||!C.current||!E.current)){m.iTime.value=c*.001,y&&s>0&&(j.current.x=j.current.x*.92+I.current.x*(1-.92),j.current.y=j.current.y*.92+I.current.y*(1-.92),m.mousePos.value=[j.current.x,j.current.y]);try{i.render({scene:z}),S.current=requestAnimationFrame(M)}catch(x){console.warn("WebGL rendering error:",x);return}}};window.addEventListener("resize",k),k(),S.current=requestAnimationFrame(M),h.current=()=>{if(S.current&&(cancelAnimationFrame(S.current),S.current=null),window.removeEventListener("resize",k),i)try{const c=i.gl.canvas,x=i.gl.getExtension("WEBGL_lose_context");x&&x.loseContext(),c&&c.parentNode&&c.parentNode.removeChild(c)}catch(c){console.warn("Error during WebGL cleanup:",c)}R.current=null,C.current=null,E.current=null}})(),()=>{h.current&&(h.current(),h.current=null)}),[F,d,t,n,f,g,p,v,u,y,s,b,w]),a.useEffect(()=>{if(!C.current||!o.current||!R.current)return;const r=C.current,i=R.current;r.raysColor.value=B(t),r.raysSpeed.value=n,r.lightSpread.value=f,r.rayLength.value=g,r.pulsating.value=p?1:0,r.fadeDistance.value=v,r.saturation.value=u,r.mouseInfluence.value=s,r.noiseAmount.value=b,r.distortion.value=w;const{clientWidth:l,clientHeight:P}=o.current,N=i.dpr,{anchor:m,dir:T}=G(d,l*N,P*N);r.rayPos.value=m,r.rayDir.value=T},[t,n,f,d,g,p,v,u,s,b,w]),a.useEffect(()=>{const r=i=>{if(!o.current||!R.current)return;const l=o.current.getBoundingClientRect(),P=(i.clientX-l.left)/l.width,N=(i.clientY-l.top)/l.height;I.current={x:P,y:N}};if(y)return window.addEventListener("mousemove",r),()=>window.removeEventListener("mousemove",r)},[y]),e.jsx("div",{ref:o,className:`light-rays-container ${L}`.trim()})};function re(){Q({title:"Our Destiny — Research & Development Labs",description:"ODRD P.A.G.I Labs — advancing Personalized Artificial General Intelligence for Human Ecology Systems. Fourteen years of research, mentored by Mr. Shahad P."});const[d,t]=a.useState({w:1280,h:800});a.useEffect(()=>{const s=()=>t({w:window.innerWidth,h:window.innerHeight});return s(),window.addEventListener("resize",s),()=>window.removeEventListener("resize",s)},[]);const n=d.w<768,f=Math.max(1,d.h/d.w),g=2.6*f,p=1.5*f,v=n?1.05:.9,u={hidden:{opacity:0,y:50},visible:{opacity:1,y:0,transition:{duration:1,ease:[.16,1,.3,1]}}},y=[{category:"Computer Vision",title:"The Autonomous Specialist",items:["2D/3D Bounding Boxes: Precise object detection for domestic & industrial environments.","Semantic & Instance Segmentation: Pixel-perfect labeling for robotics navigation.","LiDAR Point Cloud Annotation: 3D spatial reasoning for autonomous systems.","Multi-Modal Fusion: Combining sensor data for robust scene understanding.","Edge AI Optimization: Deploying vision models for real-time inference on edge devices."]},{category:"Natural Language",title:"AI Model Training & OS",items:["RLHF: Human ranking and rewriting for LLMs.","Technical Prompt Engineering: Creating complex prompts for edge cases.","Quality Assurance & Red Teaming: Auditing datasets for accuracy.","Voice-Driven Control Systems: Seamless device & home automation interaction.","Intent Recognition & Execution: Translating user intent into precise system commands."]},{category:"Edge Computing",title:"Intelligence at the Source",items:["Real-Time Inference: Millisecond-level latency decision-making.","Privacy-First Processing: Sensitive data processed locally—no cloud required.","Bandwidth Optimization: Only insights transmitted, reducing network congestion.","Offline Autonomy: Systems function independently for maximum resilience."]}];return e.jsxs("div",{className:"min-h-screen pb-32 bg-[#0a0a0a] text-white",children:[e.jsxs("section",{className:"relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-20 overflow-hidden",children:[e.jsx("div",{className:"absolute inset-0 pointer-events-none",style:{zIndex:0},children:e.jsx(Z,{raysOrigin:"top-center",raysColor:"#ffd27a",raysSpeed:.9,lightSpread:v,rayLength:g,fadeDistance:p,saturation:1,followMouse:!n,mouseInfluence:n?0:.08,noiseAmount:.05,distortion:.03})}),e.jsxs(A.div,{initial:"hidden",animate:"visible",variants:u,className:"relative z-10 max-w-5xl",children:[e.jsxs("h1",{className:"glow-soft font-[900] tracking-tighter leading-[0.95] mb-10",style:{fontSize:"clamp(2.4rem, 6.5vw, 6.5rem)"},children:["Our Destiny Research and",e.jsx("br",{}),"Development Labs"]}),e.jsxs("p",{className:"text-lg md:text-2xl text-[#9a9a9a] font-light max-w-3xl mx-auto leading-relaxed",children:["From 14 Years of R&D to Precision Data Solutions.",e.jsx("br",{}),e.jsx("span",{className:"text-white font-medium",children:"We don't just label data. We understand it."})]})]})]}),e.jsxs("div",{className:"px-6 md:px-20 pt-32",children:[e.jsxs(A.div,{initial:"hidden",whileInView:"visible",viewport:{once:!0,margin:"-100px"},variants:u,className:"mb-40 border-t border-[#222] pt-20",children:[e.jsxs("h2",{className:"text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight max-w-5xl text-gray-300",children:["Not a typical data processing vendor. We are a dedicated research collective with a singular vision: ",e.jsx("span",{className:"text-[#e33324]",children:"The creation of fully Autonomous Homes."})]}),e.jsxs("div",{className:"mt-12 grid grid-cols-1 md:grid-cols-3 gap-8",children:[e.jsxs("div",{className:"p-8 border border-[#222] rounded-3xl bg-[#111]",children:[e.jsx("h3",{className:"text-2xl font-bold mb-4",children:"Expertise, Not Just Labor"}),e.jsx("p",{className:"text-[#888] leading-relaxed",children:"Researchers and developers who truly understand computer vision and context."})]}),e.jsxs("div",{className:"p-8 border border-[#222] rounded-3xl bg-[#111]",children:[e.jsx("h3",{className:"text-2xl font-bold mb-4",children:"14 Years of Context"}),e.jsx("p",{className:"text-[#888] leading-relaxed",children:"We understand edge cases in sensor fusion and object detection because we have lived them."})]}),e.jsxs("div",{className:"p-8 border border-[#222] rounded-3xl bg-[#111]",children:[e.jsx("h3",{className:"text-2xl font-bold mb-4",children:"Mission-Driven Quality"}),e.jsx("p",{className:"text-[#888] leading-relaxed",children:"Every contract funds the future of Autonomous Living. We work with purpose."})]})]})]}),e.jsxs("div",{className:"mb-40",children:[e.jsx(A.h2,{initial:"hidden",whileInView:"visible",viewport:{once:!0},variants:u,className:"text-[10px] font-bold uppercase tracking-[0.3em] text-[#e33324] mb-12",children:"Technical Capabilities"}),e.jsx("div",{className:"flex flex-col border-t border-[#222]",children:y.map((s,b)=>e.jsxs(A.div,{initial:"hidden",whileInView:"visible",viewport:{once:!0},variants:u,className:"py-16 md:py-24 border-b border-[#222] flex flex-col lg:flex-row gap-10 hover:bg-[#111] hover:px-8 transition-all duration-700 rounded-2xl",children:[e.jsxs("div",{className:"lg:w-1/3",children:[e.jsx("p",{className:"text-sm font-bold tracking-widest uppercase text-[#888] mb-4",children:s.category}),e.jsx("h3",{className:"text-4xl md:text-5xl font-bold tracking-tighter text-white",children:s.title})]}),e.jsx("div",{className:"lg:w-2/3",children:e.jsx("ul",{className:"flex flex-col gap-6",children:s.items.map((w,L)=>e.jsxs("li",{className:"text-[#888] text-xl md:text-2xl font-light border-b border-[#222] pb-6 last:border-0 last:pb-0",children:[e.jsx("span",{className:"text-[#e33324] mr-4",children:"✓"}),w]},L))})})]},b))})]}),e.jsxs(A.div,{initial:"hidden",whileInView:"visible",viewport:{once:!0},variants:u,className:"relative overflow-hidden bg-white text-black rounded-[40px] md:rounded-[80px] py-32 px-6 flex flex-col items-center text-center",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-[0.2em] text-[#e33324] mb-6",children:"Partnership Value Proposition"}),e.jsx("h3",{className:"text-4xl md:text-7xl font-[900] tracking-tighter mb-8 max-w-4xl",children:"Let's Build the Future Together."}),e.jsx("p",{className:"text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl font-light",children:"We are ready to deploy our highly skilled R&D team to your workflows immediately. Superior Data Quality & Independent Innovation."}),e.jsxs("div",{className:"flex flex-wrap justify-center gap-6 mb-12",children:[e.jsx("span",{className:"px-6 py-2 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-widest",children:"Flexible Contract Terms"}),e.jsx("span",{className:"px-6 py-2 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-widest",children:"Strict Data Privacy"}),e.jsx("span",{className:"px-6 py-2 rounded-full border border-gray-300 text-xs font-bold uppercase tracking-widest",children:"NDA Compliant"})]}),e.jsx("a",{href:"mailto:nithinktoffical@gmail.com,hariprasad.m68@gmail.com?subject=Pilot%20Run%20Inquiry",className:"px-10 py-5 rounded-full bg-[#e33324] text-white text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors duration-300 mb-10",children:"Contact Us for a Pilot Run"}),e.jsxs("div",{className:"flex flex-col gap-2 text-sm md:text-base font-medium text-gray-500",children:[e.jsx("p",{children:"Email: nithinktoffical@gmail.com | hariprasad.m68@gmail.com"}),e.jsx("p",{children:"Phone: +91 9895867769 | +91 9207354765"}),e.jsx("p",{children:"Location: Sreekrishnapuram [PO], Palakkad, Kerala, India"})]})]})]})]})}export{re as default};
