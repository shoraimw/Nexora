import "server-only";
import {createHash} from "node:crypto";
import {configured,db} from "@/lib/server";
export async function rateAllow(req:Request,category:string,max:number,windowMinutes:number){
 if(!configured)return false;
 const secret=process.env.RATE_LIMIT_SECRET||process.env.TRACKING_SECRET||"";
 if(secret.length<32)return false;
 const ip=(req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown").trim();
 const hash=createHash("sha256").update(secret+":"+category+":"+ip).digest("hex");
 const {data,error}=await db().rpc("nexora_rate_allow",{p_hash:hash,p_max:max,p_minutes:windowMinutes});
 return !error&&data===true;
}
