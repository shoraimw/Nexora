"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {ArrowUpRight,ChevronDown,Menu,Smartphone,Laptop,BatteryCharging,Tablet,ShieldCheck,Watch,Headphones,Keyboard,Camera,Lightbulb,Gamepad2,Plane,Grid2X2,Router} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {storeCategories,categoryHref} from "@/lib/store-taxonomy";
import {useT} from "@/components/LanguageProvider";

const icons:Record<string,LucideIcon>={
 "Phones":Smartphone,"Mac":Laptop,"Phone Accessories":BatteryCharging,"Tablets":Tablet,
 "Cases & Protectors":ShieldCheck,"Watches":Watch,"Headphones & Speakers":Headphones,
 "PC Accessories":Keyboard,"Camera":Camera,"Gadgets":Lightbulb,"Networking":Router,
 "Gaming":Gamepad2,"Drone":Plane
};
export function ShopCategoryMenu(){
 const t=useT();
 const [open,setOpen]=useState(false);
 const wrapper=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const pathname=usePathname();
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{
  if(!open)return;
  const onPointerDown=(event:PointerEvent)=>{if(event.target instanceof Node&&!wrapper.current?.contains(event.target))setOpen(false);};
  const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);trigger.current?.focus();}};
  document.addEventListener("pointerdown",onPointerDown);
  document.addEventListener("keydown",onKeyDown);
  return()=>{document.removeEventListener("pointerdown",onPointerDown);document.removeEventListener("keydown",onKeyDown);};
 },[open]);
 return <div ref={wrapper} className="retail-category-dropdown" data-open={open?"true":"false"}>
  <button ref={trigger} type="button" className="retail-category-trigger" aria-expanded={open} aria-controls="nexora-category-menu" onClick={()=>setOpen(value=>!value)}>
   <Menu size={17}/> {t("Categories")} <ChevronDown className={open?"chevron-open":""} size={14}/>
  </button>
  {open&&<div id="nexora-category-menu" className="retail-mega-menu retail-mega-menu-catalog" aria-label={t("Browse product categories")}>
   <div className="retail-mega-heading"><strong>{t("Explore Nexora categories")}</strong><p>{t("Browse a collection or jump straight to a product type.")}</p></div>
   <div className="retail-mega-category-grid">{storeCategories.map(category=>{const Icon=icons[category.name]||Grid2X2;return <section className="retail-mega-category" key={category.slug}>
    <Link className="retail-mega-category-title" href={categoryHref(category)} onClick={()=>setOpen(false)}><Icon size={18}/><strong>{t(category.name)}</strong><ArrowUpRight size={13}/></Link>
    <div>{category.subcategories.slice(0,5).map(subcategory=><Link key={subcategory.slug} href={categoryHref(category,subcategory)} onClick={()=>setOpen(false)}>{t(subcategory.name)}</Link>)}</div>
    <Link className="retail-mega-view-all" href={categoryHref(category)} onClick={()=>setOpen(false)}>{t("View all")} <ArrowUpRight size={12}/></Link>
   </section>;})}</div>
   <Link href="/shop" onClick={()=>setOpen(false)} className="retail-mega-all">{t("View all products")} <ArrowUpRight size={14}/></Link>
  </div>}
 </div>;
}
