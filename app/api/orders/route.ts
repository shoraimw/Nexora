import {checkout} from "@/lib/validation";
import {configured,db,bad,ok,readBody,sameOrigin,tokenFor,tokenHash,userFromRequest} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
import {deliverPendingEmails} from "@/lib/email";
import {shopSettings} from "@/lib/shop-settings";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(!configured||process.env.NEXORA_LIVE_ORDERS!=="true"||!process.env.BREVO_API_KEY||!process.env.BREVO_SENDER_EMAIL||(process.env.TRACKING_SECRET||"").length<32)return bad("Checkout is not enabled until secure order emails and tracking are configured",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 if(!await rateAllow(request,"checkout",12,60))return bad("Too many checkout attempts",429);
 let parsed:ReturnType<typeof checkout.safeParse>;
 try{parsed=checkout.safeParse(await readBody(request));}catch{return bad("Invalid request",400);}
 if(!parsed.success)return bad(parsed.error.issues[0]?.message||"Invalid checkout details",422);
 const x=parsed.data,settings=await shopSettings();
 if(x.paymentMethod==="bkash"&&(!settings.bkashEnabled||!settings.bkashNumber))return bad("bKash payments unavailable",422);
 if(x.paymentMethod==="nagad"&&(!settings.nagadEnabled||!settings.nagadNumber))return bad("Nagad payments unavailable",422);
 if(x.paymentMethod==="cod"&&!settings.codEnabled)return bad("Cash on delivery unavailable",422);
 try{
  const token=tokenFor(x.idempotencyKey),user=await userFromRequest(request);
  const {data,error}=await db().rpc("place_nexora_order",{p_key:x.idempotencyKey,p_track_hash:tokenHash(token),p_customer_id:user?.id||null,
   p_details:x.customer,p_lines:x.items,p_method:x.paymentMethod,p_transaction:x.transactionId||null,p_sender:x.senderNumber||null,p_coupon:x.coupon||null});
  if(error)return bad(/duplicate|stock|cart|coupon|transaction|invalid/i.test(error.message)?error.message:"Checkout could not complete",409);
  const {data:confirmed}=await db().from("orders").select("total_paisa,delivery_paisa").eq("id",data.id).maybeSingle();
  try{await deliverPendingEmails(1);}catch{}
  return ok({orderNo:data.order_no,orderId:data.id,trackingToken:token,totalPaisa:confirmed?.total_paisa??null,deliveryPaisa:confirmed?.delivery_paisa??null,duplicate:data.duplicate??false},201);
 }catch{return bad("Checkout temporarily unavailable",503);}
}