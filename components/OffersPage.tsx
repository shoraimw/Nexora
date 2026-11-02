"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,CalendarClock,Gift,Copy,CheckCircle2} from "lucide-react";
type Offer={id:string;title:string;description:string;badge:string;coupon_code:string|null;target_url:string;cta_label:string;starts_at:string|null;ends_at:string|null};
function dateLabel(value:string|null){return value?new Date(value).toLocaleString("en-BD",{dateStyle:"medium",timeStyle:"short"}):null;}
export function OffersPage(){
 const [offers,setOffers]=useState<Offer[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [copied,setCopied]=useState("");
 useEffect(()=>{
  let mounted=true;
  const load=async()=>{
   try{const response=await fetch("/api/offers",{cache:"no-store"});const data=await response.json();if(!response.ok)throw Error(data.error||"Offers are temporarily unavailable.");if(mounted){setOffers(Array.isArray(data.offers)?data.offers:[]);setError("");}}
   catch(e){if(mounted)setError(e instanceof Error?e.message:"Offers are temporarily unavailable.");}
   finally{if(mounted)setLoading(false);}
  };
  void load();const timer=window.setInterval(()=>void load(),60000);
  return()=>{mounted=false;window.clearInterval(timer);};
 },[]);
 async function copyCode(code:string){try{await navigator.clipboard.writeText(code);setCopied(code);window.setTimeout(()=>setCopied(""),1800);}catch{setCopied("");}}
 return <main className="retail-container retail-offers-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Offers</span></div>
  <header className="retail-offers-heading"><span className="retail-eyebrow">NEXORA SPECIALS</span><h1>Offers & deals</h1><p>Thoughtful finds, occasional treats. Only currently available offers appear here.</p></header>
  {loading?<div className="retail-offers-state"><Gift size={28}/><h2>Checking current offers…</h2><p>Looking for active Nexora deals.</p></div>
  :error?<div className="retail-offers-state"><Gift size={28}/><h2>Offers are temporarily unavailable</h2><p>{error}</p><button onClick={()=>window.location.reload()}>Try again</button></div>
  :offers.length===0?<div className="retail-offers-state"><span className="retail-offers-empty-icon"><Gift size={30}/></span><h2>No offers now</h2><p>There are no active promotions at the moment. Check back soon for the next Nexora deal.</p><Link href="/shop">Explore all gadgets <ArrowRight size={16}/></Link></div>
  :<div className="retail-offers-grid">{offers.map(offer=><article className="retail-offer-card" key={offer.id}>
   <div className="retail-offer-card-top"><span className="retail-offer-badge"><Gift size={13}/>{offer.badge}</span><span className="retail-offer-live"><i/> LIVE OFFER</span></div>
   <div className="retail-offer-art"><span><Gift size={42}/></span><small>NEXORA / SPECIAL OFFER</small></div>
   <div className="retail-offer-copy"><h2>{offer.title}</h2><p>{offer.description}</p>
    {offer.coupon_code&&<div className="retail-offer-code"><span><small>USE PROMO CODE</small><strong>{offer.coupon_code}</strong></span><button onClick={()=>void copyCode(offer.coupon_code!)} aria-label="Copy promo code">{copied===offer.coupon_code?<CheckCircle2 size={17}/>:<Copy size={17}/>} {copied===offer.coupon_code?"Copied":"Copy"}</button></div>}
    <div className="retail-offer-validity"><CalendarClock size={14}/>{offer.ends_at?"Valid until "+dateLabel(offer.ends_at):offer.starts_at?"Started "+dateLabel(offer.starts_at):"Limited-time promotion"}</div>
    <Link className="retail-offer-cta" href={offer.target_url}>{offer.cta_label}<ArrowRight size={16}/></Link>
   </div>
  </article>)}</div>}
 </main>;
}
