import {z} from "zod";
import {configured,db,readBody,bad,ok,sameOrigin,tokenMatches,userFromRequest} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
export async function POST(req:Request){
 if(!configured||process.env.NEXORA_LIVE_ORDERS!=="true")return bad("Payment submissions are not enabled",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 if(!await rateAllow(req,"payment-claims",10,60))return bad("Too many attempts",429);
 let body:unknown;try{body=await readBody(req,2000);}catch{return bad("Invalid request");}
 const parsed=z.object({orderNo:z.string().min(12).max(32),trackingToken:z.string().regex(/^[a-f0-9]{64}$/i).transform(v=>v.toLowerCase()).optional(),transactionId:z.string().trim().min(5).max(90),senderNumber:z.string().max(18).optional(),amountPaisa:z.number().int().positive().max(100_000_000)}).safeParse(body);
 if(!parsed.success)return bad("Invalid claim details",422);
 const x=parsed.data,{data:order}=await db().from("orders").select("*").eq("order_no",x.orderNo).maybeSingle();
 if(!order||!["bkash","nagad"].includes(order.payment_method)||order.order_status==="cancelled")return bad("Order not eligible",404);
 const user=await userFromRequest(req);
 if(!((user&&user.id===order.customer_id)||(x.trackingToken&&tokenMatches(x.trackingToken,order.tracking_token_hash))))return bad("Access denied",403);
 const {error}=await db().from("payment_claims").insert({order_id:order.id,provider:order.payment_method,transaction_id:x.transactionId.toUpperCase(),sender_number:x.senderNumber||"",claimed_paisa:x.amountPaisa,status:"pending"});
 if(error)return bad(/duplicate/i.test(error.message)?"Transaction ID already submitted":"Payment claim could not be recorded",409);
 return ok({received:true,paymentVerified:false,message:"A payment claim has been recorded. Nexora must verify it manually."},201);
}