"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,ShoppingBag,ChevronRight,ArrowUpRight} from "lucide-react";
import {currency,products, type Product} from "@/lib/catalog";
import {storeCategories,categoryHref} from "@/lib/store-taxonomy";
import {useCart} from "@/components/CartProvider";
import {ChatWidget} from "@/components/ChatWidget";
import {ShopFilterToolbar} from "@/components/ShopFilterToolbar";
import {initialFilters,selectMatchingProducts,distinctBrands,type ShopFilterState,type ShopFilterProduct} from "@/lib/shop-filters";
import {RetailHero,RetailTrustBar,RetailCategoryGrid,RetailPromoBanners} from "@/components/RetailChrome";
import {RetailBrandDirectory} from "@/components/RetailBrandDirectory";
function DemoProductCard({product}:{product:Product}){
 const {add}=useCart();
 return <article className="retail-product-card">
  <Link href={"/product/"+product.slug} className="retail-product-image" aria-label={"View "+product.name}>
   <span className="retail-image-placeholder">{product.art}</span>{product.image&&<img src={product.image} alt={product.name} loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/>}
   {product.tag&&<span className="retail-product-badge">{product.tag}</span>}
   <span className="retail-preview-badge">Preview</span><span className="retail-quick-view"><ArrowUpRight size={17}/></span>
  </Link>
  <div className="retail-product-info"><span className="retail-product-category">{product.category}{product.subcategory?" · "+product.subcategory:""}</span><Link href={"/product/"+product.slug} className="retail-product-name">{product.name}</Link><span className="retail-product-brand">{product.brand||"Sample product"}</span>
   <div className="retail-price-row"><strong>{currency(product.price)}</strong>{product.previous&&<s>{currency(product.previous)}</s>}</div>
   <span className="retail-stock preview-stock">Illustrative listing</span>
   <div className="nexora-card-actions"><Link className="nexora-card-shop-link" href={"/product/"+product.slug}>View details <ArrowRight size={14}/></Link><button type="button" className="nexora-card-bag" aria-label={"Add "+product.name+" to preview bag"} disabled={true} onClick={()=>add(product.id)}><ShoppingBag size={16}/></button></div>
  </div>
 </article>;
}
function DemoProductSection({title,eyebrow,items,href="/shop"}:{title:string;eyebrow:string;items:Product[];href?:string}){
 if(!items.length)return null;
 return <section className="retail-product-section"><div className="retail-section-heading"><div><span className="retail-eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link href={href} className="retail-section-link">View all <ArrowRight size={16}/></Link></div><div className="retail-product-grid">{items.slice(0,5).map(p=><DemoProductCard key={p.id} product={p}/>)}</div></section>;
}
export function Storefront(){
 const demoBrands=Array.from(new Set(products.map(p=>p.brand).filter((b):b is string=>!!b)));
 return <main className="retail-home">
  <div className="retail-container"><RetailHero/><RetailTrustBar/><RetailCategoryGrid/><RetailPromoBanners/>
   <div className="retail-home-catalog">
    <RetailBrandDirectory brands={demoBrands} preview/>
    <DemoProductSection eyebrow="CURATED DEMO PREVIEW" title="Featured Products" items={products.slice(0,5)}/>
    <DemoProductSection eyebrow="DISCOVER THE COLLECTION" title="Trending Products" items={products.filter(p=>p.tag==="Trending"||p.student).slice(0,5)}/>
    <DemoProductSection eyebrow="LATEST CONCEPTS" title="New Arrivals" items={products.slice(-5).reverse()}/>
    <DemoProductSection eyebrow="MADE FOR STUDY DAYS" title="Student Picks" items={products.filter(p=>p.collections?.includes("Student Picks"))} href="/shop?category=Student%20Picks"/>
    {["Phones","Phone Accessories","Headphones & Speakers","Watches","PC Accessories","Gaming"].map(name=>{const category=storeCategories.find(c=>c.name===name);const items=products.filter(p=>p.category===name);return category&&items.length?<DemoProductSection key={name} eyebrow="EXPLORE THE CATEGORY" title={name} items={items} href={categoryHref(category)}/>:null;})}
   </div>
  </div><ChatWidget/>
 </main>;
}
type IndexedProduct=ShopFilterProduct & {product:Product};
export function DemoShop({initialCategory="All",initialSubcategory="",categoryDescription=""}:{initialCategory?:string;initialSubcategory?:string;categoryDescription?:string}){
 const [filters,setFilters]=useState<ShopFilterState>({...initialFilters,category:initialCategory,subcategory:initialSubcategory});
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const cn=p.get("connection");setFilters(f=>({...f,query:p.get("q")||"",category:p.get("category")||initialCategory||"All",subcategory:p.get("subcategory")||initialSubcategory||"",brand:p.get("brand")||"",connection:cn==="wireless"?"wireless":cn==="wired"?"wired":"all"}));},[]);
 const indexed=useMemo<IndexedProduct[]>(()=>products.map((p,index)=>({
  id:p.id,name:p.name,category:p.category,subcategory:p.subcategory||"",brand:p.brand||"",collections:p.collections||(p.student?["Student Picks"]:[]),searchText:[p.description,...p.features,...p.variants].join(" "),connectionType:p.connectionType||"",
  pricePaisa:Math.round(p.price*100),compareAtPaisa:p.previous?Math.round(p.previous*100):undefined,
  available:false,featured:index<3,
  createdAt:String(products.length-index).padStart(3,"0"),product:p
 })),[]);
 const visible=useMemo(()=>selectMatchingProducts(indexed,filters),[indexed,filters]);
 const brands=useMemo(()=>distinctBrands(indexed),[indexed]);
 const categoryOptions=[...storeCategories.map(category=>category.name),"Student Picks","Mystery Box"];
 const subcategories=storeCategories.find(category=>category.name===filters.category)?.subcategories.map(subcategory=>subcategory.name)||[];
 return <main className="retail-container retail-shop-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/>{initialCategory!=="All"?<><Link href="/shop">Shop</Link><ChevronRight size={13}/><span>{initialSubcategory||initialCategory}</span></>:<span>Shop</span>}</div>
  <div className="retail-shop-heading"><div><span className="retail-eyebrow">{initialCategory==="All"?"THE NEXORA COLLECTION":"BROWSE NEXORA CATEGORIES"}</span><h1>{filters.subcategory||filters.category!=="All"?filters.subcategory||filters.category:"Shop all gadgets"}</h1><p>{categoryDescription||"Search by brand, connection, availability and price."}</p></div><span>{visible.length} preview products</span></div>
  {storeCategories.find(category=>category.name===filters.category)?.subcategories.length?<nav className="nexora-subcategory-nav" aria-label={filters.category+" subcategories"}><Link href={categoryHref(storeCategories.find(category=>category.name===filters.category)!)} className={!filters.subcategory?"is-active":""}>All {filters.category}</Link>{storeCategories.find(category=>category.name===filters.category)!.subcategories.map(subcategory=><Link key={subcategory.slug} href={categoryHref(storeCategories.find(category=>category.name===filters.category)!,subcategory)} className={filters.subcategory===subcategory.name?"is-active":""}>{subcategory.name}</Link>)}</nav>:null}
  <ShopFilterToolbar filters={filters} onChange={setFilters} brands={brands} results={visible.length} categories={categoryOptions} subcategories={subcategories}/>
  <section className="retail-shop-results"><div className="retail-result-label"><strong>{filters.subcategory||(filters.category==="All"?"All products":filters.category)}</strong><span>Preview catalog · brands are examples, not live inventory</span></div>
   {visible.length?<div className="retail-product-grid">{visible.map(p=><DemoProductCard key={p.id} product={p.product}/>)}</div>:<div className="retail-empty"><h3>No products found</h3><p>Try another search or open filters to refine the collection.</p><button onClick={()=>setFilters({...initialFilters,category:filters.category,query:filters.query})}>Clear filters in this category</button></div>}
  </section><ChatWidget/>
 </main>;
}
