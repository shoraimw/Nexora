import {configured,db,requireOwner,bad,ok} from "@/lib/server";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 if(!configured)return bad("Backend not configured",503);
 if(!await requireOwner(req))return bad("Owner access required",403);
 const s=db();
 const [products,variants,inventory,categories,images,orders,claims,coupons,faqs,emails,zones,offers]=await Promise.all([
  s.from("products").select("*").is("deleted_at",null).order("created_at",{ascending:false}).limit(300),
  s.from("variants").select("*").limit(1500),
  s.from("inventory").select("*").limit(1500),
  s.from("categories").select("*").order("sort_order"),
  s.from("product_images").select("*").order("sort_order"),
  s.from("orders").select("*").order("created_at",{ascending:false}).limit(150),
  s.from("payment_claims").select("*").order("created_at",{ascending:false}).limit(150),
  s.from("coupons").select("*").limit(100),
  s.from("faq_entries").select("*").order("sort_order"),
  s.from("outbound_emails").select("id,kind,status,attempts,last_error,created_at").order("created_at",{ascending:false}).limit(50),
  s.from("delivery_zones").select("*").order("district"),
  s.from("store_offers").select("*").order("sort_order").order("created_at",{ascending:false}).limit(100)
 ]);
 if([products,variants,inventory,categories,images,orders,claims,coupons,faqs,emails,zones,offers].some(x=>x.error))return bad("Dashboard data unavailable",503);
 return ok({products:products.data,variants:variants.data,inventory:inventory.data,categories:categories.data,images:images.data,orders:orders.data,claims:claims.data,coupons:coupons.data,faqs:faqs.data,emails:emails.data,zones:zones.data,offers:offers.data});
}