import {configured,db,bad,ok,readBody,requireOwner,sameOrigin} from "@/lib/server";
import {adminTransition} from "@/lib/validation";
import {deliverPendingEmails} from "@/lib/email";
export async function POST(request:Request){
 if(!configured)return bad("Backend not configured",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 const owner=await requireOwner(request);if(!owner)return bad("Owner access required",403);
 let raw:unknown;try{raw=await readBody(request,2500);}catch{return bad("Invalid request");}
 const result=adminTransition.safeParse(raw);if(!result.success)return bad("Invalid order action");
 const x=result.data;
 if(x.payment)return bad("Use individual payment-claim verification instead",400);
 const {error}=await db().rpc("admin_change_order",{p_order:x.id,p_actor:owner.id,p_status:x.status||null,p_payment:null,p_courier:x.courier||null,p_consignment:x.consignment||null,p_tracking_url:x.trackingUrl||null});
 if(error)return bad(error.message.slice(0,300),422);
 try{await deliverPendingEmails(3);}catch{}
 return ok({success:true});
}