import {z} from "zod";
import {configured,db,readBody,bad,ok,sameOrigin} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
export const dynamic="force-dynamic";
const inputSchema=z.object({email:z.string().trim().email().max(254),consent:z.literal(true),company:z.string().max(0).optional()});
export async function POST(req:Request){
 if(!sameOrigin(req))return bad("Origin rejected",403);
 if(!configured)return bad("Newsletter signup is unavailable until the Nexora database is configured.",503);
 let body:unknown;try{body=await readBody(req,2048);}catch{return bad("Invalid request body");}
 const parsed=inputSchema.safeParse(body);if(!parsed.success)return bad("Enter a valid email and confirm your subscription.");
 if(!await rateAllow(req,"newsletter_signup",5,60))return bad("Too many attempts. Please try again later.",429);
 const email=parsed.data.email.toLowerCase();
 const {error}=await db().from("newsletter_subscribers").upsert({email,consent_at:new Date().toISOString(),source:"website",status:"active",unsubscribed_at:null},{onConflict:"email"});
 if(error)return bad("Your subscription could not be saved right now.",503);
 return ok({subscribed:true});
}
