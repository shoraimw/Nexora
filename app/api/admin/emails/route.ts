import {configured,db,bad,ok,requireOwner,sameOrigin} from "@/lib/server";
import {deliverPendingEmails} from "@/lib/email";
export async function POST(req:Request){
 if(!configured)return bad("Backend not configured",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 if(!await requireOwner(req))return bad("Owner access required",403);
 const {error}=await db().from("outbound_emails").update({status:"queued"}).eq("status","failed").lt("attempts",5);
 if(error)return bad("Could not queue retries",503);
 const result=await deliverPendingEmails(5);return ok(result);
}