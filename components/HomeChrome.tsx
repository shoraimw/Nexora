"use client";
import Link from "next/link";
import {ArrowRight,Headphones,Watch,Lightbulb,Cable,GraduationCap,Gift,Heart,ShieldCheck,PackageCheck,MessageCircle} from "lucide-react";

const groups=[
 {name:"Audio",detail:"Earbuds & speakers",Icon:Headphones},
 {name:"Wearables",detail:"Smart watches",Icon:Watch},
 {name:"Desk Setup",detail:"Make space better",Icon:Lightbulb},
 {name:"Accessories",detail:"Everyday essentials",Icon:Cable},
 {name:"Student Picks",detail:"Smart on a budget",Icon:GraduationCap},
 {name:"Mystery Box",detail:"A little surprise",Icon:Gift},
 {name:"Plushies",detail:"Soft little gifts",Icon:Heart}
];
export function HomeHero(){
 return <section className="nexora-hero">
  <div className="nexora-hero-copy">
   <p className="hero-kicker"><span/> THE NEXORA EDIT · EVERYDAY TECH</p>
   <h1>Good tech.<br/><em>Better everyday.</em></h1>
   <p className="nexora-hero-description">Useful gadgets, clever little upgrades and gifts worth opening. Find something that makes your everyday a little better.</p>
   <div className="nexora-hero-actions"><Link href="/shop" className="nexora-button">Explore gadgets <ArrowRight size={17}/></Link><Link href="/shop?category=Student%20Picks" className="nexora-text-link">Shop student picks</Link></div>
   <div className="nexora-hero-note"><span>Curated for everyday life</span><span>Bangladesh-first store</span></div>
  </div>
  <div className="nexora-hero-visual">
   <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=88" alt="A thoughtfully arranged modern desk and technology setup" fetchPriority="high"/>
   <div className="hero-image-shade"/>
   <div className="hero-image-caption"><span>01 / THE EVERYDAY SETUP</span><strong>Make room for better ideas.</strong></div>
   <div className="hero-image-index">NEXORA <b>01</b></div>
  </div>
 </section>;
}
export function HomeCategoryStrip(){
 return <section className="nexora-categories">
  <div className="nexora-section-heading"><div><p className="section-kicker">FIND YOUR THING</p><h2>Shop by category</h2></div><Link href="/shop" className="nexora-view-all">View all categories <ArrowRight size={16}/></Link></div>
  <div className="nexora-category-grid">{groups.map(({name,detail,Icon},i)=><Link key={name} href={"/shop?category="+encodeURIComponent(name)} className="nexora-category-tile"><span className="category-icon"><Icon size={22} strokeWidth={1.7}/></span><span className="category-copy"><strong>{name}</strong><small>{detail}</small></span><span className="category-arrow"><ArrowRight size={15}/></span></Link>)}</div>
 </section>;
}
export function HomePerks(){
 return <div className="nexora-perks">
  <div><ShieldCheck size={20}/><span><strong>Product details upfront</strong><small>Clear prices, variants and warranty info</small></span></div>
  <div><PackageCheck size={20}/><span><strong>Order updates</strong><small>Keep track from order to delivery</small></span></div>
  <div><MessageCircle size={20}/><span><strong>Real shopping help</strong><small>Ask Nexora about products and support</small></span></div>
 </div>;
}
export function HomePromos(){
 return <section className="nexora-promo-grid">
  <Link href="/shop?category=Student%20Picks" className="nexora-promo-card promo-student">
   <div><span className="promo-eyebrow">THE SMARTER SETUP</span><h2>Little upgrades.<br/>Big study energy.</h2><p>Discover everyday tech and desk essentials for student life.</p><span className="promo-link">Explore student picks <ArrowRight size={16}/></span></div>
   <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85" alt="A clean workspace with laptop and study essentials" loading="lazy"/>
  </Link>
  <Link href="/shop?category=Mystery%20Box" className="nexora-promo-card promo-mystery">
   <div><span className="promo-eyebrow">SOMETHING UNEXPECTED</span><h2>A box full<br/>of possibilities.</h2><p>Explore Nexora's mystery-box collection and upcoming bundles.</p><span className="promo-link">Discover the surprise <ArrowRight size={16}/></span></div>
   <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=85" alt="A carefully wrapped gift box" loading="lazy"/>
  </Link>
 </section>;
}
