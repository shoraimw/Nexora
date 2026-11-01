import {z} from "zod";
import {configured,db,bad,ok,readBody,tokenHash,userFromRequest,sameOrigin} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(!configured)return bad("Order lookup not configured",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 if(!await rateAllow(request,"track",50,60))return bad("Too many tracking requests",429);
 let body:unknown;try{body=await readBody(request,2000);}catch{return bad("Invalid request");}
 const result=z.object({orderNo:z.string().regex(/^NX-[0-9]{8}-[A-F0-9]{8}$/),token:z.string().regex(/^[a-f0-9]{64}$/).optional()}).safeParse(body);
 if(!result.success)return bad("Invalid tracking request");
 const {orderNo,token}=result.data;
 const user=await userFromRequest(request);
 const {data:order,error}=await db().from("orders").select("*").eq("order_no",orderNo).maybeSingle();
 if(error||!order)return bad("Order not found or access denied",404);
 if(!((user&&order.customer_id===user.id)||(token&&tokenHash(token)===order.tracking_token_hash)))return bad("Order not found or access denied",404);
 const [{data:items},{data:shipment},{data:events}]=await Promise.all([
  db().from("order_items").select("title,sku,variant_name,quantity,unit_price_paisa").eq("order_id",order.id),
  db().from("shipments").select("provider,consignment_id,tracking_url,dispatched_at,delivered_at").eq("order_id",order.id).maybeSingle(),
  db().from("order_events").select("event,created_at").eq("order_id",order.id).order("created_at")
 ]);
 const {tracking_token_hash,idempotency_key,...publicOrder}=order;
 return ok({order:publicOrder,items:items||[],shipment:shipment||null,events:events||[]});
}
