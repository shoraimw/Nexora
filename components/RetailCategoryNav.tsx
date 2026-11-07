"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowRight,ChevronDown} from "lucide-react";
import {categoryHref} from "@/lib/store-taxonomy";
import {useStoreCategories} from "@/components/useStoreCategories";
import {useT} from "@/components/LanguageProvider";

export function RetailCategoryNav(){
 const navRef=useRef<HTMLElement|null>(null);
 const categories=useStoreCategories();
 const t=useT();
 const [activeSlug,setActiveSlug]=useState<string|null>(null);
 const [locked,setLocked]=useState(false);
 const activeCategory=categories.find(category=>category.slug===activeSlug);

 useEffect(()=>{
  const closeOnOutside=(event:PointerEvent)=>{
   if(navRef.current&&!navRef.current.contains(event.target as Node)){
    setActiveSlug(null);
    setLocked(false);
   }
  };
  const closeOnEscape=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){
    setActiveSlug(null);
    setLocked(false);
   }
  };
  document.addEventListener("pointerdown",closeOnOutside);
  document.addEventListener("keydown",closeOnEscape);
  return()=>{
   document.removeEventListener("pointerdown",closeOnOutside);
   document.removeEventListener("keydown",closeOnEscape);
  };
 },[]);

 useEffect(()=>{if(activeSlug&&!categories.some(category=>category.slug===activeSlug)){setActiveSlug(null);setLocked(false);}},[categories,activeSlug]);

 const preview=(slug:string)=>{
  if(!locked)setActiveSlug(slug);
 };
 const closePreview=()=>{
  if(!locked)setActiveSlug(null);
 };
 const dismiss=()=>{
  setActiveSlug(null);
  setLocked(false);
 };
 const toggle=(slug:string)=>{
  if(locked&&activeSlug===slug){
   setActiveSlug(null);
   setLocked(false);
   return;
  }
  setActiveSlug(slug);
  setLocked(true);
 };

 return <nav
  ref={navRef}
  className="retail-nav"
  aria-label={t("Shop categories")}
  onPointerLeave={closePreview}
  onBlurCapture={event=>{
   if(!locked&&!event.currentTarget.contains(event.relatedTarget as Node|null))setActiveSlug(null);
  }}
 >
  <div className="retail-container retail-nav-inner">
   <Link className="nexora-nav-all" href="/shop" onClick={dismiss}>{t("All products")}</Link>
   {categories.map(category=><button
    key={category.slug}
    type="button"
    className="nexora-nav-category-trigger"
    aria-expanded={activeSlug===category.slug}
    aria-controls="nexora-category-mega-menu"
    onPointerEnter={()=>preview(category.slug)}
    onFocus={()=>preview(category.slug)}
    onClick={()=>toggle(category.slug)}
   >
    <span>{t(category.name)}</span><ChevronDown size={12}/>
   </button>)}
  </div>
  {activeCategory&&<div
   id="nexora-category-mega-menu"
   className="nexora-category-mega"
   role="region"
   aria-label={t(activeCategory.name)+" "+t("category menu")}
   onPointerEnter={()=>preview(activeCategory.slug)}
  >
   <div className="retail-container nexora-category-mega-inner">
    <div className="nexora-category-mega-intro">
     <span>{t("SHOP CATEGORY")}</span>
     <strong>{t(activeCategory.name)}</strong>
     <p>{t(activeCategory.description||activeCategory.hint)}</p>
     <Link href={categoryHref(activeCategory)} onClick={dismiss}>{t("View all")} {t(activeCategory.name)}<ArrowRight size={14}/></Link>
    </div>
    <div className="nexora-category-mega-links">
     {activeCategory.subcategories.map(subcategory=><Link
      key={subcategory.slug}
      href={categoryHref(activeCategory,subcategory)}
      onClick={dismiss}
     >
      <span>{t(subcategory.name)}</span><small>{t(subcategory.hint)}</small>
     </Link>)}
    </div>
   </div>
  </div>}
 </nav>;
}
