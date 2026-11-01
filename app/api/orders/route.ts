import {checkout} from "@/lib/validation";
import {configured,db,bad,ok,readBody,sameOrigin,tokenFor,tokenHash,userFromRequest} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
import {deliverPendingEmails} from "@/lib/email";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(!configured||process.env.NEXORA_LIVE_ORDERS!=="true")return bad("Checkout is not enabled yet",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 if(!await rateAllow(request,"checkout",12,60))return bad("Too many checkout attempts",429);
 let parsed:ReturnType<typeof checkout.safeParse>;
 try{parsed=checkout.safeParse(await readBody(request));}catch{return bad("Invalid request",400);}
 if(!parsed.success)return bad(parsed.error.issues[0]?.message||"Invalid checkout details",422);
 const x=parsed.data;
 try{
  const secret=tokenFor(x.idempotencyKey),user=await userFromRequest(request);
  const {data,error}=await db().rpc("place_nexora_order",{p_key:x.idempotencyKey,p_track_hash:tokenHash(secret),p_customer_id:user?.id||null,
   p_details:x.customer,p_lines:x.items,p_method:x.paymentMethod,p_transaction:x.transactionId||null,p_sender:x.senderNumber||null,p_coupon:x.coupon||null});
  if(error)return bad(/duplicate|stock|cart|coupon|transaction|invalid/i.test(error.message)?error.message:"Checkout could not complete",409);
  try{await deliverPendingEmails(1);}catch{} // Order was already committed; failed email stays queued.
  return ok({orderNo:data.order_no,orderId:data.id,trackingToken:secret,totalPaisa:data.total_paisa??null,duplicate:data.duplicate??false},201);
 }catch{return bad("Checkout is temporarily unavailable",503);}
}
