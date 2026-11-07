"use client";
import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {useT} from "@/components/LanguageProvider";
type Props={brands:string[];preview?:boolean};
export function RetailBrandDirectory({brands,preview=false}:Props){
 const t=useT();
 const names=Array.from(new Set(brands.map(b=>b.trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b)).slice(0,24);
 if(!names.length)return null;
 return <section className="nexora-brand-directory" aria-label={t("Shop by brand")}>
  <div className="retail-section-heading"><div><span className="retail-eyebrow">{t("EXPLORE OUR COLLECTION")}</span><h2>{t("Brands By Shop")}</h2><p>{t(preview?"Illustrative brand labels for the demo catalog.":"Browse products by available brands.")}</p></div><Link href="/shop" className="retail-section-link">{t("View all products")} <ArrowRight size={15}/></Link></div>
  <div className="nexora-brand-grid">{names.map(name=><Link key={name} href={"/shop?brand="+encodeURIComponent(name)} className="nexora-brand-tile"><span className="nexora-brand-monogram" aria-hidden="true">{name.slice(0,1).toUpperCase()}</span><strong>{name}</strong><small>{t("Explore")} <ArrowRight size={12}/></small></Link>)}</div>
 </section>;
}
