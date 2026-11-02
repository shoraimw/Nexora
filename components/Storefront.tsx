"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,ShoppingBag,SlidersHorizontal,ChevronRight,ArrowUpRight} from "lucide-react";
import {categories,currency,products, type Product} from "@/lib/catalog";
import {useCart} from "@/components/CartProvider";
import {ChatWidget} from "@/components/ChatWidget";
import {ShopFilterToolbar} from "@/components/ShopFilterToolbar";
import {initialFilters,selectMatchingProducts,distinctBrands,type ShopFilterState,type ShopFilterProduct} from "@/lib/shop-filters";
import {RetailHero,RetailTrustBar,RetailCategoryGrid,RetailPromoBanners} from "@/components/RetailChrome";
function DemoProductCard({product}:{product:Product}){
 const {add}=useCart();
 return <article className="retail-product-card">
  <Link href={"/product/"+product.slug} className="retail-product-image" aria-label={"View "+product.name}>
   <span className="retail-image-placeholder">{product.art}</span>{product.image&&<img src={product.image} alt={product.name} loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/>}
   {product.tag&&<span className="retail-product-badge">{product.tag}</span>}
   <span className="retail-preview-badge">Preview</span><span className="retail-quick-view"><ArrowUpRight size={17}/></span>
  </Link>
  <div className="retail-product-info"><span className="retail-product-category">{product.category}</span><Link href={"/product/"+product.slug} className="retail-product-name">{product.name}</Link><span className="retail-product-brand">{product.brand||"Sample product"}</span>
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
export function Storefront(){
 return <main className="retail-home">
  <div className="retail-announcement"><span>Welcome to Nexora</span><b>Thoughtful gadgets for everyday life</b><span>Discover something new <span aria-hidden>→</span></span></div>
  <div className="retail-container"><RetailHero/><RetailTrustBar/><RetailCategoryGrid/>
   <div className="retail-home-catalog"><DemoProductSection eyebrow="JUST LANDED" title="New arrivals" items={products.slice(0,5)}/>
    <DemoProductSection eyebrow="LISTEN YOUR WAY" title="Audio & sound" items={products.filter(p=>p.category==="Audio")} href="/shop?category=Audio"/>
    <DemoProductSection eyebrow="SMARTER EVERYDAY" title="Wearables" items={products.filter(p=>p.category==="Wearables")} href="/shop?category=Wearables"/>
    <DemoProductSection eyebrow="THE LITTLE THINGS" title="Accessories" items={products.filter(p=>p.category==="Accessories")} href="/shop?category=Accessories"/>
    <DemoProductSection eyebrow="MADE FOR STUDY DAYS" title="Student picks" items={products.filter(p=>p.student)} href="/shop?category=Student%20Picks"/>
   </div><RetailPromoBanners/>
  </div><ChatWidget/>
 </main>;
}
type IndexedProduct=ShopFilterProduct & {product:Product};
export function DemoShop(){
 const [filters,setFilters]=useState<ShopFilterState>(initialFilters);
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const cn=p.get("connection");setFilters(f=>({...f,query:p.get("q")||"",category:p.get("category")||"All",brand:p.get("brand")||"",connection:cn==="wireless"?"wireless":cn==="wired"?"wired":"all"}));},[]);
 const indexed=useMemo<IndexedProduct[]>(()=>products.map((p,index)=>({
  id:p.id,name:p.name,category:p.category,brand:p.brand||"",searchText:[p.description,...p.features,...p.variants].join(" "),connectionType:p.connectionType||"",
  pricePaisa:Math.round(p.price*100),compareAtPaisa:p.previous?Math.round(p.previous*100):undefined,
  available:p.id!=="NX-D07"&&p.id!=="NX-D08",featured:index<3,
  createdAt:String(products.length-index).padStart(3,"0"),collections:p.student?["Student Picks"]:[],product:p
 })),[]);
 const visible=useMemo(()=>selectMatchingProducts(indexed,filters),[indexed,filters]);
 const brands=useMemo(()=>distinctBrands(indexed),[indexed]);
 const categoryOptions=["All",...categories.filter(x=>x!=="All")];
 return <main className="retail-container retail-shop-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><span>Shop</span></div>
  <div className="retail-shop-heading"><div><span className="retail-eyebrow">THE NEXORA COLLECTION</span><h1>Shop all gadgets</h1><p>Search by brand, connection, availability and price.</p></div><span>{visible.length} preview products</span></div>
  <ShopFilterToolbar filters={filters} onChange={setFilters} brands={brands} results={visible.length}/>
  <div className="retail-shop-layout"><aside className="retail-shop-sidebar"><strong>Shop by category</strong>{categoryOptions.map(c=><button key={c} className={filters.category===c?"active":""} onClick={()=>setFilters(f=>({...f,category:c}))}>{c}<span>{c==="All"?products.length:indexed.filter(p=>p.category===c||p.collections?.includes(c)).length}</span></button>)}</aside>
   <section className="retail-shop-results"><div className="retail-result-label"><strong>{filters.category==="All"?"All products":filters.category}</strong><span>Preview catalog · brands are examples, not live inventory</span></div>
    {visible.length?<div className="retail-product-grid">{visible.map(p=><DemoProductCard key={p.id} product={p.product}/>)}</div>:<div className="retail-empty"><SlidersHorizontal/><h3>No products found</h3><p>Try another brand, price or connection type.</p><button onClick={()=>setFilters({...initialFilters})}>Clear all filters</button></div>}
   </section>
  </div><ChatWidget/>
 </main>;
}
