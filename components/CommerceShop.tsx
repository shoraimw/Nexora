"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {Search,ShoppingBag,ArrowUpRight,SlidersHorizontal,ArrowRight,ChevronRight} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import type {LiveProduct} from "@/lib/catalog-live";
const money=(v:number)=>"৳"+(v/100).toLocaleString("en-BD",{maximumFractionDigits:2});
function ProductCard({product}:{product:LiveProduct}){
 const {add}=useCart();
 const variant=product.variants.find(v=>v.available>0)||product.variants[0];
 const inStock=product.variants.some(v=>v.available>0);
 const discount=variant?.compare_at_paisa&&variant.compare_at_paisa>variant.price_paisa?Math.round((1-variant.price_paisa/variant.compare_at_paisa)*100):0;
 return <article className="retail-product-card">
  <Link className="retail-product-image" href={"/product/"+product.slug} aria-label={"View "+product.title}>
   {product.images[0]?.url?<img src={product.images[0].url} alt={product.images[0].alt||product.title} loading="lazy"/>:<span className="retail-image-placeholder">N.</span>}
   {product.featured&&<span className="retail-product-badge">Featured</span>}
   {discount>0&&<span className="retail-discount-badge">{discount}% OFF</span>}
   <span className="retail-quick-view"><ArrowUpRight size={17}/></span>
  </Link>
  <div className="retail-product-info"><span className="retail-product-category">{product.category}</span><Link className="retail-product-name" href={"/product/"+product.slug}>{product.title}</Link><span className="retail-product-brand">{product.brand||"Nexora"}</span>
   <div className="retail-price-row"><strong>{variant?money(variant.price_paisa):"Price on request"}</strong>{variant?.compare_at_paisa&&variant.compare_at_paisa>variant.price_paisa&&<s>{money(variant.compare_at_paisa)}</s>}</div>
   <span className={inStock?"retail-stock in-stock":"retail-stock out-stock"}>{inStock?"In stock":"Currently unavailable"}</span>
   <button className="retail-add-button" disabled={!variant||!inStock} onClick={()=>variant&&add(variant.id)}><ShoppingBag size={15}/> Add to cart</button>
  </div>
 </article>;
}
function ProductSection({title,eyebrow,items,href="/shop"}:{title:string;eyebrow:string;items:LiveProduct[];href?:string}){
 if(!items.length)return null;
 return <section className="retail-product-section"><div className="retail-section-heading"><div><span className="retail-eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link href={href} className="retail-section-link">View all <ArrowRight size={16}/></Link></div><div className="retail-product-grid">{items.slice(0,5).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>;
}
export function CommerceShop({homepage=false}:{homepage?:boolean}){
 const [items,setItems]=useState<LiveProduct[]>([]),[ready,setReady]=useState(false),[query,setQuery]=useState(""),[category,setCategory]=useState("All"),[sort,setSort]=useState("featured");
 const {add}=useCart();
 useEffect(()=>{let alive=true;const params=new URLSearchParams(window.location.search);const q=params.get("q"),c=params.get("category");if(q)setQuery(q);if(c)setCategory(c);
  fetch("/api/catalog",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(alive){setItems(x.products||[]);setReady(true);}}).catch(()=>{if(alive)setReady(true);});return()=>{alive=false;};
 },[]);
 const categories=useMemo(()=>["All",...Array.from(new Set(items.map(p=>p.category)))],[items]);
 const shown=useMemo(()=>{const filtered=items.filter(p=>(category==="All"||p.category.toLowerCase()===category.toLowerCase())&&[p.title,p.brand,p.description,p.category].join(" ").toLowerCase().includes(query.toLowerCase()));return filtered.sort((a,b)=>sort==="low"?(a.variants[0]?.price_paisa||0)-(b.variants[0]?.price_paisa||0):sort==="high"?(b.variants[0]?.price_paisa||0)-(a.variants[0]?.price_paisa||0):Number(b.featured)-Number(a.featured));},[items,category,query,sort]);
 const newest=useMemo(()=>[...items].sort((a,b)=>Number(b.featured)-Number(a.featured)).slice(0,8),[items]);
 const homeGroups=useMemo(()=>["Audio","Wearables","Accessories","Desk Setup","Student Picks"].map(name=>({name,items:items.filter(p=>p.category.toLowerCase()===name.toLowerCase()).slice(0,5)})).filter(g=>g.items.length),[items]);
 if(homepage)return <div className="retail-home-catalog"><div className="retail-container">
  {!ready?<div className="retail-loading">Loading the Nexora collection…</div>:!items.length?<div className="retail-empty"><h3>New products are on the way</h3><p>Our team is preparing the Nexora collection. Check back soon.</p><Link href="/shop">Explore the shop <ArrowRight size={15}/></Link></div>:<>
   <ProductSection eyebrow="JUST LANDED" title="New arrivals" items={newest}/>
   {homeGroups.map(g=><ProductSection key={g.name} eyebrow="EXPLORE THE COLLECTION" title={g.name} items={g.items} href={"/shop?category="+encodeURIComponent(g.name)}/>)}
  </>}
 </div></div>;
 return <main className="retail-container retail-shop-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><span>Shop</span></div>
  <div className="retail-shop-heading"><div><span className="retail-eyebrow">THE NEXORA COLLECTION</span><h1>Shop all gadgets</h1><p>Browse the collection and find your next everyday essential.</p></div><span>{shown.length} products</span></div>
  <div className="retail-shop-toolbar"><label className="retail-shop-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands and categories..." aria-label="Search catalog"/></label><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
  <div className="retail-shop-layout"><aside className="retail-shop-sidebar"><strong>Shop by category</strong>{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}<span>{c==="All"?items.length:items.filter(p=>p.category===c).length}</span></button>)}</aside><section className="retail-shop-results"><div className="retail-result-label"><strong>{category==="All"?"All products":category}</strong><span>{ready?"Live catalog":"Loading catalog"}</span></div>{!ready?<div className="retail-loading">Loading products…</div>:shown.length?<div className="retail-product-grid">{shown.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="retail-empty"><SlidersHorizontal/><h3>{items.length?"No matching products":"No products published yet"}</h3><p>Try another category or search term.</p><button onClick={()=>{setCategory("All");setQuery("");}}>Clear filters</button></div>}</section></div>
 </main>;
}
