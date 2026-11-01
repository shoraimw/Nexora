"use client";
import {useState} from "react";
import Link from "next/link";
import {ShoppingBag,ArrowLeft,Truck,ShieldCheck} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import type {LiveProduct} from "@/lib/catalog-live";
const money=(v:number)=>"৳"+(v/100).toLocaleString("en-BD",{maximumFractionDigits:2});
export function CommerceDetail({product:p}:{product:LiveProduct}){
 const [index,setIndex]=useState(0),[selected,setSelected]=useState(p.variants[0]?.id||"");
 const v=p.variants.find(x=>x.id===selected),{add}=useCart();
 return <main className="container detail-page"><Link className="back-link" href="/shop"><ArrowLeft size={17}/> Back to all gadgets</Link><div className="detail-grid">
  <div className="detail-gallery"><div className="detail-product-image">{p.images[index]?.url?<img src={p.images[index].url} alt={p.images[index].alt||p.title}/>:<span className="commerce-placeholder">N.</span>}</div><div className="detail-thumbs">{p.images.map((image,i)=><button className={index===i?"active":""} onClick={()=>setIndex(i)} key={i}><img src={image.url} alt={image.alt||p.title}/></button>)}</div></div>
  <div className="detail-copy"><p className="eyebrow">{p.category} / {p.brand||"Nexora"}</p><h1>{p.title}</h1><p className="detail-description">{p.description}</p><div className="detail-price">{money(v?.price_paisa||0)}{v?.compare_at_paisa?<s className="old-price">{money(v.compare_at_paisa)}</s>:null}<span>{v?.available? v.available+" available":"Out of stock"}</span></div><p className="detail-label">Select color / variation</p><div className="variant-row">{p.variants.map(x=><button key={x.id} className={"variant-button "+(x.id===selected?"active":"")} onClick={()=>setSelected(x.id)}>{x.color||x.name} · {money(x.price_paisa)}</button>)}</div>
   <button className="primary-button" disabled={!v||v.available<=0} onClick={()=>v&&add(v.id)}><ShoppingBag size={18}/>{v?.available?"Add to shopping bag":"Currently out of stock"}</button>
   <div className="detail-notice"><ShieldCheck size={20}/><p><strong>Warranty:</strong> {p.warranty||"Contact Nexora for warranty terms"}</p></div><div className="detail-notice"><Truck size={20}/><p>Delivery charge and ETA are confirmed at checkout/support. Steadfast courier dispatch is planned.</p></div>
   {Object.keys(p.specs||{}).length>0&&<><h3>Specifications</h3><table className="spec-table"><tbody>{Object.entries(p.specs).map(([key,value])=><tr key={key}><th>{key}</th><td>{String(value)}</td></tr>)}</tbody></table></>}
  </div>
 </div></main>;
}
