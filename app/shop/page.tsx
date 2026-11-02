import {CommerceShop} from "@/components/CommerceShop";
import {DemoShop} from "@/components/Storefront";
import {configured} from "@/lib/server";
export const dynamic="force-dynamic";
export default function Shop(){return configured?<main><CommerceShop/></main>:<DemoShop/>;}