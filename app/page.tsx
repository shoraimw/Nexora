import {configured} from "@/lib/server";
import {CommerceHome} from "@/components/CommerceHome";
import {Storefront} from "@/components/Storefront";
export const dynamic="force-dynamic";
export default function Home(){return configured?<CommerceHome/>:<Storefront/>;}