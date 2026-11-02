import {z} from "zod";
import type {User} from "@supabase/supabase-js";
import {configured,db,bad,ok,readBody,sameOrigin,userFromRequest} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
import {uuid} from "@/lib/validation";
export const dynamic="force-dynamic";
const reviewInput=z.object({
 productId:uuid,
 rating:z.number().int().min(1).max(5),
 title:z.string().trim().min(3).max(100),
 body:z.string().trim().min(10).max(1600)
}).strict();

async function deliveredOrderForProduct(productId:string,user:User):Promise<string|null>{
 if(!user.email||!user.email_confirmed_at)return null;
 const s=db();
 const [owned,guest]=await Promise.all([
  s.from("orders").select("id").eq("customer_id",user.id).eq("order_status","delivered").limit(50),
  s.from("orders").select("id").eq("email",user.email.toLowerCase()).eq("order_status","delivered").limit(50)
 ]);
 if(owned.error||guest.error)return null;
 const orderIds=[...new Set([...(owned.data||[]),...(guest.data||[])].map(x=>x.id))];
 if(!orderIds.length)return null;
 const {data:lines,error:lineError}=await s.from("order_items").select("order_id,variant_id").in("order_id",orderIds).limit(1000);
 if(lineError||!lines?.length)return null;
 const variantIds=[...new Set(lines.map(x=>x.variant_id))];
 if(!variantIds.length)return null;
 const {data:matches,error:variantError}=await s.from("variants").select("id").eq("product_id",productId).in("id",variantIds).limit(1000);
 if(variantError||!matches?.length)return null;
 const matchingIds=new Set(matches.map(x=>x.id));
 return lines.find(x=>matchingIds.has(x.variant_id))?.order_id||null;
}

export async function GET(req:Request){
 if(!configured)return ok({live:false,count:0,average:0,reviews:[],canReview:false,hasReviewed:false,signedIn:false,emailVerified:false});
 const productId=uuid.safeParse(new URL(req.url).searchParams.get("productId"));
 if(!productId.success)return bad("A valid product is required");
 const s=db();
 const [{data:reviews,error:reviewError},{data:summary,error:summaryError}]=await Promise.all([
  s.from("product_reviews").select("id,rating,title,body,verified_purchase,created_at").eq("product_id",productId.data).eq("status","approved").order("created_at",{ascending:false}).limit(50),
  s.rpc("nexora_product_review_summary",{p_product_id:productId.data})
 ]);
 if(reviewError||summaryError)return bad("Reviews temporarily unavailable",503);
 const user=await userFromRequest(req);
 let canReview=false,hasReviewed=false;
 if(user){
  const {data:existing}=await s.from("product_reviews").select("id").eq("product_id",productId.data).eq("user_id",user.id).maybeSingle();
  hasReviewed=!!existing;
  if(!hasReviewed)canReview=!!(await deliveredOrderForProduct(productId.data,user));
 }
 const stats=Array.isArray(summary)?summary[0]:null;
 return ok({live:true,count:Number(stats?.review_count||0),average:Number(stats?.average_rating||0),reviews:reviews||[],canReview,hasReviewed,signedIn:!!user,emailVerified:!!user?.email_confirmed_at});
}

export async function POST(req:Request){
 if(!configured)return bad("Reviews are not enabled yet",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 if(!await rateAllow(req,"product-review",4,60))return bad("Too many review attempts. Please try again later.",429);
 const user=await userFromRequest(req);
 if(!user)return bad("Please sign in to submit a review.",401);
 if(!user.email_confirmed_at)return bad("Please verify your account email before reviewing.",403);
 let raw:unknown;try{raw=await readBody(req,3200);}catch{return bad("Invalid review request");}
 const parsed=reviewInput.safeParse(raw);
 if(!parsed.success)return bad(parsed.error.issues[0]?.message||"Review details are invalid",422);
 const x=parsed.data,s=db();
 const {data:product,error:productError}=await s.from("products").select("id").eq("id",x.productId).eq("active",true).is("deleted_at",null).maybeSingle();
 if(productError)return bad("Product reviews are temporarily unavailable",503);
 if(!product)return bad("Product not found",404);
 const {data:existing,error:existingError}=await s.from("product_reviews").select("id").eq("product_id",x.productId).eq("user_id",user.id).maybeSingle();
 if(existingError)return bad("Could not check your previous review",503);
 if(existing)return bad("You have already reviewed this product.",409);
 const orderId=await deliveredOrderForProduct(x.productId,user);
 if(!orderId)return bad("A delivered Nexora purchase is required before you can review this product.",403);
 const {error}=await s.from("product_reviews").insert({
  product_id:x.productId,user_id:user.id,order_id:orderId,rating:x.rating,title:x.title,body:x.body,status:"pending",verified_purchase:true
 });
 if(error?.code==="23505")return bad("You have already reviewed this product.",409);
 if(error)return bad("Your review could not be submitted. Please try again.",503);
 return ok({success:true,status:"pending",message:"Thank you. Your review is awaiting owner moderation."},201);
}
