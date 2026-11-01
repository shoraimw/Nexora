import {shopSettings} from "@/lib/shop-settings";
import {ok} from "@/lib/server";
export const dynamic="force-dynamic";
export async function GET(){return ok({store:await shopSettings()});}