import {configured} from "@/lib/server";
import {CommerceShop} from "@/components/CommerceShop";
import {Storefront} from "@/components/Storefront";
export const dynamic="force-dynamic";
export default function Home(){if(!configured)return <main><Storefront/></main>;return <main>
 <div className="announcement">Connect with Modern World · Discover what is new at Nexora</div>
 <div className="container"><section className="hero commerce-hero"><div className="hero-text"><p className="eyebrow">THE EVERYDAY TECH EDIT</p><h1>Find your next<br/><em>favorite thing.</em></h1><p>Thoughtful gadgets, delightful finds and a simpler way to shop. Explore audio, wearables, desk accessories and gifts.</p><a className="hero-cta" href="#live-shop">Discover the collection →</a></div><div className="hero-scene"><div className="orbit orbit-one"/><div className="floating-device device-top"><span>✳</span></div><div className="floating-device device-bottom"><span>♫</span></div></div></section></div>
 <div className="trust-strip container"><span>Curated gadgets</span><span>Secure payment review</span><span>Customer-first support</span></div>
 <div id="live-shop"><CommerceShop homepage/></div>
 </main>;}