import {configured,db,readBody,bad,ok,sameOrigin,userFromRequest} from "@/lib/server";
import {profileInput} from "@/lib/validation";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 if(!configured)return bad("Accounts unavailable until Supabase setup",503);
 const user=await userFromRequest(req);if(!user)return bad("Login required",401);
 const [{data:profile},{data:orders}]=await Promise.all([
  db().from("profiles").select("*").eq("user_id",user.id).maybeSingle(),
  db().from("orders").select("order_no,order_status,payment_status,total_paisa,created_at").eq("customer_id",user.id).order("created_at",{ascending:false}).limit(50)
 ]);
 let avatarUrl:string|null=null;
 if(profile?.avatar_url){const {data}=await db().storage.from("nexora-avatars").createSignedUrl(profile.avatar_url,3600);avatarUrl=data?.signedUrl||null;}
 return ok({email:user.email,profile,avatarUrl,orders:orders||[]});
}
export async function POST(req:Request){
 if(!configured)return bad("Accounts unavailable",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const user=await userFromRequest(req);if(!user)return bad("Login required",401);
 let body:unknown;try{body=await readBody(req,3000);}catch{return bad("Invalid request");}
 const parsed=profileInput.safeParse(body);if(!parsed.success)return bad("Invalid profile");
 const {error}=await db().from("profiles").upsert({user_id:user.id,...parsed.data,updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(error)return bad("Profile could not be saved",503);return ok({saved:true});
}