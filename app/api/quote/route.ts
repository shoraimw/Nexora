import {z} from "zod";
import {configured,db,bad,ok,readBody} from "@/lib/server";
import {liveCatalog} from "@/lib/catalog-live";
import {rateAllow} from "@/lib/rate";
const cart=z.object({items:z.array(z.object({variant_id:z.string().uuid(),quantity:z.number().int().min(1).max(20)})).min(1).max(20),district:z.string().trim().min(1).max(100),coupon:z.string().max(25).optional()});
export async function POST(req:Request){
 if(!configured)return bad("Prices unavailable until catalog setup",503);
 if(!await rateAllow(req,"quote",120,60))return bad("Too many requests",429);
 let input:unknown;try{input=await readBody(req,4000);}catch{return bad("Invalid request");}
 const parsed=cart.safeParse(input);if(!parsed.success)return bad("Invalid cart");
 const {items,district,coupon}=parsed.data;
 if(new Set(items.map(i=>i.variant_id)).size!==items.length)return bad("Duplicate variants");
 const catalog=await liveCatalog().catch(()=>null);if(!catalog)return bad("Catalog unavailable",503);
 let subtotal=0;for(const item of items){const variant=catalog.flatMap(p=>p.variants).find(v=>v.id===item.variant_id);if(!variant||variant.available<item.quantity)return bad("Item unavailable or out of stock",409);subtotal+=variant.price_paisa*item.quantity;}
 const {data:zones}=await db().from("delivery_zones").select("district,fee_paisa,eta_text").eq("active",true);
 const zone=(zones||[]).find(z=>z.district.toLowerCase()===district.toLowerCase())||(zones||[]).find(z=>z.district==="*");
 if(!zone)return bad("Delivery is not configured for this district",422);
 let discount=0;if(coupon?.trim()){
  const {data:c}=await db().from("coupons").select("*").eq("code",coupon.trim().toUpperCase()).eq("active",true).maybeSingle();
  if(!c||c.min_subtotal_paisa>subtotal||(c.max_uses!==null&&c.uses>=c.max_uses)||(c.starts_at&&new Date(c.starts_at)>new Date())||(c.ends_at&&new Date(c.ends_at)<=new Date()))return bad("Coupon unavailable",422);
  discount=c.type==="flat"?Math.min(c.amount,subtotal):Math.min(Math.floor(subtotal*c.amount/100),subtotal);
 }
 return ok({subtotalPaisa:subtotal,deliveryPaisa:zone.fee_paisa,discountPaisa:discount,totalPaisa:subtotal+zone.fee_paisa-discount,deliveryEta:zone.eta_text});
}