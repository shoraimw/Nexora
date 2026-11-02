import type {Metadata} from "next";
import {OffersPage} from "@/components/OffersPage";
export const metadata:Metadata={title:"Offers & deals",description:"Current Nexora offers and promotional deals."};
export default function Page(){return <OffersPage/>;}
