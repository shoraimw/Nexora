import Link from "next/link";
import {ArrowRight,ChevronDown} from "lucide-react";
import {storeCategories,categoryHref} from "@/lib/store-taxonomy";

export function RetailCategoryNav(){
 return <nav className="retail-nav" aria-label="Shop categories">
  <div className="retail-container retail-nav-inner">
   <Link className="nexora-nav-all" href="/shop">All products</Link>
   {storeCategories.map(category=><details className="nexora-nav-category" key={category.slug}>
    <summary><span>{category.name}</span><ChevronDown size={12}/></summary>
    <div className="nexora-category-mega">
     <div className="nexora-category-mega-intro">
      <span>SHOP CATEGORY</span>
      <strong>{category.name}</strong>
      <p>{category.description}</p>
      <Link href={categoryHref(category)}>View all {category.name}<ArrowRight size={14}/></Link>
     </div>
     <div className="nexora-category-mega-links">
      {category.subcategories.map(subcategory=><Link key={subcategory.slug} href={categoryHref(category,subcategory)}>
       <span>{subcategory.name}</span><small>{subcategory.hint}</small>
      </Link>)}
     </div>
    </div>
   </details>)}
  </div>
 </nav>;
}
