"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,ArrowUpRight,ChevronLeft,ChevronRight,Sparkles} from "lucide-react";
import {Nexora3DScene} from "@/components/Nexora3DScene";

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
 const scene=scenes[active];

 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncMotion=()=>setReducedMotion(media.matches);
  const syncVisibility=()=>setVisible(document.visibilityState==="visible");
  syncMotion();
  syncVisibility();
  media.addEventListener("change",syncMotion);
  document.addEventListener("visibilitychange",syncVisibility);
  return()=>{
   media.removeEventListener("change",syncMotion);
   document.removeEventListener("visibilitychange",syncVisibility);
  };
 },[]);

 useEffect(()=>{
  if(reducedMotion||!visible||focused)return;
  const timer=window.setInterval(()=>setActive(value=>(value+1)%scenes.length),6500);
  return()=>window.clearInterval(timer);
 },[reducedMotion,visible,focused]);

 const move=(direction:number)=>setActive(value=>(value+direction+scenes.length)%scenes.length);

 return <section
  className="nexora-3d-hero"
  data-scene={scene.accent}
  aria-label="Featured Nexora collection"
  aria-roledescription="carousel"
  onFocusCapture={()=>setFocused(true)}
  onBlurCapture={event=>{
   if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);
  }}
 >
  <div className="nexora-hero-noise" aria-hidden="true"/>
  <div className="nexora-hero-copy">
   <div className="nexora-hero-overline">
    <span className="nexora-hero-live-dot"/>
    <span>THE FUTURE, IN YOUR EVERYDAY</span>
    <Sparkles size={14}/>
   </div>
   <span className="nexora-hero-eyebrow">{scene.eyebrow}</span>
   <h1>{scene.title[0]}<br/><span>{scene.title[1]}</span></h1>
   <p className="nexora-hero-description">{scene.description}</p>
   <div className="nexora-hero-actions">
    <Link className="nexora-hero-primary" href={scene.href}>{scene.cta}<ArrowUpRight size={17}/></Link>
    <Link className="nexora-hero-secondary" href="/category/phones">Discover phones <ArrowRight size={15}/></Link>
   </div>
   <div className="nexora-hero-proof">
    <div className="nexora-hero-proof-icon"><span>N.</span></div>
    <div><strong>One place. Every upgrade.</strong><small>Explore 13 thoughtfully organised categories</small></div>
   </div>
   <div className="nexora-hero-controls" aria-label="Featured promotions">
    <span className="nexora-hero-count"><b>{scene.number}</b><i>/ 03</i></span>
    <div className="nexora-hero-dots">
     {scenes.map((item,index)=><button key={item.number} type="button" aria-label={"Show promotion "+item.number} aria-pressed={active===index} className={active===index?"is-active":""} onClick={()=>setActive(index)}/>)}
    </div>
    <div className="nexora-hero-arrows">
     <button type="button" aria-label="Previous promotion" onClick={()=>move(-1)}><ChevronLeft size={17}/></button>
     <button type="button" aria-label="Next promotion" onClick={()=>move(1)}><ChevronRight size={17}/></button>
    </div>
   </div>
  </div>

  <div className="nexora-hero-visual" aria-label="Nexora 3D product studio">
   <div className="nexora-hero-visual-grid" aria-hidden="true"/>
   <div className="nexora-hero-ambient nexora-hero-ambient-one" aria-hidden="true"/>
   <div className="nexora-hero-ambient nexora-hero-ambient-two" aria-hidden="true"/>
   <div className="nexora-hero-orbit nexora-hero-orbit-one" aria-hidden="true"/>
   <div className="nexora-hero-orbit nexora-hero-orbit-two" aria-hidden="true"/>
   <Nexora3DScene label={scene.label}/>
   <div className="nexora-hero-floating-label nexora-floating-label-top" aria-hidden="true">
    <span>01 / NEXORA STUDIO</span><strong>DESIGNED TO CONNECT</strong>
   </div>
   <div className="nexora-hero-floating-label nexora-floating-label-bottom" aria-hidden="true">
    <span>CURATED FOR EVERY DAY</span><strong>{scene.label}</strong>
   </div>
   <div className="nexora-hero-stage-index" aria-hidden="true">
    <span>NX / 2026</span><span>DRAG TO ROTATE · SCROLL TO EXPLORE <i>↓</i></span>
   </div>
  </div>
 </section>;
}
