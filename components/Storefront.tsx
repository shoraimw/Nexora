"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,Search,ShoppingBag,SlidersHorizontal} from "lucide-react";
import {categories,currency,products,Product} from "@/lib/catalog";
import {useCart} from "@/components/CartProvider";
import {ChatWidget} from "@/components/ChatWidget";
import {HomeHero,HomeCategoryStrip,HomePerks,HomePromos} from "@/components/HomeChrome";

export function ProductTile({product}:{product:Product}){
 const {add}=useCart();
 return <article className="nexora-product-card">
  <Link href={"/product/"+product.slug} className="nexora-product-art" aria-label={"View "+product.name}>
   {product.image&&<img src={product.image} alt={product.name} loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/>}
   {!product.image&&<span className="nexora-image-fallback">{product.art}</span>}
   {product.tag&&<span className="nexora-product-tag">{product.tag}</span>}
   <span className="nexora-demo-label">DEMO ITEM</span>
  </Link>
  <div className="nexora-product-meta"><span className="nexora-product-category">{product.category}</span>
   <Link href={"/product/"+product.slug} className="nexora-product-title">{product.name}</Link>
   <div className="nexora-product-price">{currency(product.price)}{product.previous&&<s>{currency(product.previous)}</s>}</div>
   <button className="nexora-add-button" onClick={()=>add(product.id)}><ShoppingBag size={15}/> Add to bag</button>
  </div>
 </article>;
}
function visibleProducts(category:string,search:string){
 return products.filter(p=>(category==="All"||(category==="Student Picks"?!!p.student:p.category===category))&&(!search||[p.name,p.description,p.category,...p.features].join(" ").toLowerCase().includes(search.toLowerCase())));
}
export function Storefront(){
 const [category,setCategory]=useState("All"),[search,setSearch]=useState("");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const q=params.get("q");const c=params.get("category");if(q)setSearch(q);if(c)setCategory(c);},[]);
 const visible=useMemo(()=>visibleProducts(category,search),[category,search]);
 return <main className="nexora-home">
  <div className="announcement">A better everyday starts with the little things <span>·</span> Explore the Nexora preview</div>
  <div className="container"><HomeHero/><HomeCategoryStrip/><HomePerks/>
   <section className="nexora-featured" id="featured">
    <div className="nexora-section-heading"><div><p className="section-kicker">A FEW GOOD FINDS</p><h2>Popular right now</h2><p className="nexora-section-subtitle">A sample of the kind of gadgets and everyday finds you will discover at Nexora.</p></div><Link href="/shop" className="nexora-view-all">View all products <ArrowRight size={16}/></Link></div>
    <div className="nexora-product-toolbar"><div className="nexora-filter-row">{categories.map(x=><button key={x} className={category===x?"active":""} onClick={()=>setCategory(x)}>{x}</button>)}</div><label className="nexora-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gadgets..." aria-label="Search demo gadgets"/></label></div>
    <div className="nexora-product-grid">{visible.slice(0,8).map(p=><ProductTile key={p.id} product={p}/>)}</div>
    {!visible.length&&<div className="empty-state"><SlidersHorizontal/><h3>No demo gadgets found</h3><p>Try another keyword or category.</p><button className="outline-btn" onClick={()=>{setCategory("All");setSearch("");}}>Reset filters</button></div>}
   </section>
   <HomePromos/>
  </div>
  <ChatWidget/>
 </main>;
}
export function DemoShop(){
 const [category,setCategory]=useState("All"),[search,setSearch]=useState(""),[sort,setSort]=useState("featured");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const q=params.get("q"),c=params.get("category");if(q)setSearch(q);if(c)setCategory(c);},[]);
 const visible=useMemo(()=>{const list=visibleProducts(category,search);return [...list].sort((a,b)=>sort==="low"?a.price-b.price:sort==="high"?b.price-a.price:0);},[category,search,sort]);
 const filters=["All","Audio","Wearables","Accessories","Desk Setup","Student Picks","Plushies","Mystery Box"];
 return <main className="container nexora-shop-page">
  <div className="nexora-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span></div>
  <div className="nexora-shop-heading"><div><p className="section-kicker">THE NEXORA COLLECTION</p><h1>Shop gadgets</h1><p>Everyday tech, thoughtful accessories and little things worth discovering.</p></div><span>{visible.length} demo products</span></div>
  <div className="nexora-shop-controls"><label className="nexora-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by product or category..." aria-label="Search products"/></label><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
  <div className="nexora-shop-layout"><aside className="nexora-shop-sidebar"><strong>Categories</strong>{filters.map(f=><button key={f} className={category===f?"active":""} onClick={()=>setCategory(f)}>{f}<span>{f==="All"?products.length:visibleProducts(f,"").length}</span></button>)}</aside><section className="nexora-shop-results"><div className="nexora-shop-result-top"><span>{category==="All"?"All products":category}</span><span>Illustrative preview · Not live inventory</span></div>{visible.length?<div className="nexora-product-grid">{visible.map(p=><ProductTile key={p.id} product={p}/>)}</div>:<div className="empty-state"><SlidersHorizontal/><h3>No products found</h3><p>Try a different search or category.</p></div>}</section></div>
  <ChatWidget/>
 </main>;
}
