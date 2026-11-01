import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowLeft,ShieldCheck,Truck} from "lucide-react";
import {products,bySlug,currency} from "@/lib/catalog";
import {AddProductButton} from "@/components/AddProductButton";
import {configured} from "@/lib/server";
import {liveCatalog} from "@/lib/catalog-live";
import {CommerceDetail} from "@/components/CommerceDetail";
export const dynamic="force-dynamic";
export async function generateStaticParams(){return products.map(p=>({slug:p.slug}));}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(configured){const data=await liveCatalog().catch(()=>[]);const p=data.find(x=>x.slug===slug);if(!p)notFound();return <CommerceDetail product={p}/>;}
 const p=bySlug(slug);if(!p)notFound();
 return <main className="container detail-page"><Link href="/#shop" className="back-link"><ArrowLeft size={16}/> Back to collection</Link><div className="detail-grid"><div className={"detail-art "+p.accent}><span>{p.art}</span><small>ILLUSTRATIVE PRODUCT CONCEPT</small></div><div className="detail-copy"><p className="eyebrow">{p.category} / {p.id}</p><h1>{p.name}</h1><p className="detail-description">{p.description}</p><div className="detail-price">{currency(p.price)}<span>Demo price only</span></div><p className="detail-label">Sample variations</p><div className="variant-row">{p.variants.map(v=><span key={v}>{v}</span>)}</div><AddProductButton id={p.id}/><div className="detail-notice"><ShieldCheck size={19}/><p>Not a live listing. Final price, warranty, colors and stock require owner verification.</p></div><div className="detail-notice"><Truck size={19}/><p>Steadfast delivery is planned. No delivery estimate is confirmed yet.</p></div><h3>Concept features</h3><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul></div></div></main>;
}