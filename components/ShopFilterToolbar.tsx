"use client";
import {useEffect,useRef,useState} from "react";
import {Search,SlidersHorizontal,RotateCcw,X,Check} from "lucide-react";
import type {ShopFilterState,ConnectionFilter,ProductSort} from "@/lib/shop-filters";
import {initialFilters} from "@/lib/shop-filters";

type Props={
 filters:ShopFilterState;
 onChange:(next:ShopFilterState)=>void;
 brands:string[];
 results:number;
 categories?:string[];
};
function activeFilterCount(f:ShopFilterState){
 return Number(f.category!=="All")+Number(!!f.brand.trim())+Number(f.connection!=="all")+
  Number(f.inStockOnly)+Number(f.onSaleOnly)+Number(!!f.minPriceBdt.trim())+Number(!!f.maxPriceBdt.trim());
}
export function ShopFilterToolbar({filters,onChange,brands,results,categories=["All"]}:Props){
 const [open,setOpen]=useState(false);
 const [draft,setDraft]=useState<ShopFilterState>(filters);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const drawerRef=useRef<HTMLElement>(null);
 const count=activeFilterCount(filters);
 const openDrawer=()=>{setDraft(filters);setOpen(true);};
 useEffect(()=>{
  if(!open)return;
  const drawer=drawerRef.current;
  const closeOnKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){setOpen(false);return;}
   if(event.key!=="Tab"||!drawer)return;
   const focusable=Array.from(drawer.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'));
   if(!focusable.length){event.preventDefault();return;}
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  document.addEventListener("keydown",closeOnKey);
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  drawer?.querySelector<HTMLElement>(".retail-filter-close")?.focus();
  return()=>{document.removeEventListener("keydown",closeOnKey);document.body.style.overflow=previous;triggerRef.current?.focus();};
 },[open]);
 const change=<K extends keyof ShopFilterState>(key:K,value:ShopFilterState[K])=>setDraft(current=>({...current,[key]:value}));
 const apply=()=>{onChange({...draft,query:filters.query,sort:filters.sort});setOpen(false);};
 const clear=()=>{const cleared={...initialFilters,query:filters.query,sort:filters.sort};setDraft(cleared);onChange(cleared);setOpen(false);};
 return <>
  <div className="retail-shop-toolbar">
   <label className="retail-shop-search"><Search size={17}/><input type="search" value={filters.query} onChange={e=>onChange({...filters,query:e.target.value})} placeholder="Search products, brands and categories..." aria-label="Search products"/></label>
   <button ref={triggerRef} type="button" className={"retail-filter-trigger"+(count?" has-filters":"")} onClick={openDrawer} aria-expanded={open} aria-controls="nexora-filter-drawer"><SlidersHorizontal size={16}/> Filters {count>0&&<span>{count}</span>}</button>
   <label className="retail-sort-control"><span>Sort</span><select value={filters.sort} onChange={e=>onChange({...filters,sort:e.target.value as ProductSort})} aria-label="Sort products"><option value="featured">Featured</option><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="discount">Biggest discount</option><option value="name">Name: A to Z</option></select></label>
  </div>
  <div className="retail-shop-result-meta"><span>{results} {results===1?"product":"products"} found</span>{count>0&&<button type="button" onClick={clear}>Clear filters <X size={13}/></button>}</div>
  {open&&<div className="retail-filter-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false);}}>
   <aside ref={drawerRef} tabIndex={-1} id="nexora-filter-drawer" className="retail-filter-drawer" role="dialog" aria-modal="true" aria-labelledby="nexora-filter-title">
    <header><div><span className="retail-eyebrow">REFINE YOUR SEARCH</span><h2 id="nexora-filter-title">Filters</h2><p>Find the right gadget for you.</p></div><button type="button" className="retail-filter-close" onClick={()=>setOpen(false)} aria-label="Close filters"><X size={19}/></button></header>
    <div className="retail-filter-drawer-body">
     <label className="retail-filter-field"><span>Category</span><select value={draft.category} onChange={e=>change("category",e.target.value)}>{Array.from(new Set(["All",...categories])).map(category=><option key={category} value={category}>{category==="All"?"All categories":category}</option>)}</select></label>
     <label className="retail-filter-field"><span>Brand</span><input type="search" list="nexora-filter-brands" value={draft.brand} onChange={e=>change("brand",e.target.value)} placeholder="Search or select a brand" aria-label="Filter by brand"/><datalist id="nexora-filter-brands">{brands.map(brand=><option key={brand} value={brand}/>)}</datalist></label>
     <label className="retail-filter-field"><span>Connection</span><select value={draft.connection} onChange={e=>change("connection",e.target.value as ConnectionFilter)} aria-label="Filter by connection type"><option value="all">All connection types</option><option value="wireless">Wireless</option><option value="wired">Wired</option></select></label>
     <div className="retail-filter-price-block"><span>Price range (৳)</span><div className="retail-filter-price-fields"><label><small>Minimum</small><input type="number" value={draft.minPriceBdt} min="0" max="1000000" step="0.01" placeholder="৳ 0" onChange={e=>change("minPriceBdt",e.target.value)} aria-label="Minimum price in BDT"/></label><label><small>Maximum</small><input type="number" value={draft.maxPriceBdt} min="0" max="1000000" step="0.01" placeholder="Any" onChange={e=>change("maxPriceBdt",e.target.value)} aria-label="Maximum price in BDT"/></label></div></div>
     <div className="retail-filter-options"><label><input type="checkbox" checked={draft.inStockOnly} onChange={e=>change("inStockOnly",e.target.checked)}/> <span><strong>In stock only</strong><small>Hide products that are unavailable</small></span></label><label><input type="checkbox" checked={draft.onSaleOnly} onChange={e=>change("onSaleOnly",e.target.checked)}/> <span><strong>On sale</strong><small>Show discounted products only</small></span></label></div>
    </div>
    <footer><button type="button" className="retail-filter-clear" onClick={clear}><RotateCcw size={15}/> Clear all</button><button type="button" className="retail-filter-apply" onClick={apply}><Check size={16}/> Show results</button></footer>
   </aside>
  </div>}
 </>;
}
