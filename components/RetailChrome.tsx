"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowRight,Smartphone,Laptop,BatteryCharging,Tablet,ShieldCheck,Watch,Headphones,Keyboard,Camera,Lightbulb,Gamepad2,Plane,Truck,PackageCheck,MessageCircle,Grid2X2,Router} from "lucide-react";
import {storeCategories,categoryHref} from "@/lib/store-taxonomy";

const slides=[
 {kicker:"THE NEXORA COLLECTION",title:"Small upgrades.\nBetter everyday.",description:"Discover useful gadgets, clever accessories and everyday essentials selected for modern life.",cta:"Shop all gadgets",href:"/shop",image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1800&q=90",alt:"Wireless earbuds on a clean studio background"},
 {kicker:"MAKE YOUR DESK YOURS",title:"A better setup\nstarts here.",description:"Little additions for work, study and everything in between.",cta:"Explore desk essentials",href:"/category/pc-accessories/desk-setup",image:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=90",alt:"Modern desk and laptop setup"},
 {kicker:"GIFTS, WITHOUT THE GUESSWORK",title:"Find a little\nsomething special.",description:"Thoughtful finds, fun surprises and gifts that feel personal.",cta:"Discover gift picks",href:"/shop?category=Mystery%20Box",image:"https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1800&q=90",alt:"Gift box wrapped for a special occasion"}
];
const categoryIcons:Record<string,typeof Smartphone>={
 "Phones":Smartphone,"Mac":Laptop,"Phone Accessories":BatteryCharging,"Tablets":Tablet,
 "Cases & Protectors":ShieldCheck,"Watches":Watch,"Headphones & Speakers":Headphones,
 "PC Accessories":Keyboard,"Camera":Camera,"Networking":Router,"Gadgets":Lightbulb,
 "Gaming":Gamepad2,"Drone":Plane
};
export function RetailHero(){
 const [active,setActive]=useState(0);
 const [pausedByFocus,setPausedByFocus]=useState(false);
 const [tabVisible,setTabVisible]=useState(true);
 const [reducedMotion,setReducedMotion]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncMotion=()=>setReducedMotion(media.matches);
  const syncVisibility=()=>setTabVisible(document.visibilityState==="visible");
  syncMotion();syncVisibility();
  media.addEventListener("change",syncMotion);
  document.addEventListener("visibilitychange",syncVisibility);
  return()=>{media.removeEventListener("change",syncMotion);document.removeEventListener("visibilitychange",syncVisibility);};
 },[]);
 useEffect(()=>{
  if(reducedMotion||!tabVisible||pausedByFocus)return;
  const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),5000);
  return()=>window.clearInterval(timer);
 },[reducedMotion,tabVisible,pausedByFocus]);
 return <section className="retail-hero-layout" aria-label="Featured products and collections">
  <div className="retail-hero-main" aria-roledescription="carousel" onFocusCapture={()=>setPausedByFocus(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPausedByFocus(false);}}>
   {slides.map((slide,index)=><div key={slide.kicker} className={"retail-hero-slide"+(index===active?" is-active":"")} aria-hidden={index!==active}>
    <img src={slide.image} alt={slide.alt} fetchPriority={index===0?"high":"auto"} loading={index===0?"eager":"lazy"}/>
    <div className="retail-hero-shade"/>
    <div className="retail-hero-copy"><span className="retail-hero-kicker">{slide.kicker}</span><h1>{slide.title.split("\n").map((line,i)=><span key={line}>{line}{i===0&&<br/>}</span>)}</h1><p>{slide.description}</p><Link tabIndex={active===index?0:-1} href={slide.href} className="retail-primary-link">{slide.cta}<ArrowRight size={17}/></Link></div>
   </div>)}
  </div>
  <div className="retail-hero-side">
   <Link href="/shop?category=Student%20Picks" className="retail-side-card retail-side-student"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=85" alt="Laptop and study workspace"/><span className="retail-side-shade"/><span className="retail-side-copy"><small>MADE FOR STUDY DAYS</small><strong>Student<br/>essentials</strong><b>Shop now <ArrowRight size={14}/></b></span></Link>
   <Link href="/shop?category=Accessories" className="retail-side-card retail-side-accessories"><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=85" alt="Minimal everyday accessories"/><span className="retail-side-shade"/><span className="retail-side-copy"><small>THE LITTLE THINGS</small><strong>Everyday<br/>upgrades</strong><b>Explore accessories <ArrowRight size={14}/></b></span></Link>
  </div>
 </section>;
}
export function RetailTrustBar(){
 const items=[
  {Icon:Truck,title:"Delivery information",copy:"Clear details before checkout"},
  {Icon:PackageCheck,title:"Order tracking",copy:"Follow your order updates"},
  {Icon:MessageCircle,title:"Shopping assistance",copy:"Help choosing the right product"},
  {Icon:ShieldCheck,title:"Clear policies",copy:"Know the details before you buy"}
 ];
 return <section className="retail-trustbar" aria-label="Shopping information">{items.map(({Icon,title,copy})=><div key={title}><span className="retail-trust-icon"><Icon size={21}/></span><span><strong>{title}</strong><small>{copy}</small></span></div>)}</section>;
}
export function RetailCategoryGrid(){
 return <section className="retail-category-section">
  <div className="retail-section-heading"><div><span className="retail-eyebrow">BROWSE THE COLLECTION</span><h2>Featured Categories</h2><p>Jump straight to the gear you are looking for.</p></div><Link href="/shop" className="retail-section-link">All categories <ArrowRight size={16}/></Link></div>
  <div className="retail-category-grid">{storeCategories.map(category=>{const Icon=categoryIcons[category.name]||Grid2X2;return <Link key={category.slug} href={categoryHref(category)} className="retail-category-card"><span className="retail-category-icon"><Icon size={25} strokeWidth={1.65}/></span><strong>{category.name}</strong><small>{category.hint}</small><ArrowRight className="retail-category-arrow" size={15}/></Link>;})}</div>
 </section>;
}
export function RetailPromoBanners(){
 return <section className="retail-promo-grid">
  <Link href="/shop?category=Student%20Picks" className="retail-promo retail-promo-student"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85" alt="Study desk with laptop"/><span className="retail-promo-shade"/><span className="retail-promo-copy"><small>THE STUDENT EDIT</small><strong>Smart picks for<br/>big ideas.</strong><b>Explore student picks <ArrowRight size={15}/></b></span></Link>
  <Link href="/shop?category=Mystery%20Box" className="retail-promo retail-promo-gift"><img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1100&q=85" alt="Gift wrapped in neutral paper"/><span className="retail-promo-shade"/><span className="retail-promo-copy"><small>A LITTLE SURPRISE</small><strong>Make gifting<br/>more fun.</strong><b>Discover gift ideas <ArrowRight size={15}/></b></span></Link>
 </section>;
}
