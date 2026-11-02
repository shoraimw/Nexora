"use client";
import {Search,SlidersHorizontal,RotateCcw} from "lucide-react";
import type {ShopFilterState,ConnectionFilter,ProductSort} from "@/lib/shop-filters";
import {countAppliedFilters} from "@/lib/shop-filters";

type Props={
 filters:ShopFilterState;
 onChange:(next:ShopFilterState)=>void;
 brands:string[];
 results:number;
};
export function ShopFilterToolbar({filters,onChange,brands,results}:Props){
 const change=<K extends keyof ShopFilterState>(key:K,value:ShopFilterState[K])=>onChange({...filters,[key]:value});
 const count=countAppliedFilters(filters);
 return <div className="retail-shop-toolbar">
  <label className="retail-shop-search"><Search size={17}/><input type="search" value={filters.query} onChange={e=>change("query",e.target.value)} placeholder="Search products, brands and categories..." aria-label="Search products"/></label>
  <div className="retail-filter-controls">
   <label className="retail-filter-field"><span>Brand</span><input type="search" list="nexora-filter-brands" value={filters.brand} onChange={e=>change("brand",e.target.value)} placeholder="Search or select a brand" aria-label="Filter by brand"/><datalist id="nexora-filter-brands">{brands.map(b=><option key={b} value={b}/>)}</datalist></label>
   <label className="retail-filter-field"><span>Connection</span><select value={filters.connection} onChange={e=>change("connection",e.target.value as ConnectionFilter)} aria-label="Filter by connection type"><option value="all">All connection types</option><option value="wireless">Wireless</option><option value="wired">Wired</option></select></label>
   <label className="retail-filter-field retail-sort-field"><span>Sort by</span><select value={filters.sort} onChange={e=>change("sort",e.target.value as ProductSort)} aria-label="Sort products"><option value="featured">Featured</option><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="discount">Biggest discount</option><option value="name">Name: A to Z</option></select></label>
  </div>
  <div className="retail-filter-secondary">
   <div className="retail-price-range"><span>Price range (৳)</span><label><span>Min</span><input type="number" value={filters.minPriceBdt} min="0" max="1000000" step="0.01" placeholder="৳ 0" onChange={e=>change("minPriceBdt",e.target.value)} aria-label="Minimum price in BDT"/></label><span className="retail-price-dash">–</span><label><span>Max</span><input type="number" value={filters.maxPriceBdt} min="0" max="1000000" step="0.01" placeholder="Any" onChange={e=>change("maxPriceBdt",e.target.value)} aria-label="Maximum price in BDT"/></label></div>
   <label className="retail-filter-check"><input type="checkbox" checked={filters.inStockOnly} onChange={e=>change("inStockOnly",e.target.checked)}/> In stock only</label>
   <label className="retail-filter-check"><input type="checkbox" checked={filters.onSaleOnly} onChange={e=>change("onSaleOnly",e.target.checked)}/> On sale</label>
   <span className="retail-filter-results"><SlidersHorizontal size={14}/>{results} results</span>
   {count>0&&<button type="button" className="retail-reset-filters" onClick={()=>onChange({...filters,category:"All",query:"",brand:"",connection:"all",inStockOnly:false,onSaleOnly:false,minPriceBdt:"",maxPriceBdt:"",sort:"featured"})}><RotateCcw size={14}/> Clear filters ({count})</button>}
  </div>
  {brands.length===0&&<small className="retail-filter-footnote">Brands appear when Nexora owners add product brand names to the catalog.</small>}
 </div>;
}
