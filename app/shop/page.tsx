import {CommerceShop} from "@/components/CommerceShop";
import {configured} from "@/lib/server";
import {Storefront} from "@/components/Storefront";
export default function Shop(){return configured?<main><CommerceShop/></main>:<Storefront/>;}