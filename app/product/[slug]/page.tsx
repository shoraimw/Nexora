import Link from "next/link";
import type {Metadata} from "next";
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
 if(configured){const data=await liveCatalog().catch(()=>[]);const p=data.find(x=>x.slug===slug);if(!p)notFound();return <CommerceDetail product={p}/>;}
 const p=bySlug(slug);if(!p)notFound();
 return <main className="container detail-page"><Link href="/#shop" className="back-link"><ArrowLeft size={16}/> Back to collection</Link><div className="detail-grid"><div className="demo-detail-photo">{p.image?<img src={p.image} alt={p.name}/>:<span>{p.art}</span>}<small>ILLUSTRATIVE PRODUCT PREVIEW</small></div><div className="detail-copy"><p className="eyebrow">{p.category} / {p.id}</p><h1>{p.name}</h1><p className="detail-description">{p.description}</p><div className="detail-price">{currency(p.price)}<span>Demo price only</span></div><p className="detail-label">Sample variations</p><div className="variant-row">{p.variants.map(v=><span key={v}>{v}</span>)}</div><AddProductButton id={p.id}/><div className="detail-notice"><ShieldCheck size={19}/><p>Not a live listing. Final price, warranty, colors and stock require owner verification.</p></div><div className="detail-notice"><Truck size={19}/><p>Steadfast delivery is planned. No delivery estimate is confirmed yet.</p></div><h3>Concept features</h3><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul></div></div></main>;
}