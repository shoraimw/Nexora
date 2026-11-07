import Link from "next/link";
import type {Metadata} from "next";
import {cookies} from "next/headers";
import type {Locale} from "@/lib/i18n";
import {translate,formatBDT} from "@/lib/i18n";
import {notFound} from "next/navigation";
import {ArrowLeft,ShieldCheck,Truck} from "lucide-react";
import {products,bySlug,currency} from "@/lib/catalog";
import {AddProductButton} from "@/components/AddProductButton";
import {configured} from "@/lib/server";
import {liveCatalog} from "@/lib/catalog-live";
import {CommerceDetail} from "@/components/CommerceDetail";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const product=configured?(await liveCatalog().catch(()=>[])).find(x=>x.slug===slug):bySlug(slug);
 if(!product)return {title:"Product not found",robots:{index:false,follow:false}};
 const title="title" in product?product.title:product.name;
 const description=(product.description||"Discover this gadget at Nexora.").replace(/\s+/g," ").slice(0,160);
 const image="images" in product?product.images[0]?.url:product.image;
 return {title:title+" | Nexora",description,openGraph:{title:title+" | Nexora",description,type:"website",images:image?[{url:image}]:[]},twitter:{card:"summary_large_image",title:title+" | Nexora",description,images:image?[image]:[]}};
}

export async function generateStaticParams(){return products.map(p=>({slug:p.slug}));}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const locale:Locale=(await cookies()).get("nexora_locale")?.value==="bn"?"bn":"en";
 const t=(value:string)=>translate(locale,value);
 if(configured){const data=await liveCatalog().catch(()=>[]);const product=data.find(x=>x.slug===slug);if(!product)notFound();return <CommerceDetail product={product}/>;}
 const p=bySlug(slug);if(!p)notFound();
 return <main className="container detail-page"><Link href="/#shop" className="back-link"><ArrowLeft size={16}/> {t("Back to collection")}</Link><div className="detail-grid"><div className="demo-detail-photo">{p.image?<img src={p.image} alt={p.name}/>:<span>{p.art}</span>}<small>{t("ILLUSTRATIVE PRODUCT PREVIEW")}</small></div><div className="detail-copy"><p className="eyebrow">{t(p.category)} / {p.id}</p><h1>{p.name}</h1><p className="detail-description">{p.description}</p><div className="detail-price">{formatBDT(p.price*100,locale)}<span>{t("Demo price only")}</span></div><p className="detail-label">{t("Sample variations")}</p><div className="variant-row">{p.variants.map(v=><span key={v}>{v}</span>)}</div><AddProductButton id={p.id}/><div className="detail-notice"><ShieldCheck size={19}/><p>{t("Not a live listing. Final price, warranty, colors and stock require owner verification.")}</p></div><div className="detail-notice"><Truck size={19}/><p>{t("Steadfast delivery is planned. No delivery estimate is confirmed yet.")}</p></div><h3>{t("Concept features")}</h3><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul></div></div>
 <nav className="detail-info-tabs" aria-label={t("Product information")}><a href="#preview-description">{t("Description")}</a><a href="#preview-specifications">{t("Specifications")}</a><a href="#preview-reviews">{t("Customer reviews")}</a></nav>
 <section id="preview-description" className="detail-info-section"><span className="retail-eyebrow">{t("PRODUCT DETAILS")}</span><h2>{t("Description")}</h2><p className="detail-long-description">{p.description}</p><p className="detail-muted">{t("Illustrative preview listing. Product details must be verified by Nexora before real sales.")}</p></section>
 <section id="preview-specifications" className="detail-info-section"><span className="retail-eyebrow">{t("PRODUCT INFORMATION")}</span><h2>{t("Specifications")}</h2><table className="spec-table"><tbody><tr><th>{t("Category")}</th><td>{t(p.category)}</td></tr><tr><th>{t("Connection")}</th><td>{t(p.connectionType||"Not specified")}</td></tr><tr><th>{t("Available colours")}</th><td>{p.variants.join(", ")}</td></tr></tbody></table><p className="detail-muted">{t("All attributes above are demo-only examples, not verified product specifications.")}</p></section>
 <section id="preview-reviews" className="detail-info-section"><span className="retail-eyebrow">{t("REAL CUSTOMER FEEDBACK")}</span><h2>{t("Customer reviews")}</h2><div className="detail-no-reviews"><strong>{t("No verified reviews available")}</strong><p>{t("Customer ratings and verified-purchase reviews appear once real Nexora products and orders are configured.")}</p></div></section>
 </main>;
}