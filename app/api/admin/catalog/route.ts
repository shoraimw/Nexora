import {z} from "zod";
import {configured,db,requireOwner,bad,ok,readBody,sameOrigin} from "@/lib/server";
import {uuid,productInput,variantInput} from "@/lib/validation";
export async function POST(req:Request){
 if(!configured)return bad("Backend not configured",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const owner=await requireOwner(req);if(!owner)return bad("Owner access required",403);
 let input:unknown;try{input=await readBody(req,16000);}catch{return bad("Invalid request");}
 const obj=z.object({action:z.string(),payload:z.unknown()}).safeParse(input);
 if(!obj.success)return bad("Invalid action");
 const {action,payload}=obj.data,s=db();
 let response:unknown;
 try{
  if(action==="category.create"){
   const x=z.object({name:z.string().min(2).max(90),slug:z.string().regex(/^[a-z0-9-]+$/),description:z.string().max(250).optional(),sort_order:z.number().int().optional()}).parse(payload);
   const {data,error}=await s.from("categories").insert(x).select().single();if(error)throw error;response=data;
  }else if(action==="product.create"){
   const x=productInput.parse(payload);
   const {data,error}=await s.from("products").insert(x).select().single();if(error)throw error;response=data;
  }else if(action==="product.update"){
   const x=productInput.partial().extend({id:uuid}).parse(payload);const {id,...patch}=x;
   const {data,error}=await s.from("products").update({...patch,updated_at:new Date().toISOString()}).eq("id",id).is("deleted_at",null).select().single();if(error)throw error;response=data;
  }else if(action==="product.archive"){
   const {id}=z.object({id:uuid}).parse(payload);
   const {data,error}=await s.from("products").update({active:false,deleted_at:new Date().toISOString()}).eq("id",id).select("id").single();if(error)throw error;response=data;
  }else if(action==="variant.create"){
   const x=variantInput.parse(payload),{on_hand,...variant}=x;
   const {data,error}=await s.from("variants").insert(variant).select().single();if(error)throw error;
   const inv=await s.from("inventory").insert({variant_id:data.id,on_hand,reserved:0});if(inv.error)throw inv.error;
   response=data;
  }else if(action==="variant.update"){
   const x=variantInput.omit({on_hand:true}).partial().extend({id:uuid}).parse(payload);
   const {id,...patch}=x;
   const {data,error}=await s.from("variants").update(patch).eq("id",id).select().single();if(error)throw error;response=data;
  }else if(action==="stock.set"){
   const x=z.object({variant_id:uuid,on_hand:z.number().int().min(0).max(100000)}).parse(payload);
   const {error}=await s.rpc("admin_set_nexora_stock",{p_admin:owner.id,p_variant:x.variant_id,p_count:x.on_hand});if(error)throw error;response=x;
  }else if(action==="coupon.create"){
   const x=z.object({code:z.string().trim().min(3).max(25),type:z.enum(["flat","percent"]),amount:z.number().int().positive(),min_subtotal_paisa:z.number().int().nonnegative().default(0),max_uses:z.number().int().positive().nullable().optional(),active:z.boolean().default(true)}).parse(payload);
   if(x.type==="percent"&&x.amount>100)throw Error("Percentage exceeds 100");
   const {data,error}=await s.from("coupons").insert({...x,code:x.code.toUpperCase()}).select().single();if(error)throw error;response=data;
  }else if(action==="faq.create"){
   const x=z.object({question:z.string().min(4).max(300),answer:z.string().min(4).max(3000),active:z.boolean().default(true)}).parse(payload);
   const {data,error}=await s.from("faq_entries").insert(x).select().single();if(error)throw error;response=data;
  }else if(action==="faq.update"){
   const x=z.object({id:uuid,question:z.string().min(4).max(300),answer:z.string().min(4).max(3000),active:z.boolean()}).parse(payload);
   const {id,...patch}=x;const {data,error}=await s.from("faq_entries").update(patch).eq("id",id).select().single();if(error)throw error;response=data;
  }else return bad("Unsupported action",400);
  await s.from("audit_logs").insert({actor_id:owner.id,action,object_type:action.split(".")[0],object_id:typeof(response as {id?:string})?.id==="string"?(response as {id:string}).id:"n/a",details:{source:"owner-dashboard"}});
  return ok({success:true,data:response});
 }catch(e){return bad(e instanceof Error?e.message.slice(0,200):"Could not save",422);}
}