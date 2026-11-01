import "server-only";
import {configured,db} from "@/lib/server";
export type StoreSettings={bkashEnabled:boolean;bkashNumber:string;nagadEnabled:boolean;nagadNumber:string;codEnabled:boolean;supportEmail:string;deliveryNotice:string;deliveryEstimate:string};
export const defaultSettings:StoreSettings={bkashEnabled:false,bkashNumber:"",nagadEnabled:false,nagadNumber:"",codEnabled:false,supportEmail:"",deliveryNotice:"Delivery charges are confirmed by Nexora support.",deliveryEstimate:"Delivery times depend on district and courier availability."};
export async function shopSettings():Promise<StoreSettings>{
 if(!configured)return defaultSettings;
 const {data}=await db().from("site_settings").select("value").eq("key","storefront").maybeSingle();
 const value=(data?.value||{}) as Partial<StoreSettings>;
 return {...defaultSettings,...value};
}
