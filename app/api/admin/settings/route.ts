import {z} from "zod";
import {configured,db,bad,ok,readBody,requireOwner,sameOrigin} from "@/lib/server";
import {shopSettings} from "@/lib/shop-settings";
const settings=z.object({
 bkashEnabled:z.boolean(),bkashNumber:z.string().regex(/^$|^01[0-9]{9}$/),
 nagadEnabled:z.boolean(),nagadNumber:z.string().regex(/^$|^01[0-9]{9}$/),
 codEnabled:z.boolean(),supportEmail:z.union([z.literal(""),z.string().email()]).max(200),
 deliveryNotice:z.string().min(5).max(350),deliveryEstimate:z.string().min(5).max(350)
}).strict().refine(v=>!v.bkashEnabled||!!v.bkashNumber,"bKash number required").refine(v=>!v.nagadEnabled||!!v.nagadNumber,"Nagad number required");
export async function GET(req:Request){if(!configured)return bad("Backend unavailable",503);if(!await requireOwner(req))return bad("Forbidden",403);return ok({settings:await shopSettings()});}
export async function POST(req:Request){
 if(!configured)return bad("Backend unavailable",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const owner=await requireOwner(req);if(!owner)return bad("Forbidden",403);
 let body:unknown;try{body=await readBody(req,3000);}catch{return bad("Invalid request");}
 const r=settings.safeParse(body);if(!r.success)return bad(r.error.issues[0]?.message||"Invalid settings");
 const {error}=await db().from("site_settings").upsert({key:"storefront",value:r.data,updated_at:new Date().toISOString()});
 if(error)return bad("Save failed",503);
 await db().from("audit_logs").insert({actor_id:owner.id,action:"settings.update",object_type:"site_settings",object_id:"storefront",details:{paymentMethods:[r.data.bkashEnabled?"bkash":"",r.data.nagadEnabled?"nagad":"",r.data.codEnabled?"cod":""]}});
 return ok({saved:true});
}