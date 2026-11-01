import {configured,ok,bad} from "@/lib/server";
import {liveCatalog} from "@/lib/catalog-live";
export const dynamic="force-dynamic";
export async function GET(){if(!configured)return ok({live:false,products:[],notice:"Preview catalog only"});try{return ok({live:true,products:await liveCatalog()});}catch{return bad("Catalog temporarily unavailable",503);}}