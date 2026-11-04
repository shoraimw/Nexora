"use client";
import Link from "next/link";
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from "react";
import {ArrowRight,ArrowUpRight,ChevronLeft,ChevronRight,Sparkles} from "lucide-react";

const scenes=[
 {eyebrow:"THE NEXORA COLLECTION",title:["Your everyday,","upgraded."],description:"Discover the gadgets, audio and little tech upgrades that make every day feel a little more extraordinary.",cta:"Explore the collection",href:"/shop",label:"EVERYDAY TECH",number:"01",accent:"orange"},
 {eyebrow:"MAKE YOUR SPACE YOURS",title:["Build a better","desk setup."],description:"Thoughtful tools for focused work, creative flow and everything you make happen at your desk.",cta:"Explore PC accessories",href:"/category/pc-accessories",label:"DESK ESSENTIALS",number:"02",accent:"blue"},
 {eyebrow:"LEVEL UP YOUR PLAY",title:["Ready for your","next game?"],description:"Find the controllers, keyboards and audio gear that bring your gaming setup together.",cta:"Explore gaming",href:"/category/gaming",label:"GAMING GEAR",number:"03",accent:"violet"}
] as const;

export function Nexora3DHero(){
 const [active,setActive]=useState(0);
 const [reducedMotion,setReducedMotion]=useState(false);
 const [visible,setVisible]=useState(true);
 const [focused,setFocused]=useState(false);
 const stageRef=useRef<HTMLDivElement>(null);
 const scene=scenes[active];
 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncMotion=()=>setReducedMotion(media.matches);
  const syncVisibility=()=>setVisible(document.visibilityState==="visible");
  syncMotion();syncVisibility();
  media.addEventListener("change",syncMotion);
  document.addEventListener("visibilitychange",syncVisibility);
  return()=>{media.removeEventListener("change",syncMotion);document.removeEventListener("visibilitychange",syncVisibility);};
 },[]);
 useEffect(()=>{
  if(reducedMotion||!visible||focused)return;
  const timer=window.setInterval(()=>setActive(value=>(value+1)%scenes.length),6500);
  return()=>window.clearInterval(timer);
 },[reducedMotion,visible,focused]);
 const move=(direction:number)=>setActive(value=>(value+direction+scenes.length)%scenes.length);
 const handlePointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
  if(event.pointerType==="touch")return;
  const rect=event.currentTarget.getBoundingClientRect();
  const x=((event.clientX-rect.left)/rect.width-.5)*2;
  const y=((event.clientY-rect.top)/rect.height-.5)*2;
  event.currentTarget.style.setProperty("--pointer-rotate-y",(x*5).toFixed(2)+"deg");
  event.currentTarget.style.setProperty("--pointer-rotate-x",(y*-4).toFixed(2)+"deg");
 };
 const resetPointer=(event:ReactPointerEvent<HTMLDivElement>)=>{
  event.currentTarget.style.setProperty("--pointer-rotate-y","0deg");
  event.currentTarget.style.setProperty("--pointer-rotate-x","0deg");
 };
 return <section className="nexora-3d-hero" data-scene={scene.accent} aria-label="Featured Nexora collection" onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
  <div className="nexora-hero-noise" aria-hidden="true"/>
  <div className="nexora-hero-copy">
   <div className="nexora-hero-overline"><span className="nexora-hero-live-dot"/><span>THE FUTURE, IN YOUR EVERYDAY</span><Sparkles size={14}/></div>
   <span className="nexora-hero-eyebrow">{scene.eyebrow}</span>
   <h1>{scene.title[0]}<br/><span>{scene.title[1]}</span></h1>
   <p className="nexora-hero-description">{scene.description}</p>
   <div className="nexora-hero-actions"><Link className="nexora-hero-primary" href={scene.href}>{scene.cta}<ArrowUpRight size={17}/></Link><Link className="nexora-hero-secondary" href="/category/phones">Discover phones <ArrowRight size={15}/></Link></div>
   <div className="nexora-hero-proof"><div className="nexora-hero-proof-icon"><span>N.</span></div><div><strong>One place. Every upgrade.</strong><small>Explore 13 thoughtfully organised categories</small></div></div>
   <div className="nexora-hero-controls" aria-label="Featured promotions">
    <span className="nexora-hero-count"><b>{scene.number}</b><i>/ 03</i></span>
    <div className="nexora-hero-dots">{scenes.map((item,index)=><button key={item.number} type="button" aria-label={"Show promotion "+item.number} aria-pressed={active===index} className={active===index?"is-active":""} onClick={()=>setActive(index)}/>)}</div>
    <div className="nexora-hero-arrows"><button type="button" aria-label="Previous promotion" onClick={()=>move(-1)}><ChevronLeft size={17}/></button><button type="button" aria-label="Next promotion" onClick={()=>move(1)}><ChevronRight size={17}/></button></div>
   </div>
  </div>
  <div ref={stageRef} className="nexora-hero-visual" onPointerMove={handlePointerMove} onPointerLeave={resetPointer} aria-label="Decorative floating 3D gadget showcase">
   <div className="nexora-hero-visual-grid" aria-hidden="true"/>
   <div className="nexora-hero-ambient nexora-hero-ambient-one" aria-hidden="true"/>
   <div className="nexora-hero-ambient nexora-hero-ambient-two" aria-hidden="true"/>
   <div className="nexora-hero-orbit nexora-hero-orbit-one" aria-hidden="true"/>
   <div className="nexora-hero-orbit nexora-hero-orbit-two" aria-hidden="true"/>
   <div className="nexora-stage-parallax" aria-hidden="true">
    <div className="nexora-device nexora-device-phone">
     <div className="nexora-phone-frame"><div className="nexora-phone-screen">
      <div className="nexora-phone-island"/>
      <div className="nexora-phone-status"><span>9:41</span><span>•••</span></div>
      <div className="nexora-phone-brand">NEXORA <span>®</span></div>
      <div className="nexora-phone-art"><div/><div/><div/></div>
      <div className="nexora-phone-copy"><small>DISCOVER YOUR NEXT</small><strong>MAKE<br/>IT YOURS.</strong><span>TECH FOR EVERY DAY</span></div>
      <div className="nexora-phone-bottom"><span/><span/><span/><span/></div>
     </div></div>
     <div className="nexora-phone-side"/>
    </div>
    <div className="nexora-device nexora-device-watch">
     <div className="nexora-watch-strap nexora-watch-strap-top"/>
     <div className="nexora-watch-case"><div className="nexora-watch-screen"><small>MON</small><strong>09:41</strong><div className="nexora-watch-rings"><i/><i/><i/></div><span>MOVE · FOCUS · GO</span></div></div>
     <div className="nexora-watch-strap nexora-watch-strap-bottom"/>
    </div>
    <div className="nexora-device nexora-device-headphones">
     <div className="nexora-headphone-band"/>
     <div className="nexora-headphone-cup nexora-headphone-cup-left"><i/></div>
     <div className="nexora-headphone-cup nexora-headphone-cup-right"><i/></div>
     <div className="nexora-headphone-glint"/>
    </div>
    <div className="nexora-device nexora-device-earbuds">
     <div className="nexora-earbud-case"><div className="nexora-earbud-lid"/><div className="nexora-earbud-light"/></div>
     <div className="nexora-earbud-piece nexora-earbud-piece-one"><i/></div>
     <div className="nexora-earbud-piece nexora-earbud-piece-two"><i/></div>
    </div>
    <div className="nexora-hero-floating-label nexora-floating-label-top"><span>01 / NEXORA STUDIO</span><strong>DESIGNED TO CONNECT</strong></div>
    <div className="nexora-hero-floating-label nexora-floating-label-bottom"><span>CURATED FOR EVERY DAY</span><strong>{scene.label}</strong></div>
    <div className="nexora-hero-spark nexora-spark-one"/><div className="nexora-hero-spark nexora-spark-two"/><div className="nexora-hero-spark nexora-spark-three"/>
   </div>
   <div className="nexora-hero-stage-index"><span>NX / 2026</span><span>SCROLL TO EXPLORE <i>↓</i></span></div>
  </div>
 </section>;
}
