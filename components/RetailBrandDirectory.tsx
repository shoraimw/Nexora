import Link from "next/link";
import {ArrowRight} from "lucide-react";
type Props={brands:string[];preview?:boolean};
export function RetailBrandDirectory({brands,preview=false}:Props){
 const names=Array.from(new Set(brands.map(b=>b.trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b)).slice(0,24);
 if(!names.length)return null;
 return <section className="nexora-brand-directory" aria-label="Shop by brand">
  <div className="retail-section-heading"><div><span className="retail-eyebrow">EXPLORE OUR COLLECTION</span><h2>Brands By Shop</h2><p>{preview?"Illustrative brand labels for the demo catalog.":"Browse products by available brands."}</p></div><Link href="/shop" className="retail-section-link">View all products <ArrowRight size={15}/></Link></div>
  <div className="nexora-brand-grid">{names.map((name,index)=><Link key={name} href={"/shop?brand="+encodeURIComponent(name)} className="nexora-brand-tile"><span className="nexora-brand-monogram" aria-hidden="true">{name.slice(0,1).toUpperCase()}</span><strong>{name}</strong><small>Explore <ArrowRight size={12}/></small></Link>)}</div>
 </section>;
}
