import {z} from "zod";
import {configured,db,readBody,bad,ok,sameOrigin,requireOwner} from "@/lib/server";
import {deliverPendingEmails} from "@/lib/email";
export async function POST(req:Request){
 if(!configured)return bad("Not configured",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const owner=await requireOwner(req);if(!owner)return bad("Owner access required",403);
 let input:unknown;try{input=await readBody(req,1200);}catch{return bad("Invalid request");}
 const parsed=z.object({claimId:z.string().uuid(),decision:z.enum(["verified","rejected"])}).safeParse(input);
 if(!parsed.success)return bad("Invalid claim or verdict");
 const {data,error}=await db().rpc("nexora_review_payment_claim",{p_actor:owner.id,p_claim:parsed.data.claimId,p_verdict:parsed.data.decision});
 if(error)return bad(error.message.slice(0,200),422);
 try{await deliverPendingEmails(2);}catch{}
 return ok({success:true,result:data});
}