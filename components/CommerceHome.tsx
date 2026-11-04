"use client";
import {ChatWidget} from "@/components/ChatWidget";
import {CommerceShop} from "@/components/CommerceShop";
import {RetailTrustBar,RetailCategoryGrid,RetailPromoBanners} from "@/components/RetailChrome";
import {Nexora3DHero} from "@/components/Nexora3DHero";
export function CommerceHome(){
 return <main className="retail-home">
  <div className="retail-container"><Nexora3DHero/><RetailTrustBar/><RetailCategoryGrid/></div>
  <CommerceShop homepage/>
  <div className="retail-container"><RetailPromoBanners/></div>
  <ChatWidget/>
 </main>;
}
