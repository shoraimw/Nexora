"use client";
import {ChatWidget} from "@/components/ChatWidget";
import {CommerceShop} from "@/components/CommerceShop";
import {RetailHero,RetailTrustBar,RetailCategoryGrid,RetailPromoBanners} from "@/components/RetailChrome";
export function CommerceHome(){
 return <main className="retail-home">
  <div className="retail-announcement"><span>Welcome to Nexora</span><b>Thoughtful gadgets for everyday life</b><span>Discover something new <span aria-hidden>→</span></span></div>
  <div className="retail-container"><RetailHero/><RetailTrustBar/><RetailCategoryGrid/></div>
  <CommerceShop homepage/>
  <div className="retail-container"><RetailPromoBanners/></div>
  <ChatWidget/>
 </main>;
}
