import {configured,db,bad,ok} from "@/lib/server";
export const dynamic="force-dynamic";
export async function GET(){
 if(!configured)return ok({live:false,offers:[]});
 try{
  const {data,error}=await db().from("store_offers")
   .select("id,title,description,badge,coupon_code,target_url,cta_label,starts_at,ends_at")
   .eq("active",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false}).limit(100);
  if(error)return bad("Offers temporarily unavailable",503);
  const now=Date.now();
  const offers=(data||[]).filter(offer=>
   (!offer.starts_at||Date.parse(offer.starts_at)<=now)&&
   (!offer.ends_at||Date.parse(offer.ends_at)>now)
  );
  return ok({live:true,offers});
 }catch{return bad("Offers temporarily unavailable",503);}
}
