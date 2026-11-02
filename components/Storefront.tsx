"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,Search,ShoppingBag,SlidersHorizontal,ChevronRight,ArrowUpRight} from "lucide-react";
import {categories,currency,products,Product} from "@/lib/catalog";
import {useCart} from "@/components/CartProvider";
import {ChatWidget} from "@/components/ChatWidget";
import {RetailHero,RetailTrustBar,RetailCategoryGrid,RetailPromoBanners} from "@/components/RetailChrome";

function DemoProductCard({product}:{product:Product}){
 const {add}=useCart();
 return <article className="retail-product-card">
  <Link href={"/product/"+product.slug} className="retail-product-image" aria-label={"View "+product.name}>
   <span className="retail-image-placeholder">{product.art}</span>{product.image&&<img src={product.image} alt={product.name} loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/>}
   {product.tag&&<span className="retail-product-badge">{product.tag}</span>}
   <span className="retail-preview-badge">Preview</span>
   <span className="retail-quick-view"><ArrowUpRight size={17}/></span>
  </Link>
  <div className="retail-product-info"><span className="retail-product-category">{product.category}</span><Link href={"/product/"+product.slug} className="retail-product-name">{product.name}</Link><span className="retail-product-brand">Nexora preview</span>
   <div className="retail-price-row"><strong>{currency(product.price)}</strong>{product.previous&&<s>{currency(product.previous)}</s>}</div>
   <span className="retail-stock preview-stock">Illustrative listing</span>
   <button className="retail-add-button" disabled={product.id==="NX-D07"||product.id==="NX-D08"} onClick={()=>add(product.id)}><ShoppingBag size={15}/>{product.id==="NX-D07"||product.id==="NX-D08"?"Coming soon":"Add to bag"}</button>
  </div>
 </article>;
}
function DemoProductSection({title,eyebrow,items,href="/shop"}:{title:string;eyebrow:string;items:Product[];href?:string}){
 if(!items.length)return null;
 return <section className="retail-product-section"><div className="retail-section-heading"><div><span className="retail-eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link href={href} className="retail-section-link">View all <ArrowRight size={16}/></Link></div><div className="retail-product-grid">{items.slice(0,5).map(p=><DemoProductCard key={p.id} product={p}/>)}</div></section>;
}
function visibleProducts(category:string,search:string){
 return products.filter(p=>(category==="All"||(category==="Student Picks"?!!p.student:p.category===category))&&(!search||[p.name,p.description,p.category,...p.features].join(" ").toLowerCase().includes(search.toLowerCase())));
}
export function Storefront(){
 return <main className="retail-home">
  <div className="retail-announcement"><span>Welcome to Nexora</span><b>Thoughtful gadgets for everyday life</b><span>Discover something new <span aria-hidden>→</span></span></div>
  <div className="retail-container"><RetailHero/><RetailTrustBar/><RetailCategoryGrid/>
   <div className="retail-home-catalog"><DemoProductSection eyebrow="JUST LANDED" title="New arrivals" items={products.slice(0,5)}/>
    <DemoProductSection eyebrow="LISTEN YOUR WAY" title="Audio & sound" items={products.filter(p=>p.category==="Audio")} href="/shop?category=Audio"/>
    <DemoProductSection eyebrow="SMARTER EVERYDAY" title="Wearables" items={products.filter(p=>p.category==="Wearables")} href="/shop?category=Wearables"/>
    <DemoProductSection eyebrow="THE LITTLE THINGS" title="Accessories" items={products.filter(p=>p.category==="Accessories")} href="/shop?category=Accessories"/>
    <DemoProductSection eyebrow="MADE FOR STUDY DAYS" title="Student picks" items={products.filter(p=>p.student)} href="/shop?category=Student%20Picks"/>
   </div>
   <RetailPromoBanners/>
  </div>
  <ChatWidget/>
 </main>;
}
export function DemoShop(){
 const [category,setCategory]=useState("All"),[search,setSearch]=useState(""),[sort,setSort]=useState("featured");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const q=params.get("q"),c=params.get("category");if(q)setSearch(q);if(c)setCategory(c);},[]);
 const visible=useMemo(()=>{const list=visibleProducts(category,search);return [...list].sort((a,b)=>sort==="low"?a.price-b.price:sort==="high"?b.price-a.price:0);},[category,search,sort]);
 const filters=["All",...categories.filter(x=>x!=="All")];
 return <main className="retail-container retail-shop-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><span>Shop</span></div>
  <div className="retail-shop-heading"><div><span className="retail-eyebrow">THE NEXORA COLLECTION</span><h1>Shop all gadgets</h1><p>Browse the collection and find your next everyday essential.</p></div><span>{visible.length} preview products</span></div>
  <div className="retail-shop-toolbar"><label className="retail-shop-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products and categories..." aria-label="Search products"/></label><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
  <div className="retail-shop-layout"><aside className="retail-shop-sidebar"><strong>Shop by category</strong>{filters.map(f=><button key={f} className={category===f?"active":""} onClick={()=>setCategory(f)}>{f}<span>{f==="All"?products.length:visibleProducts(f,"").length}</span></button>)}</aside><section className="retail-shop-results"><div className="retail-result-label"><strong>{category==="All"?"All products":category}</strong><span>Preview catalogue · sample items</span></div>{visible.length?<div className="retail-product-grid">{visible.map(p=><DemoProductCard key={p.id} product={p}/>)}</div>:<div className="retail-empty"><SlidersHorizontal/><h3>No products found</h3><p>Try a different search or category.</p></div>}</section></div>
  <ChatWidget/>
 </main>;
}
