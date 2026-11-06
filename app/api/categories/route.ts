import {configured,db,bad,ok} from "@/lib/server";
import {storeCategories,type StoreCategory} from "@/lib/store-taxonomy";

export const dynamic="force-dynamic";

export async function GET(){
 if(!configured)return ok({live:false,categories:[]});
 const {data,error}=await db().from("categories")
  .select("id,name,slug,parent_id,description,sort_order")
  .eq("active",true).order("sort_order",{ascending:true});
 if(error)return bad("Categories unavailable",503);
 const rows=data||[];
 const categories:StoreCategory[]=rows.filter(row=>!row.parent_id).map(root=>{
  const template=storeCategories.find(category=>category.slug===root.slug);
  return {
   name:root.name,
   slug:root.slug,
   hint:template?.hint||"Explore the collection",
   description:root.description||template?.description||"Explore the collection.",
   subcategories:rows.filter(child=>child.parent_id===root.id).map(child=>{
    const childTemplate=template?.subcategories.find(subcategory=>subcategory.slug===child.slug);
    return {name:child.name,slug:child.slug,hint:child.description||childTemplate?.hint||"Browse this collection"};
   })
  };
 });
 return ok({live:true,categories});
}
