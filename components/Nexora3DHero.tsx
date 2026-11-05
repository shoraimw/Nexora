"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,ArrowUpRight,ChevronLeft,ChevronRight} from "lucide-react";
import {Nexora3DScene} from "@/components/Nexora3DScene";

const scenes=[
 {eyebrow:"THE NEXORA COLLECTION",title:["Good tech.","Better every day."],description:"Find the devices and everyday essentials that fit your life—from the first charge to the last song.",cta:"Shop the collection",href:"/shop",label:"EVERYDAY TECH",number:"01",accent:"orange"},
 {eyebrow:"MAKE ROOM FOR BETTER WORK",title:["A better desk.","A clearer mind."],description:"Build a setup that feels right for focused work, creative flow and everything you make happen.",cta:"Explore desk essentials",href:"/category/pc-accessories",label:"DESK ESSENTIALS",number:"02",accent:"blue"},
 {eyebrow:"READY WHEN YOU ARE",title:["Play your way.","Go a little further."],description:"Find the controllers, keyboards and audio gear that bring your gaming setup together.",cta:"Explore gaming",href:"/category/gaming",label:"GAMING GEAR",number:"03",accent:"violet"}
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
  <div className="nexora-hero-copy">
   <div className="nexora-hero-overline">
    <span className="nexora-hero-live-dot"/>
    <span>{scene.eyebrow}</span>
   </div>
   <h1>{scene.title[0]}<br/><span>{scene.title[1]}</span></h1>
   <p className="nexora-hero-description">{scene.description}</p>
   <div className="nexora-hero-actions">
    <Link className="nexora-hero-primary" href={scene.href}>{scene.cta}<ArrowUpRight size={17}/></Link>
    <Link className="nexora-hero-secondary" href="/#featured-categories">Browse categories <ArrowRight size={15}/></Link>
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

  <div className="nexora-hero-visual" aria-label="Nexora interactive 3D product studio">
   <div className="nexora-hero-visual-grid" aria-hidden="true"/>
   <Nexora3DScene label={scene.label}/>
   <div className="nexora-hero-stage-index" aria-hidden="true">
    <span>NX / PRODUCT STUDIO</span><span>DRAG TO ROTATE <i>↗</i></span>
   </div>
  </div>
 </section>;
}
