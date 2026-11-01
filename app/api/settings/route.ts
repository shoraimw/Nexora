import {shopSettings} from "@/lib/shop-settings";
import {configured,db,ok} from "@/lib/server";
export const dynamic="force-dynamic";
export async function GET(){
 const store=await shopSettings();
 const zones=configured?(await db().from("delivery_zones").select("district,fee_paisa,eta_text").eq("active",true)).data||[]:[];
 return ok({store,zones});
}