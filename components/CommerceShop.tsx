"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ShoppingBag,ArrowUpRight,ArrowRight,ChevronRight,Star} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import {ShopFilterToolbar} from "@/components/ShopFilterToolbar";
import {initialFilters,selectMatchingProducts,distinctBrands,type ShopFilterState,type ShopFilterProduct} from "@/lib/shop-filters";
import type {LiveProduct,LiveVariant} from "@/lib/catalog-live";
const money=(value:number)=>"৳"+(value/100).toLocaleString("en-BD",{maximumFractionDigits:2});
function displayVariant(product:LiveProduct):LiveVariant|undefined{
 const variants=[...product.variants].sort((a,b)=>a.price_paisa-b.price_paisa);
 return variants.find(v=>v.available>0)||variants[0];
}
function ProductCard({product}:{product:LiveProduct}){
 const {add}=useCart(),variant=displayVariant(product);
 const inStock=product.variants.some(v=>v.available>0);
 const discount=variant?.compare_at_paisa&&variant.compare_at_paisa>variant.price_paisa?Math.round((1-variant.price_paisa/variant.compare_at_paisa)*100):0;
 return <article className="retail-product-card">
  <Link className="retail-product-image" href={"/product/"+product.slug} aria-label={"View "+product.title}>
   {product.images[0]?.url?<img src={product.images[0].url} alt={product.images[0].alt||product.title} loading="lazy"/>:<span className="retail-image-placeholder">N.</span>}
   {product.featured&&<span className="retail-product-badge">Featured</span>}
   {discount>0&&<span className="retail-discount-badge">{discount}% OFF</span>}
   <span className="retail-quick-view"><ArrowUpRight size={17}/></span>
  </Link>
  <div className="retail-product-info"><span className="retail-product-category">{product.category}</span><Link className="retail-product-name" href={"/product/"+product.slug}>{product.title}</Link><span className="retail-product-brand">{product.brand||"Brand not specified"}</span>{product.review_count>0&&<div className="retail-card-rating"><Star size={12} fill="currentColor"/><strong>{product.review_average.toFixed(1)}</strong><span>({product.review_count})</span></div>}
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
type IndexedProduct=ShopFilterProduct&{product:LiveProduct};
export function CommerceShop({homepage=false}:{homepage?:boolean}){
 const [items,setItems]=useState<LiveProduct[]>([]),[ready,setReady]=useState(false),[filters,setFilters]=useState<ShopFilterState>(initialFilters);
 useEffect(()=>{let active=true;const params=new URLSearchParams(window.location.search);
  setFilters(f=>({...f,query:params.get("q")||"",category:params.get("category")||"All",brand:params.get("brand")||"",connection:params.get("connection")==="wireless"?"wireless":params.get("connection")==="wired"?"wired":"all"}));
  fetch("/api/catalog",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Catalog request failed");return r.json();}).then(x=>{if(active){setItems(x.products||[]);setReady(true);}}).catch(()=>{if(active)setReady(true);});
  return()=>{active=false;};
 },[]);
 const indexed=useMemo<IndexedProduct[]>(()=>items.map(p=>{const v=displayVariant(p);return{
  id:p.id,name:p.title,category:p.category,brand:p.brand,searchText:[p.description,p.warranty,...Object.values(p.specs||{}).map(String),...p.variants.flatMap(v=>[v.name,v.color||""])].join(" "),connectionType:String(p.specs?.connection_type||p.specs?.connectivity||""),
  pricePaisa:v?.price_paisa||0,compareAtPaisa:v?.compare_at_paisa,available:p.variants.some(v=>v.available>0),
  featured:p.featured,createdAt:p.created_at,product:p
 };}),[items]);
 const shown=useMemo(()=>selectMatchingProducts(indexed,filters),[indexed,filters]);
 const brands=useMemo(()=>distinctBrands(indexed),[indexed]);
 const categories=useMemo(()=>["All",...Array.from(new Set(items.map(p=>p.category))).sort()],[items]);
 const featured=useMemo(()=>items.filter(p=>p.featured).slice(0,8),[items]);
 const newest=useMemo(()=>[...items].sort((a,b)=>(b.created_at||"").localeCompare(a.created_at||"")).slice(0,8),[items]);
 const homeGroups=useMemo(()=>["Audio","Wearables","Accessories","Desk Setup","Student Picks"].map(name=>({name,items:items.filter(p=>p.category.toLowerCase()===name.toLowerCase()).slice(0,5)})).filter(g=>g.items.length),[items]);
 if(homepage)return <div className="retail-home-catalog"><div className="retail-container">
  {!ready?<div className="retail-loading">Loading the Nexora collection…</div>:!items.length?<div className="retail-empty"><h3>New products are on the way</h3><p>Our team is preparing the Nexora collection. Check back soon.</p><Link href="/shop">Explore the shop <ArrowRight size={15}/></Link></div>:<>
   <ProductSection eyebrow="JUST LANDED" title="New arrivals" items={newest}/>
   {homeGroups.map(g=><ProductSection key={g.name} eyebrow="EXPLORE THE COLLECTION" title={g.name} items={g.items} href={"/shop?category="+encodeURIComponent(g.name)}/>)}
  </>}
 </div></div>;
 return <main className="retail-container retail-shop-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><span>Shop</span></div>
  <div className="retail-shop-heading"><div><span className="retail-eyebrow">THE NEXORA COLLECTION</span><h1>Shop all gadgets</h1><p>Search by brand, connection, availability and price.</p></div><span>{shown.length} products</span></div>
  <ShopFilterToolbar filters={filters} onChange={setFilters} brands={brands} results={shown.length} categories={categories}/>
  <section className="retail-shop-results"><div className="retail-result-label"><strong>{filters.category==="All"?"All products":filters.category}</strong><span>{ready?"Verified catalog listings":"Loading catalog"}</span></div>
   {!ready?<div className="retail-loading">Loading products…</div>:shown.length?<div className="retail-product-grid">{shown.map(p=><ProductCard key={p.id} product={p.product}/>)}</div>:<div className="retail-empty"><h3>{items.length?"No matching products":"No products published yet"}</h3><p>Adjust your search or open filters to refine the collection.</p><button onClick={()=>setFilters({...initialFilters,query:filters.query})}>Clear all filters</button></div>}
  </section>
 </main>;
}
