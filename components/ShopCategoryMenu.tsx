"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {ArrowUpRight,ChevronDown,Menu,Headphones,Watch,Cable,Lightbulb,GraduationCap,Gift,Heart} from "lucide-react";

const categories=[
 {name:"Audio",href:"/shop?category=Audio",Icon:Headphones},
 {name:"Wearables",href:"/shop?category=Wearables",Icon:Watch},
 {name:"Accessories",href:"/shop?category=Accessories",Icon:Cable},
 {name:"Desk Setup",href:"/shop?category=Desk%20Setup",Icon:Lightbulb},
 {name:"Student Picks",href:"/shop?category=Student%20Picks",Icon:GraduationCap},
 {name:"Mystery Box",href:"/shop?category=Mystery%20Box",Icon:Gift},
 {name:"Plushies",href:"/shop?category=Plushies",Icon:Heart}
];
export function ShopCategoryMenu(){
 const [open,setOpen]=useState(false);
 const wrapper=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const pathname=usePathname();
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{
  if(!open)return;
  const onPointerDown=(event:PointerEvent)=>{
   if(event.target instanceof Node&&!wrapper.current?.contains(event.target))setOpen(false);
  };
  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){
    setOpen(false);
    trigger.current?.focus();
   }
  };
  document.addEventListener("pointerdown",onPointerDown);
  document.addEventListener("keydown",onKeyDown);
  return()=>{
   document.removeEventListener("pointerdown",onPointerDown);
   document.removeEventListener("keydown",onKeyDown);
  };
 },[open]);
 return <div ref={wrapper} className="retail-category-dropdown" data-open={open?"true":"false"}>
  <button ref={trigger} type="button" className="retail-category-trigger" aria-expanded={open} aria-controls="nexora-category-menu" onClick={()=>setOpen(value=>!value)}>
   <Menu size={17}/> Shop by category <ChevronDown className={open?"chevron-open":""} size={14}/>
  </button>
  {open&&<div id="nexora-category-menu" className="retail-mega-menu" aria-label="Browse product categories">
   <div><strong>Browse categories</strong><p>Choose a category to see matching Nexora products.</p></div>
   <div className="retail-mega-links">{categories.map(({name,href,Icon})=><Link key={name} href={href} onClick={()=>setOpen(false)}><Icon size={17}/>{name}<ArrowUpRight size={13}/></Link>)}</div>
   <Link href="/shop" onClick={()=>setOpen(false)} className="retail-mega-all">View all products <ArrowUpRight size={14}/></Link>
  </div>}
 </div>;
}
