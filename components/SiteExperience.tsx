"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {ArrowUp,MessageCircle,Moon,Sun,X} from "lucide-react";
export function ThemeToggle(){
 const [theme,setTheme]=useState<"light"|"dark">("light");const [ready,setReady]=useState(false);
 useEffect(()=>{let selected:"light"|"dark"="light";try{const saved=localStorage.getItem("nexora_theme");selected=saved==="dark"||saved==="light"?saved:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}catch{}setTheme(selected);document.documentElement.dataset.theme=selected;setReady(true);},[]);
 function toggle(){const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem("nexora_theme",next);}catch{}}
 return <button type="button" className="nexora-theme-toggle" onClick={toggle} aria-label={ready?(theme==="dark"?"Switch to light mode":"Switch to dark mode"):"Toggle colour theme"} title={theme==="dark"?"Light mode":"Dark mode"}>{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button>;
}
export function SiteExperience(){
 const progress=useRef<HTMLSpanElement>(null);const [showTop,setShowTop]=useState(false);const [cookieVisible,setCookieVisible]=useState(false);const [cookieReady,setCookieReady]=useState(false);
 useEffect(()=>{try{setCookieVisible(!localStorage.getItem("nexora_cookie_choice"));}catch{setCookieVisible(true);}setCookieReady(true);let frame=0;const update=()=>{if(frame)return;frame=window.requestAnimationFrame(()=>{const root=document.documentElement;const available=Math.max(1,root.scrollHeight-window.innerHeight);const amount=Math.min(100,Math.max(0,window.scrollY/available*100));if(progress.current)progress.current.style.width=amount+"%";setShowTop(window.scrollY>520);frame=0;});};update();window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update);if(frame)window.cancelAnimationFrame(frame);};},[]);
 useEffect(()=>{const addCampaign=(event:MouseEvent)=>{if(!(event.target instanceof Element))return;const anchor=event.target.closest("a[href]") as HTMLAnchorElement|null;if(!anchor||anchor.dataset.noUtm==="true")return;try{const url=new URL(anchor.href,window.location.href);if(!["http:","https:"].includes(url.protocol)||url.origin===window.location.origin)return;if(!url.searchParams.has("utm_source"))url.searchParams.set("utm_source","nexora");if(!url.searchParams.has("utm_medium"))url.searchParams.set("utm_medium","referral");if(!url.searchParams.has("utm_campaign"))url.searchParams.set("utm_campaign","website_outbound");anchor.href=url.toString();}catch{}};document.addEventListener("click",addCampaign,true);return()=>document.removeEventListener("click",addCampaign,true);},[]);
 useEffect(()=>{
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;
  const selector=".retail-category-card,.nexora-brand-tile,.retail-product-card,.retail-promo";
  let sequence=0;
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
   });
  },{threshold:.12,rootMargin:"0px 0px -7% 0px"});
  const seen=new WeakSet<Element>();
  const register=(root:ParentNode)=>{
   const nodes:Element[]=[];
   if(root instanceof Element&&root.matches(selector))nodes.push(root);
   root.querySelectorAll?.(selector).forEach(node=>nodes.push(node));
   nodes.forEach(node=>{
    if(seen.has(node))return;
    seen.add(node);
    const el=node as HTMLElement;
    el.style.setProperty("--reveal-delay",Math.min(sequence%5,4)*65+"ms");
    sequence++;
    el.classList.add("nexora-reveal");
    observer.observe(el);
   });
  };
  register(document);
  const mutations=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node instanceof Element)register(node);})));
  if(document.body)mutations.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();mutations.disconnect();};
 },[]);
 useEffect(()=>{const decorateOne=(element:Element)=>{const pre=element as HTMLElement;if(pre.dataset.nexoraCopyReady)return;pre.dataset.nexoraCopyReady="true";const button=document.createElement("button");button.type="button";button.className="nexora-copy-code";button.textContent="Copy";button.setAttribute("aria-label","Copy code snippet");button.addEventListener("click",async()=>{const clone=pre.cloneNode(true) as HTMLElement;clone.querySelector(".nexora-copy-code")?.remove();const text=clone.querySelector("code")?.textContent||clone.textContent||"";try{await navigator.clipboard.writeText(text);button.textContent="Copied";button.classList.add("is-copied");}catch{button.textContent="Copy unavailable";}window.setTimeout(()=>{button.textContent="Copy";button.classList.remove("is-copied");},1500);});pre.appendChild(button);};const decorate=(root:ParentNode)=>{if(root instanceof Element&&root.matches("pre"))decorateOne(root);root.querySelectorAll("pre").forEach(decorateOne);};decorate(document);const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node instanceof Element)decorate(node);})));if(document.body)observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();},[]);
 function saveCookieChoice(choice:"acknowledged"|"essential"){try{localStorage.setItem("nexora_cookie_choice",choice);}catch{}setCookieVisible(false);}
 return <><div className="nexora-scroll-progress" aria-hidden="true"><span ref={progress}/></div>{showTop&&<button type="button" className="nexora-scroll-top" aria-label="Scroll back to top" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><ArrowUp size={19}/></button>}<Link href="/contact" className={"nexora-floating-contact"+(cookieReady&&cookieVisible?" is-hidden":"")}><MessageCircle size={17}/><span>Contact Nexora</span></Link>{cookieReady&&cookieVisible&&<aside className="nexora-cookie-banner" aria-label="Cookie and storage notice"><button type="button" className="nexora-cookie-close" aria-label="Dismiss cookie notice" onClick={()=>saveCookieChoice("essential")}><X size={16}/></button><strong>Small note about cookies</strong><p>Nexora uses essential browser storage for your cart and preferences. Optional analytics cookies are not enabled.</p><div><button type="button" onClick={()=>saveCookieChoice("essential")}>Essential only</button><button type="button" className="is-primary" onClick={()=>saveCookieChoice("acknowledged")}>Okay</button></div></aside>}</>;
}
