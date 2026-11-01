"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {Search,ShoppingBag,ArrowUpRight,SlidersHorizontal} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import type {LiveProduct} from "@/lib/catalog-live";
const money=(v:number)=>"৳"+(v/100).toLocaleString("en-BD",{maximumFractionDigits:2});
export function CommerceShop({homepage=false}:{homepage?:boolean}){
 const [items,setItems]=useState<LiveProduct[]>([]),[ready,setReady]=useState(false),[query,setQuery]=useState(""),[category,setCategory]=useState("All"),[sort,setSort]=useState("featured");
 const {add}=useCart();
 useEffect(()=>{let alive=true;fetch("/api/catalog",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(alive){setItems(x.products||[]);setReady(true);}}).catch(()=>{if(alive)setReady(true);});return()=>{alive=false;};},[]);
 const categories=useMemo(()=>["All",...Array.from(new Set(items.map(p=>p.category)))],[items]);
 const shown=useMemo(()=>{const filtered=items.filter(p=>(category==="All"||p.category===category)&&[p.title,p.brand,p.description,p.category].join(" ").toLowerCase().includes(query.toLowerCase()));return filtered.sort((a,b)=>sort==="low"?(a.variants[0]?.price_paisa||0)-(b.variants[0]?.price_paisa||0):sort==="high"?(b.variants[0]?.price_paisa||0)-(a.variants[0]?.price_paisa||0):Number(b.featured)-Number(a.featured));},[items,category,query,sort]);
 return <section className={homepage?"section commerce-section":"container section commerce-section"}>
  <div className={homepage?"container":""}>
   <div className="section-title"><div><p className="eyebrow">THE NEXORA EDIT</p><h2>Discover your next favorite.</h2><p className="section-copy">Real products, verified prices and live stock from the Nexora catalog.</p></div><span className="item-count">{shown.length} products</span></div>
   <div className="toolbar commerce-toolbar"><div className="chip-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={"chip "+(category===c?"selected":"")}>{c}</button>)}</div><label className="search-field"><Search size={17}/><input aria-label="Search catalog" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search gadgets..."/></label><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)} className="sort-control"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
   {!ready?<p className="site-message">Loading Nexora products…</p>:shown.length===0?<div className="empty-state"><SlidersHorizontal/><h3>{items.length?"No matching products":"Products are coming soon"}</h3><p>Nexora owners will publish verified products here. We never show invented prices.</p></div>:<div className="products-grid">{shown.map(p=>{const v=p.variants[0];return <article key={p.id} className="product-card">
    <Link className="commerce-image" href={"/product/"+p.slug}>{p.images[0]?.url?<img src={p.images[0].url} alt={p.images[0].alt||p.title}/>:<span className="commerce-placeholder">N.</span>}{p.featured&&<span className="product-tag">Featured</span>}</Link>
    <div className="product-info"><span className="small-uppercase">{p.category}</span><Link className="product-name" href={"/product/"+p.slug}>{p.title}</Link>
     <p className="commerce-brand">{p.brand||"Nexora select"}</p><div className="product-price">{money(v?.price_paisa||0)}</div><p className="stock-label">{p.variants.some(v=>v.available>0)?"In stock":"Out of stock"}</p>
     <div className="commerce-card-actions"><button className="add-button" disabled={!v||v.available<=0} onClick={()=>add(v.id)}><ShoppingBag size={15}/> Add to bag</button><Link href={"/product/"+p.slug} aria-label={"View "+p.title}><ArrowUpRight size={18}/></Link></div>
    </div></article>;})}</div>}
  </div>
 </section>;
}
