"use client";
import {ChatWidget} from "@/components/ChatWidget";
import {CommerceShop} from "@/components/CommerceShop";
import {RetailHero,RetailTrustBar,RetailCategoryGrid,RetailPromoBanners} from "@/components/RetailChrome";
export function CommerceHome(){
 return <main className="retail-home">
  <div className="retail-container"><RetailHero/><RetailTrustBar/><RetailCategoryGrid/><RetailPromoBanners/></div>
  <CommerceShop homepage/>
  <ChatWidget/>
 </main>;
}
