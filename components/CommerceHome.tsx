"use client";
import {ChatWidget} from "@/components/ChatWidget";
import {CommerceShop} from "@/components/CommerceShop";
import {HomeHero,HomeCategoryStrip,HomePerks,HomePromos} from "@/components/HomeChrome";
export function CommerceHome(){
 return <main className="nexora-home">
  <div className="announcement">Thoughtful gadgets and everyday essentials <span>·</span> Discover what's new at Nexora</div>
  <div className="container"><HomeHero/><HomeCategoryStrip/><HomePerks/></div>
  <CommerceShop homepage/>
  <div className="container"><HomePromos/></div>
  <ChatWidget/>
 </main>;
}
