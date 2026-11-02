import type {Metadata} from "next";
import Link from "next/link";
import {ArrowUpRight,Search,UserRound,Headphones,Gift,GraduationCap,Store,PackageSearch,LifeBuoy,ChevronDown,Menu,Watch,Lightbulb,Cable,Heart} from "lucide-react";
import {CartProvider} from "@/components/CartProvider";
import {HeaderCart} from "@/components/HeaderCart";
import "./globals.css";
import "./commerce.css";
import "./mobile.css";
import "./brand-refresh.css";
import "./retail-store.css";
import "./filter-ui.css";
export const metadata:Metadata={
 title:{default:"Nexora | Connect with Modern World",template:"%s | Nexora"},
 description:"Discover gadgets, tech accessories and unique everyday finds with Nexora.",
 robots:{index:false,follow:false}
};
const navCategories=[
 {name:"Audio",href:"/shop?category=Audio",Icon:Headphones},
 {name:"Wearables",href:"/shop?category=Wearables",Icon:Watch},
 {name:"Accessories",href:"/shop?category=Accessories",Icon:Cable},
 {name:"Desk Setup",href:"/shop?category=Desk%20Setup",Icon:Lightbulb},
 {name:"Student Picks",href:"/shop?category=Student%20Picks",Icon:GraduationCap},
 {name:"Mystery Box",href:"/shop?category=Mystery%20Box",Icon:Gift},
 {name:"Plushies",href:"/shop?category=Plushies",Icon:Heart}
];
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><CartProvider>
  <div className="retail-topbar"><div className="retail-container retail-topbar-inner"><span>Everyday tech, thoughtfully picked by Nexora</span><div><Link href="/track">Track order</Link><Link href="/contact">Customer support</Link><Link href="/policies">Shopping policies</Link></div></div></div>
  <header className="retail-site-header">
   <div className="retail-container retail-header-main">
    <Link className="retail-brand" href="/" aria-label="Nexora home"><span className="retail-brand-mark">N<span>.</span></span><span className="retail-brand-name">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link>
    <form className="retail-search" action="/shop" method="get"><Search size={19}/><input name="q" type="search" placeholder="Search for products, brands and more..." aria-label="Search Nexora"/><button type="submit">Search</button></form>
    <div className="retail-header-actions"><Link href="/account"><UserRound size={19}/><span>Account</span></Link><HeaderCart/></div>
   </div>
   <nav className="retail-nav" aria-label="Main navigation"><div className="retail-container retail-nav-inner">
    <details className="retail-category-dropdown"><summary><Menu size={17}/> Shop by category <ChevronDown size={14}/></summary><div className="retail-mega-menu"><div><strong>Browse categories</strong><p>Explore the Nexora collection</p></div><div className="retail-mega-links">{navCategories.map(({name,href,Icon})=><Link key={name} href={href}><Icon size={17}/>{name}<ArrowUpRight size={13}/></Link>)}</div><Link href="/shop" className="retail-mega-all">View all products <ArrowUpRight size={14}/></Link></div></details>
    <Link href="/">Home</Link><Link href="/shop">All products</Link><Link href="/shop?category=Audio">Audio</Link><Link href="/shop?category=Wearables">Wearables</Link><Link href="/shop?category=Accessories">Accessories</Link><Link href="/shop?category=Student%20Picks">Student picks</Link><Link href="/shop?category=Mystery%20Box">Mystery box</Link><Link href="/contact">Help & support</Link>
   </div></nav>
  </header>
  <nav className="retail-mobile-nav" aria-label="Mobile navigation"><Link href="/shop"><Store size={19}/>Shop</Link><Link href="/track"><PackageSearch size={19}/>Orders</Link><Link href="/account"><UserRound size={19}/>Account</Link><Link href="/contact"><LifeBuoy size={19}/>Help</Link></nav>
  {children}
  <footer className="retail-footer"><div className="retail-container retail-footer-main"><div className="retail-footer-brand"><Link className="retail-brand" href="/"><span className="retail-brand-mark">N<span>.</span></span><span className="retail-brand-name">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link><p>Gadgets, accessories and little upgrades for everyday life.</p></div><div><strong>Shop</strong><Link href="/shop">All products</Link><Link href="/shop?category=Audio">Audio</Link><Link href="/shop?category=Wearables">Wearables</Link><Link href="/shop?category=Accessories">Accessories</Link><Link href="/shop?category=Student%20Picks">Student picks</Link></div><div><strong>Customer care</strong><Link href="/track">Track an order</Link><Link href="/account">My account</Link><Link href="/contact">Contact us</Link><Link href="/policies">Delivery & return policies</Link></div><div><strong>About Nexora</strong><p>Thoughtfully curated everyday tech. Built in Bangladesh.</p><Link href="/admin">Owner dashboard <ArrowUpRight size={13}/></Link></div></div><div className="retail-container retail-footer-bottom"><span>© 2026 Nexora. All rights reserved.</span><span>Connect with Modern World.</span></div></footer>
 </CartProvider></body></html>;
}
function HeaderCartCount(){return <span className="retail-cart-count"><HeaderCartValue/></span>;}
function HeaderCartValue(){return <HeaderCartNumber/>;}
function HeaderCartNumber(){return <span className="retail-cart-count-placeholder"> </span>;}
