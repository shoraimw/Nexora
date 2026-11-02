import {CommerceShop} from "@/components/CommerceShop";
import {DemoShop} from "@/components/Storefront";
import {configured} from "@/lib/server";
import {ChatWidget} from "@/components/ChatWidget";
export const dynamic="force-dynamic";
export default function Shop(){return configured?<><main><CommerceShop/></main><ChatWidget/></>:<DemoShop/>;}