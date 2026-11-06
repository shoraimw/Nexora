import {z} from "zod";
import {configured,db,requireOwner,bad,ok,readBody,sameOrigin} from "@/lib/server";
import {uuid,productInput,variantInput} from "@/lib/validation";
const offerShape=z.object({title:z.string().trim().min(3).max(120),description:z.string().trim().max(500).default(""),badge:z.string().trim().min(2).max(32).default("SPECIAL OFFER"),coupon_code:z.string().trim().min(3).max(25).transform(v=>v.toUpperCase()).nullable().default(null),target_url:z.string().trim().min(1).max(300).refine(v=>v.startsWith("/")&&!v.startsWith("//"),"Offer destination must be an internal path").default("/shop"),cta_label:z.string().trim().min(2).max(32).default("Shop now"),starts_at:z.string().datetime({offset:true}).nullable().default(null),ends_at:z.string().datetime({offset:true}).nullable().default(null),active:z.boolean().default(false),sort_order:z.number().int().min(0).max(10000).default(0)});
const offerFields=offerShape.refine(x=>!x.starts_at||!x.ends_at||new Date(x.ends_at)>new Date(x.starts_at),{message:"Offer end must be after start",path:["ends_at"]});
const offerPatch=offerShape.partial().extend({id:uuid});
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
   const x=z.object({name:z.string().trim().min(2).max(90),slug:z.string().trim().regex(/^[a-z0-9-]+$/),description:z.string().max(250).optional(),sort_order:z.number().int().optional(),parent_id:uuid.nullable().optional()}).parse(payload);
   if(x.parent_id){const {data:parent,error:parentError}=await s.from("categories").select("id,parent_id").eq("id",x.parent_id).eq("active",true).maybeSingle();if(parentError)throw parentError;if(!parent||parent.parent_id)throw Error("Choose an active top-level parent category.");}
   const {data,error}=await s.from("categories").insert(x).select().single();if(error)throw error;response=data;
  }else if(action==="category.update"){
   const x=z.object({id:uuid,description:z.string().max(250).optional(),sort_order:z.number().int().min(0).max(10000).optional(),active:z.boolean().optional()}).strict().refine(v=>Object.keys(v).length>1,"Provide at least one category field to update").parse(payload);
   const {id,...patch}=x;const {data:current,error:readError}=await s.from("categories").select("parent_id").eq("id",id).maybeSingle();if(readError)throw readError;if(!current)throw Error("Category not found.");
   if(patch.active===false&&current.parent_id===null){const {error:childError}=await s.from("categories").update({active:false}).eq("parent_id",id);if(childError)throw childError;}
   const {data,error}=await s.from("categories").update(patch).eq("id",id).select().single();if(error)throw error;response=data;
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
   const inv=await s.from("inventory").insert({variant_id:data.id,on_hand,reserved:0});if(inv.error){await s.from("variants").delete().eq("id",data.id);throw inv.error;}
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
  }else if(action==="coupon.update"){
   const x=z.object({code:z.string().trim().min(3).max(25).transform(v=>v.toUpperCase()),active:z.boolean()}).parse(payload);
   const {data,error}=await s.from("coupons").update({active:x.active}).eq("code",x.code).select("code,active").single();if(error)throw error;response=data;
  }else if(action==="offer.create"){
   const x=offerFields.parse(payload);
   if(x.coupon_code){const {data:coupon,error}=await s.from("coupons").select("code,active").eq("code",x.coupon_code).maybeSingle();if(error)throw error;if(!coupon?.active)throw Error("Create and activate this coupon before attaching it to an offer.");}
   const {data,error}=await s.from("store_offers").insert(x).select().single();if(error)throw error;response=data;
  }else if(action==="offer.update"){
   const {id,...patch}=offerPatch.parse(payload);
   const {data:current,error:readError}=await s.from("store_offers").select("starts_at,ends_at").eq("id",id).maybeSingle();
   if(readError)throw readError;if(!current)throw Error("Offer not found.");
   const starts=patch.starts_at===undefined?current.starts_at:patch.starts_at,ends=patch.ends_at===undefined?current.ends_at:patch.ends_at;
   if(starts&&ends&&new Date(ends)<=new Date(starts))throw Error("Offer end must be after start.");
   if(patch.coupon_code){const {data:coupon,error}=await s.from("coupons").select("code,active").eq("code",patch.coupon_code).maybeSingle();if(error)throw error;if(!coupon?.active)throw Error("Create and activate this coupon before attaching it to an offer.");}
   const {data,error}=await s.from("store_offers").update({...patch,updated_at:new Date().toISOString()}).eq("id",id).select().single();if(error)throw error;response=data;
  }else if(action==="delivery.set"){
   const x=z.object({district:z.string().trim().min(1).max(100),fee_paisa:z.number().int().min(0).max(10000000),eta_text:z.string().trim().min(4).max(250),active:z.boolean().default(true)}).parse(payload);
   const zone={...x,district:x.district==="*"?"*":x.district.toLowerCase(),updated_at:new Date().toISOString()};
   const {data,error}=await s.from("delivery_zones").upsert(zone,{onConflict:"district"}).select().single();if(error)throw error;response=data;
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