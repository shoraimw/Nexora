import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {configured} from "@/lib/server";
import {categoryBySlug,subcategoryBySlug} from "@/lib/store-taxonomy";
import {CommerceShop} from "@/components/CommerceShop";
import {DemoShop} from "@/components/Storefront";

type Params={slug:string;subcategory?:string[]};
export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
 const {slug,subcategory=[]}=await params;
 if(configured){const {data:activeCategories,error}=await db().from("categories").select("id,slug,parent_id").eq("active",true);if(error)notFound();const root=activeCategories?.find(item=>item.slug===slug&&!item.parent_id);if(!root)notFound();if(subcategory.length&&!activeCategories?.some(item=>item.slug===subcategory[0]&&item.parent_id===root.id))notFound();}
 const category=categoryBySlug(slug);
 if(!category)return {title:"Category not found",robots:{index:false,follow:false}};
 const sub= subcategory.length===1?subcategoryBySlug(category,subcategory[0]):undefined;
 if(subcategory.length&&!sub)return {title:"Category not found",robots:{index:false,follow:false}};
 const title=sub?.name||category.name;
 return {title:title+" | Nexora",description:sub?.hint||category.description,openGraph:{title:title+" | Nexora",description:sub?.hint||category.description,type:"website"}};
}
export default async function CategoryPage({params}:{params:Promise<Params>}){
 const {slug,subcategory=[]}=await params;
 const category=categoryBySlug(slug);
 if(!category||subcategory.length>1)notFound();
 const sub=subcategory.length===1?subcategoryBySlug(category,subcategory[0]):undefined;
 if(subcategory.length&&!sub)notFound();
 const title=sub?.name||category.name;
 const description=sub?.hint||category.description;
 return configured
  ?<CommerceShop initialCategory={category.name} initialSubcategory={sub?.name||""} categoryDescription={description}/>
  :<DemoShop initialCategory={category.name} initialSubcategory={sub?.name||""} categoryDescription={description}/>;
}
