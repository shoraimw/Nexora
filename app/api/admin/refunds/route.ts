import {z} from "zod";
import {configured,db,readBody,bad,ok,requireOwner,sameOrigin} from "@/lib/server";
export async function POST(req:Request){
 if(!configured)return bad("Backend unavailable",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const owner=await requireOwner(req);if(!owner)return bad("Owner access required",403);
 let body:unknown;try{body=await readBody(req,2500);}catch{return bad("Invalid request");}
 const parsed=z.object({orderId:z.string().uuid(),amountPaisa:z.number().int().positive(),method:z.enum(["bkash","nagad","cash","bank"]),reference:z.string().min(5).max(100),note:z.string().max(500).optional()}).safeParse(body);
 if(!parsed.success)return bad("Invalid refund record");
 const x=parsed.data,{data,error}=await db().rpc("nexora_record_manual_refund",{p_actor:owner.id,p_order:x.orderId,p_amount:x.amountPaisa,p_method:x.method,p_reference:x.reference,p_note:x.note||""});
 if(error)return bad(error.message.slice(0,250),422);
 return ok({recorded:true,result:data});
}