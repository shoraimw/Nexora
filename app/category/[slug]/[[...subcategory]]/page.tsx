import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {configured,db} from "@/lib/server";
import {categoryBySlug,subcategoryBySlug,type StoreCategory} from "@/lib/store-taxonomy";
import {CommerceShop} from "@/components/CommerceShop";
import {DemoShop} from "@/components/Storefront";

type Params={slug:string;subcategory?:string[]};

async function resolveCategory(slug:string,subcategorySlug?:string){
 const base=categoryBySlug(slug);
 if(!base)return null;
 if(!configured){
  const sub=subcategorySlug?subcategoryBySlug(base,subcategorySlug):undefined;
  return {category:base,sub};
 }
 const {data,error}=await db().from("categories")
  .select("id,name,slug,parent_id,description").eq("active",true);
 if(error)return null;
 const root=data?.find(item=>item.slug===slug&&!item.parent_id);
 if(!root)return null;
 const children=(data||[]).filter(item=>item.parent_id===root.id);
 const category:StoreCategory={
  ...base,
  name:root.name,
  description:root.description||base.description,
  subcategories:children.map(child=>{
   const template=base.subcategories.find(item=>item.slug===child.slug);
   return {name:child.name,slug:child.slug,hint:child.description||template?.hint||"Browse this collection"};
  })
 };
 const sub=subcategorySlug?category.subcategories.find(item=>item.slug===subcategorySlug):undefined;
 return {category,sub};
}

export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
 const {slug,subcategory=[]}=await params;
 if(subcategory.length>1)return {title:"Category not found",robots:{index:false,follow:false}};
 const resolved=await resolveCategory(slug,subcategory[0]);
 if(!resolved||(subcategory.length===1&&!resolved.sub))return {title:"Category not found",robots:{index:false,follow:false}};
 const title=resolved.sub?.name||resolved.category.name;
 const description=resolved.sub?.hint||resolved.category.description;
 return {title:title+" | Nexora",description,openGraph:{title:title+" | Nexora",description,type:"website"}};
}

export default async function CategoryPage({params}:{params:Promise<Params>}){
 const {slug,subcategory=[]}=await params;
 if(subcategory.length>1)notFound();
 const resolved=await resolveCategory(slug,subcategory[0]);
 if(!resolved||(subcategory.length&&!resolved.sub))notFound();
 const {category,sub}=resolved;
 const description=sub?.hint||category.description;
 return configured
  ?<CommerceShop initialCategory={category.name} initialSubcategory={sub?.name||""} categoryDescription={description}/>
  :<DemoShop initialCategory={category.name} initialSubcategory={sub?.name||""} categoryDescription={description}/>;
}
