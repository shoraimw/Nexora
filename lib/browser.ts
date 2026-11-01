"use client";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
let instance:SupabaseClient|null=null;
export const browserConfigured=!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function browserDb():SupabaseClient|null{if(!browserConfigured)return null;if(!instance)instance=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return instance;}
export async function authHeaders():Promise<Record<string,string>>{const auth=browserDb();if(!auth)return {};const {data:{session}}=await auth.auth.getSession();return session?{Authorization:"Bearer "+session.access_token}:{};}