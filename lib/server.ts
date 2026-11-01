import "server-only";
import {createClient,type SupabaseClient,type User} from "@supabase/supabase-js";
import {createHash,createHmac} from "node:crypto";
export const configured=!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY);
let store:SupabaseClient|null=null;
export function db(){if(!configured)throw new Error("Supabase not configured");if(!store)store=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});return store;}
export const bad=(error:string,status=400)=>Response.json({error},{status,headers:{"Cache-Control":"no-store"}});
export const ok=(value:unknown,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"no-store"}});
export async function readBody(request:Request,max=12000){if(Number(request.headers.get("content-length")||0)>max)throw Error("Payload too large");const text=await request.text();if(text.length>max)throw Error("Payload too large");return JSON.parse(text) as unknown;}
export async function userFromRequest(request:Request):Promise<User|null>{if(!configured)return null;const auth=request.headers.get("authorization")||"";if(!auth.startsWith("Bearer ")||auth.length>6100)return null;const {data,error}=await db().auth.getUser(auth.slice(7));return error?null:data.user;}
export async function requireOwner(request:Request):Promise<User|null>{const u=await userFromRequest(request);if(!u)return null;const {data}=await db().from("admin_memberships").select("user_id").eq("user_id",u.id).eq("enabled",true).maybeSingle();return data?u:null;}
export function tokenFor(id:string){const secret=process.env.TRACKING_SECRET||"";if(secret.length<32)throw Error("TRACKING_SECRET not configured");return createHmac("sha256",secret).update(id).digest("hex");}
export const tokenHash=(token:string)=>createHash("sha256").update(token).digest("hex");
export const price=(paisa:number)=>"৳"+(paisa/100).toLocaleString("en-BD",{maximumFractionDigits:2});
export function sameOrigin(req:Request){const origin=req.headers.get("origin");if(!origin)return true;try{return new URL(origin).host===new URL(req.url).host;}catch{return false;}}
export function safeError(error:unknown){const message=error instanceof Error?error.message:String(error);return /stock|cart|coupon|payment method|transaction id|already used|duplicate|invalid customer/i.test(message)?message:"Could not process your request";}