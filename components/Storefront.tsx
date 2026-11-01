"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {ArrowRight,Search,ShoppingBag,Sparkles,ShieldCheck,Truck,Gift,Headphones,SlidersHorizontal} from "lucide-react";
import {categories,currency,products,Product} from "@/lib/catalog";
import {useCart} from "@/components/CartProvider";
import {ChatWidget} from "@/components/ChatWidget";
export function ProductTile({product}:{product:Product}){
  const {add}=useCart();
  return <article className="product-card">
    <Link href={"/product/"+product.slug} className={"product-art "+product.accent} aria-label={"View "+product.name}>
      {product.tag&&<span className="product-tag">{product.tag}</span>}
      <span className="product-glyph">{product.art}</span><span className="art-caption">NEXORA / CONCEPT</span>
    </Link>
    <div className="product-info"><span className="small-uppercase">{product.category}</span>
      <Link href={"/product/"+product.slug} className="product-name">{product.name}</Link>
      <div className="product-price">{currency(product.price)} {product.previous&&<s>{currency(product.previous)}</s>}</div>
      <button className="add-button" onClick={()=>add(product.id)}><ShoppingBag size={15}/> Add to bag</button>
    </div>
  </article>;
}
export function Storefront(){
  const [category,setCategory]=useState("All");
  const [search,setSearch]=useState("");
  const visible=useMemo(()=>products.filter(p=>(category==="All"||(category==="Student Picks"?p.student:p.category===category))&&(!search||[p.name,p.description,p.category,...p.features].join(" ").toLowerCase().includes(search.toLowerCase()))),[category,search]);
  return <><div className="announcement">A fresh take on everyday tech <span>·</span> Development preview only — no real sales</div>
    <div className="container">
      <section className="hero">
        <div className="hero-text"><p className="eyebrow"><Sparkles size={14}/> MEET THE NEXT EVERYDAY</p><h1>Small gadgets.<br/><em>Big joy.</em></h1><p>Discover thoughtfully curated tech, desk essentials and playful finds. Designed around your everyday moments.</p>
          <a className="hero-cta" href="#shop">Explore the collection <ArrowRight size={18}/></a>
          <div className="hero-foot"><span><ShieldCheck size={16}/> Secure shopping, planned</span><span><Truck size={16}/> Bangladesh delivery, planned</span></div>
        </div>
        <div className="hero-scene" aria-label="Abstract gadget showcase"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="floating-device device-top"><span>♫</span></div><div className="floating-device device-bottom"><span>◉</span></div><span className="hero-sticker">N<span>+</span></span><span className="hero-side-caption">CONNECTED TO WHAT'S NEXT.</span></div>
      </section>
      <div className="trust-strip"><span><Gift size={20}/> Curated gifts</span><span><Headphones size={20}/> Everyday audio</span><span><Sparkles size={20}/> Student-friendly picks</span></div>
      <section className="section" id="shop"><div className="section-title"><div><p className="eyebrow">EXPLORE NEXORA</p><h2>Find your next favorite.</h2><p className="section-copy">A sample collection showing the shopping experience. Product data is illustrative.</p></div><span className="item-count">{visible.length} items</span></div>
        <div className="toolbar"><div className="chip-row">{categories.map(x=><button key={x} className={"chip "+(category===x?"selected":"")} onClick={()=>setCategory(x)}>{x}</button>)}</div><label className="search-field"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search demo gadgets" aria-label="Search products"/></label></div>
        <div className="products-grid">{visible.map(p=><ProductTile key={p.id} product={p}/>)}</div>
        {visible.length===0&&<div className="empty-state"><SlidersHorizontal/><h3>No demo gadgets found</h3><p>Try another keyword or category.</p><button className="outline-btn" onClick={()=>{setCategory("All");setSearch("");}}>Reset filters</button></div>}
      </section>
      <section className="promo"><div><p className="eyebrow">DESIGNED FOR CURIOUS MINDS</p><h2>Your setup, your story.</h2><p>Budget-friendly finds, giftable moments and a fresh way to browse. More Nexora collections are coming.</p><a href="#shop">Browse the preview <ArrowRight size={17}/></a></div><div className="promo-icon">✳</div></section>
    </div><ChatWidget/></>;
}
