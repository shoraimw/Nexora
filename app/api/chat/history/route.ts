import {z} from "zod";
import {configured,bad,ok,db,userFromRequest,readBody,sameOrigin} from "@/lib/server";
async function authorised(req:Request){const user=await userFromRequest(req);if(!user)return null;const {data:profile}=await db().from("profiles").select("chat_history_opt_in").eq("user_id",user.id).maybeSingle();return profile?.chat_history_opt_in?user:null;}
export async function GET(req:Request){
 if(!configured)return bad("Chat history unavailable",503);
 const user=await authorised(req);if(!user)return bad("Sign in and enable chat history in profile",403);
 const {data:sessions}=await db().from("chat_sessions").select("id,title,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);
 const ids=(sessions||[]).map(x=>x.id);
 const {data:messages}=ids.length?await db().from("chat_messages").select("session_id,role,body,created_at").in("session_id",ids).order("created_at").limit(300):{data:[]};
 return ok({sessions:sessions||[],messages:messages||[]});
}
export async function DELETE(req:Request){
 if(!configured)return bad("Chat history unavailable",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const user=await userFromRequest(req);if(!user)return bad("Login required",401);
 const {error}=await db().from("chat_sessions").delete().eq("user_id",user.id);
 if(error)return bad("Could not delete chat history",503);
 return ok({deleted:true});
}
