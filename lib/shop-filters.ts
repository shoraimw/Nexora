/** Shared, pure catalog filters. Values come from explicitly entered product metadata.
 * A USB-C charging port does not imply wired AUDIO connectivity. */
export type ConnectionFilter = "all" | "wireless" | "wired";
export type ProductSort = "featured" | "newest" | "low" | "high" | "name" | "discount";
export type ShopFilterState = {
  category: string; query: string; brand: string; connection: ConnectionFilter;
  inStockOnly: boolean; onSaleOnly: boolean;
  minPriceBdt: string; maxPriceBdt: string; sort: ProductSort;
};
export type ShopFilterProduct = {
  id: string; name: string; category: string; brand?: string | null;
  connectionType?: string | null; pricePaisa: number;
  compareAtPaisa?: number | null; available: boolean;
  featured?: boolean; createdAt?: string | null; collections?: string[];
};
export const initialFilters: ShopFilterState = {
  category:"All",query:"",brand:"",connection:"all",
  inStockOnly:false,onSaleOnly:false,minPriceBdt:"",maxPriceBdt:"",sort:"featured"
};
export function connectionFlags(raw: unknown): {wireless:boolean;wired:boolean} {
 const value=typeof raw==="string"?raw.trim().toLowerCase():"";
 if(!value)return {wireless:false,wired:false};
 return {
  wireless:/(^|[^a-z])(wireless|bluetooth|wi-?fi|2\.4ghz|rf)([^a-z]|$)/.test(value),
  wired:/(^|[^a-z])(wired|usb[- ]?c audio|3\.5mm|aux)([^a-z]|$)/.test(value)
 };
}
export function priceBoundBdt(raw:string): number | null {
 if(!/^\d+(\.\d{1,2})?$/.test(raw.trim()))return null;
 const n=Number(raw);
 return Number.isFinite(n)&&n>=0&&n<=1_000_000 ? Math.round(n*100) : null;
}
export function discountPercent(item:ShopFilterProduct):number {
 const original=item.compareAtPaisa;
 return original!=null&&original>item.pricePaisa&&item.pricePaisa>=0 ? Math.round(100*(original-item.pricePaisa)/original) : 0;
}
export function distinctBrands<T extends ShopFilterProduct>(items:readonly T[]):string[]{
 const names=new Map<string,string>();
 for(const p of items){const brand=p.brand?.trim();if(brand&&!names.has(brand.toLocaleLowerCase("en")))names.set(brand.toLocaleLowerCase("en"),brand);}
 return [...names.values()].sort((a,b)=>a.localeCompare(b));
}
export function selectMatchingProducts<T extends ShopFilterProduct>(products:readonly T[],f:ShopFilterState):T[]{
 const query=f.query.trim().toLocaleLowerCase("en");
 const brand=f.brand.trim().toLocaleLowerCase("en");
 const category=f.category.trim().toLocaleLowerCase("en");
 const min=priceBoundBdt(f.minPriceBdt),max=priceBoundBdt(f.maxPriceBdt);
 const matched=products.filter(p=>{
  if(category&&category!=="all"&&p.category.toLocaleLowerCase("en")!==category&&!(p.collections||[]).some(c=>c.toLocaleLowerCase("en")===category))return false;
  if(query&&![p.name,p.brand||"",p.category].join(" ").toLocaleLowerCase("en").includes(query))return false;
  if(brand&&!(p.brand||"").toLocaleLowerCase("en").includes(brand))return false;
  if(f.connection!=="all"&&!connectionFlags(p.connectionType)[f.connection])return false;
  if(f.inStockOnly&&!p.available)return false;
  if(f.onSaleOnly&&discountPercent(p)===0)return false;
  if(min!==null&&p.pricePaisa<min)return false;
  if(max!==null&&p.pricePaisa>max)return false;
  return true;
 });
 return matched.sort((a,b)=>{
  switch(f.sort){
   case "low":return a.pricePaisa-b.pricePaisa||a.name.localeCompare(b.name);
   case "high":return b.pricePaisa-a.pricePaisa||a.name.localeCompare(b.name);
   case "name":return a.name.localeCompare(b.name);
   case "discount":return discountPercent(b)-discountPercent(a);
   case "newest":return (b.createdAt||"").localeCompare(a.createdAt||"");
   default:return Number(!!b.featured)-Number(!!a.featured);
  }
 });
}
export function countAppliedFilters(f:ShopFilterState):number{
 return Number(f.category!=="All")+Number(!!f.query.trim())+Number(!!f.brand.trim())+
  Number(f.connection!=="all")+Number(f.inStockOnly)+Number(f.onSaleOnly)+
  Number(!!f.minPriceBdt.trim())+Number(!!f.maxPriceBdt.trim());
}
