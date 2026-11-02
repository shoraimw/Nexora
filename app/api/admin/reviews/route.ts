import {z} from "zod";
import {configured,db,bad,ok,readBody,requireOwner,sameOrigin} from "@/lib/server";
import {uuid} from "@/lib/validation";
export async function POST(req:Request){
 if(!configured)return bad("Backend not configured",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const owner=await requireOwner(req);if(!owner)return bad("Owner access required",403);
 let raw:unknown;try{raw=await readBody(req,1200);}catch{return bad("Invalid request");}
 const parsed=z.object({id:uuid,status:z.enum(["approved","rejected"])}).strict().safeParse(raw);
 if(!parsed.success)return bad("Invalid review decision");
 const {data,error}=await db().from("product_reviews").update({status:parsed.data.status,updated_at:new Date().toISOString()})
  .eq("id",parsed.data.id).eq("status","pending").select("id,product_id,status").maybeSingle();
 if(error)return bad("Review moderation failed",503);
 if(!data)return bad("This review is no longer pending.",409);
 await db().from("audit_logs").insert({actor_id:owner.id,action:"review."+parsed.data.status,object_type:"product_review",object_id:data.id,details:{product_id:data.product_id}});
 return ok({success:true,review:data});
}
