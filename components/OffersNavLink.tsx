"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {Gift} from "lucide-react";
import {useT} from "@/components/LanguageProvider";
export function OffersNavLink({compact=false}:{compact?:boolean}){
 const t=useT();
 const [count,setCount]=useState<number|null>(null);
 const pathname=usePathname();
 useEffect(()=>{
  let mounted=true;
  const load=async()=>{
   try{const response=await fetch("/api/offers",{cache:"no-store"});if(!response.ok)throw Error("Offers unavailable");const data=await response.json() as {offers?:unknown[]};if(mounted)setCount(Array.isArray(data.offers)?data.offers.length:0);}
   catch{if(mounted)setCount(null);}
  };
  void load();const interval=window.setInterval(()=>void load(),60000);
  return()=>{mounted=false;window.clearInterval(interval);};
 },[pathname]);
 const live=(count||0)>0;
 const label=count===0?(compact?t("No offers"):t("No offers now")):t("Offers");
 const ariaLabel=live?(String(count)+" "+t("active offer")+(count===1?"":" "+t("offers"))):count===0?t("No offers are active right now"):t("View Nexora offers");
 return <Link href="/offers" className={"retail-offers-nav"+(live?" is-live":count===0?" is-empty":"")+(compact?" retail-offers-nav-compact":"")} aria-label={ariaLabel}>
  <Gift size={compact?17:15}/><span>{label}</span>{live&&<span className="retail-offers-count">{count}</span>}
 </Link>;
}
