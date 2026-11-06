import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
import {configured,db,bad,ok,readBody,sameOrigin,userFromRequest} from "@/lib/server";
import {rateAllow} from "@/lib/rate";

export const dynamic="force-dynamic";

const deletionInput=z.object({
 confirmEmail:z.string().trim().email().max(200),
 password:z.string().min(8).max(128)
}).strict();

export async function POST(request:Request){
 if(!configured)return bad("Account deletion is unavailable until the secure backend is configured",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 if(!await rateAllow(request,"account-delete",2,60))return bad("Too many deletion attempts. Please try again later.",429);
 const user=await userFromRequest(request);
 if(!user?.email)return bad("Sign in before requesting account deletion",401);

 let body:unknown;
 try{body=await readBody(request,2000);}catch{return bad("Invalid deletion request",400);}
 const parsed=deletionInput.safeParse(body);
 if(!parsed.success)return bad("Enter your account email and current password",422);
 if(parsed.data.confirmEmail.toLowerCase()!==user.email.toLowerCase())return bad("The confirmation email does not match your signed-in account",403);

 const verifier=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
 });
 const verified=await verifier.auth.signInWithPassword({email:user.email,password:parsed.data.password});
 if(verified.error||verified.data.user?.id!==user.id)return bad("Current password could not be verified",403);

 const {data:membership,error:membershipError}=await db().from("admin_memberships")
  .select("role").eq("user_id",user.id).eq("enabled",true).maybeSingle();
 if(membershipError)return bad("Account permissions could not be checked",503);
 if(membership?.role==="owner")return bad("Owner accounts must be deprovisioned by the other owner to protect store access",403);

 const {data:profile}=await db().from("profiles").select("avatar_url").eq("user_id",user.id).maybeSingle();
 const {error}=await db().rpc("nexora_delete_customer_account",{p_user_id:user.id});
 if(error)return bad(/owner accounts/i.test(error.message)?error.message:"Account deletion could not be completed",409);
 if(profile?.avatar_url){
  try{await db().storage.from("nexora-avatars").remove([profile.avatar_url]);}catch{}
 }
 return ok({deleted:true,ordersAnonymized:true});
}
