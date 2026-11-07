"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ShoppingBag,ArrowUpRight,ArrowRight,ChevronRight,Star} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import {ShopFilterToolbar} from "@/components/ShopFilterToolbar";
import {RetailBrandDirectory} from "@/components/RetailBrandDirectory";
import {initialFilters,selectMatchingProducts,distinctBrands,type ShopFilterState,type ShopFilterProduct} from "@/lib/shop-filters";
import type {LiveProduct,LiveVariant} from "@/lib/catalog-live";
import {categoryHref} from "@/lib/store-taxonomy";
import {useStoreCategories} from "@/components/useStoreCategories";
import {useT} from "@/components/LanguageProvider";
const money=(value:number)=>"BDT "+(value/100).toLocaleString("en-BD",{maximumFractionDigits:2});
function displayVariant(product:LiveProduct):LiveVariant|undefined{
 const variants=[...product.variants].sort((a,b)=>a.price_paisa-b.price_paisa);
 return variants.find(v=>v.available>0)||variants[0];
}
function ProductCard({product}:{product:LiveProduct}){
 const {add}=useCart(),variant=displayVariant(product);const t=useT();
 const inStock=product.variants.some(v=>v.available>0);
 const discount=variant?.compare_at_paisa&&variant.compare_at_paisa>variant.price_paisa?Math.round((1-variant.price_paisa/variant.compare_at_paisa)*100):0;
 return <article className="retail-product-card">
  <Link className="retail-product-image" href={"/product/"+product.slug} aria-label={"View "+product.title}>
   {product.images[0]?.url?<img src={product.images[0].url} alt={product.images[0].alt||product.title} loading="lazy"/>:<span className="retail-image-placeholder">N.</span>}
   {product.featured&&<span className="retail-product-badge">Featured</span>}
   {discount>0&&<span className="retail-discount-badge">{discount}% OFF</span>}
   <span className="retail-quick-view"><ArrowUpRight size={17}/></span>
  </Link>
  <div className="retail-product-info"><span className="retail-product-category">{t(product.category)}{product.subcategory?" · "+t(product.subcategory):""}</span><Link className="retail-product-name" href={"/product/"+product.slug}>{product.title}</Link><span className="retail-product-brand">{product.brand||"Brand not specified"}</span>{product.review_count>0&&<div className="retail-card-rating"><Star size={12} fill="currentColor"/><strong>{product.review_average.toFixed(1)}</strong><span>({product.review_count})</span></div>}
   <div className="retail-price-row"><strong>{variant?money(variant.price_paisa):"Price on request"}</strong>{variant?.compare_at_paisa&&variant.compare_at_paisa>variant.price_paisa&&<s>{money(variant.compare_at_paisa)}</s>}</div>
   <span className={inStock?"retail-stock in-stock":"retail-stock out-stock"}>{t(inStock?"In stock":"Currently unavailable")}</span>
   <div className="nexora-card-actions"><Link className="nexora-card-shop-link" href={"/product/"+product.slug}>{t(inStock?"Shop now":"View details")} <ArrowRight size={14}/></Link><button className="nexora-card-bag" type="button" aria-label={"Add "+product.title+" to bag"} disabled={!variant||!inStock} onClick={()=>variant&&add(variant.id)}><ShoppingBag size={16}/></button></div>
  </div>
 </article>;
}
function ProductSection({title,eyebrow,items,href="/shop"}:{title:string;eyebrow:string;items:LiveProduct[];href?:string}){
 const t=useT();
 if(!items.length)return null;
 return <section className="retail-product-section"><div className="retail-section-heading"><div><span className="retail-eyebrow">{t(eyebrow)}</span><h2>{t(title)}</h2></div><Link href={href} className="retail-section-link">{t("View all")} <ArrowRight size={16}/></Link></div><div className="retail-product-grid">{items.slice(0,5).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>;
}
type IndexedProduct=ShopFilterProduct&{product:LiveProduct};
export function CommerceShop({homepage=false,initialCategory="All",initialSubcategory="",categoryDescription=""}:{homepage?:boolean;initialCategory?:string;initialSubcategory?:string;categoryDescription?:string}){
 const t=useT();
 const categoryTree=useStoreCategories();
 const [items,setItems]=useState<LiveProduct[]>([]),[ready,setReady]=useState(false),[catalogError,setCatalogError]=useState(false),[reloadCount,setReloadCount]=useState(0),[filters,setFilters]=useState<ShopFilterState>({...initialFilters,category:initialCategory,subcategory:initialSubcategory});
 useEffect(()=>{const params=new URLSearchParams(window.location.search);
  setFilters(f=>({...f,query:params.get("q")||"",category:params.get("category")||initialCategory||"All",subcategory:params.get("subcategory")||initialSubcategory||"",brand:params.get("brand")||"",connection:params.get("connection")==="wireless"?"wireless":params.get("connection")==="wired"?"wired":"all"}));
 },[]);
 useEffect(()=>{let active=true;setReady(false);setCatalogError(false);
  fetch("/api/catalog",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Catalog request failed");return r.json();}).then(x=>{if(!active)return;if(x.live!==true||!Array.isArray(x.products))throw Error("Live catalogue is unavailable");setItems(x.products);setCatalogError(false);setReady(true);}).catch(()=>{if(active){setItems([]);setCatalogError(true);setReady(true);}});
  return()=>{active=false;};
 },[reloadCount]);
 const indexed=useMemo<IndexedProduct[]>(()=>items.map(p=>{const v=displayVariant(p);return{
  id:p.id,name:p.title,category:p.category,subcategory:p.subcategory,brand:p.brand,collections:p.collections,searchText:[p.description,p.warranty,...Object.values(p.specs||{}).map(String),...p.variants.flatMap(v=>[v.name,v.color||""])].join(" "),connectionType:String(p.specs?.connection_type||p.specs?.connectivity||""),
  pricePaisa:v?.price_paisa||0,compareAtPaisa:v?.compare_at_paisa,available:p.variants.some(v=>v.available>0),
  featured:p.featured,createdAt:p.created_at,product:p
 };}),[items]);
 const shown=useMemo(()=>selectMatchingProducts(indexed,filters),[indexed,filters]);
 const brands=useMemo(()=>distinctBrands(indexed),[indexed]);
 const categories=useMemo(()=>[...categoryTree.map(category=>category.name),"Student Picks","Mystery Box"],[categoryTree]);
 const subcategories=useMemo(()=>categoryTree.find(category=>category.name===filters.category)?.subcategories.map(subcategory=>subcategory.name)||[],[categoryTree,filters.category]);
 const featured=useMemo(()=>items.filter(p=>p.featured).slice(0,10),[items]);
 const trending=useMemo(()=>items.filter(p=>p.review_count>0).sort((a,b)=>b.review_count-a.review_count||b.review_average-a.review_average).slice(0,10),[items]);
 const newest=useMemo(()=>[...items].sort((a,b)=>(b.created_at||"").localeCompare(a.created_at||"")).slice(0,10),[items]);
 const studentPicks=useMemo(()=>items.filter(p=>p.collections.includes("Student Picks")).slice(0,5),[items]);
 const homeGroups=useMemo(()=>["Phones","Phone Accessories","Headphones & Speakers","Watches","PC Accessories","Networking","Gaming"].map(name=>({name,items:items.filter(p=>p.category.toLowerCase()===name.toLowerCase()).slice(0,5),category:categoryTree.find(c=>c.name===name)})).filter(g=>g.items.length),[items,categoryTree]);
 if(homepage)return <div className="retail-home-catalog"><div className="retail-container">
  <RetailBrandDirectory brands={brands}/>
  {!ready?<div className="retail-loading">{t("Loading the Nexora collection…")}</div>:catalogError?<div className="retail-empty" role="alert"><h3>The catalogue is temporarily unavailable</h3><p>We couldn't verify the live product collection. Please try again in a moment.</p><button type="button" onClick={()=>setReloadCount(value=>value+1)}>{t("Try again")}</button></div>:!items.length?<div className="retail-empty"><h3>New products are on the way</h3><p>{t("Our team is preparing the Nexora collection. Check back soon.")}</p><Link href="/shop">{t("Explore the shop")} <ArrowRight size={15}/></Link></div>:<>
   <ProductSection eyebrow="HANDPICKED BY NEXORA" title="Featured Products" items={featured}/>
   <ProductSection eyebrow="CUSTOMER FAVOURITES" title="Trending Products" items={trending}/>
   <ProductSection eyebrow="LATEST ADDITIONS" title="New Arrival" items={newest}/>
   {studentPicks.length>0&&<ProductSection eyebrow="MADE FOR STUDY DAYS" title="Student Picks" items={studentPicks} href="/shop?category=Student%20Picks"/>}
   {homeGroups.map(g=><ProductSection key={g.name} eyebrow="EXPLORE THE CATEGORY" title={g.name} items={g.items} href={g.category?categoryHref(g.category):"/shop"}/>)}
  </>}
 </div></div>;
 return <main className="retail-container retail-shop-page">
  <div className="retail-breadcrumb"><Link href="/">{t("Home")}</Link><ChevronRight size={13}/>{initialCategory!=="All"?<><Link href="/shop">Shop</Link><ChevronRight size={13}/><span>{t(initialSubcategory||initialCategory)}</span></>:<span>{t("Shop")}</span>}</div>
  <div className="retail-shop-heading"><div><span className="retail-eyebrow">{t(initialCategory==="All"?"THE NEXORA COLLECTION":"BROWSE NEXORA CATEGORIES")}</span><h1>{t(filters.subcategory||filters.category!=="All"?filters.subcategory||filters.category:"Shop all gadgets")}</h1><p>{t(categoryDescription||"Search by brand, connection, availability and price.")}</p></div><span>{shown.length} {t("products")}</span></div>
  {categoryTree.find(category=>category.name===filters.category)?.subcategories.length?<nav className="nexora-subcategory-nav" aria-label={t(filters.category)+" "+t("subcategories")}><Link href={categoryHref(categoryTree.find(category=>category.name===filters.category)!)} className={!filters.subcategory?"is-active":""}>{t("All")+" "+t(filters.category)}</Link>{categoryTree.find(category=>category.name===filters.category)!.subcategories.map(subcategory=><Link key={subcategory.slug} href={categoryHref(categoryTree.find(category=>category.name===filters.category)!,subcategory)} className={filters.subcategory===subcategory.name?"is-active":""}>{t(subcategory.name)}</Link>)}</nav>:null}
  <ShopFilterToolbar filters={filters} onChange={setFilters} brands={brands} results={shown.length} categories={categories} subcategories={subcategories}/>
  <section className="retail-shop-results"><div className="retail-result-label"><strong>{t(filters.subcategory||(filters.category==="All"?"All products":filters.category))}</strong><span>{t(!ready?"Loading catalog":catalogError?"Catalogue unavailable":"Verified catalog listings")}</span></div>
   {!ready?<div className="retail-loading">{t("Loading products…")}</div>:catalogError?<div className="retail-empty" role="alert"><h3>We couldn't load the catalogue</h3><p>Your filters are unchanged. Retry when the connection is available.</p><button type="button" onClick={()=>setReloadCount(value=>value+1)}>Try again</button></div>:shown.length?<div className="retail-product-grid">{shown.map(p=><ProductCard key={p.id} product={p.product}/>)}</div>:<div className="retail-empty"><h3>{t(items.length?"No matching products":"No products published yet")}</h3><p>{t("Adjust your search or open filters to refine the collection.")}</p><button onClick={()=>setFilters({...initialFilters,category:filters.category,query:filters.query})}>{t("Clear filters in this category")}</button></div>}
  </section>
 </main>;
}
