import type {Metadata} from "next";
import Link from "next/link";
import {ArrowUpRight,Search,UserRound,Headphones,Gift,GraduationCap,Store,PackageSearch,LifeBuoy} from "lucide-react";
import {CartProvider} from "@/components/CartProvider";
import {HeaderCart} from "@/components/HeaderCart";
import "./globals.css";
import "./commerce.css";
import "./mobile.css";
import "./brand-refresh.css";
export const metadata:Metadata={
 title:{default:"Nexora | Connect with Modern World",template:"%s | Nexora"},
 description:"Discover gadgets, tech accessories and unique everyday finds with Nexora.",
 robots:{index:false,follow:false}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><CartProvider>
  <div className="utility-bar"><div className="container utility-inner"><span>Thoughtful gadgets for everyday life · Made for curious minds</span><div className="utility-links"><Link href="/track">Track an order</Link><Link href="/contact">Help centre</Link></div></div></div>
  <header className="site-header">
   <div className="header-main container">
    <Link className="brand" href="/" aria-label="Nexora home"><span className="brand-mark">N<span>.</span></span><span className="brand-type">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link>
    <form className="header-search" action="/shop" method="get"><Search size={17}/><input name="q" type="search" placeholder="Search gadgets, accessories and more..." aria-label="Search Nexora"/><button type="submit">Search</button></form>
    <div className="header-actions"><Link className="header-account" href="/account"><UserRound size={18}/> Account</Link><HeaderCart/></div>
   </div>
   <nav className="category-nav" aria-label="Shop categories"><div className="container category-nav-inner">
    <Link href="/shop">All products</Link><Link href="/shop?category=Audio">Audio</Link><Link href="/shop?category=Wearables">Wearables</Link><Link href="/shop?category=Accessories">Accessories</Link><Link href="/shop?category=Student%20Picks"><GraduationCap size={14}/> Student picks</Link><Link href="/shop?category=Mystery%20Box"><Gift size={14}/> Mystery box</Link><Link href="/contact"><Headphones size={14}/> Support</Link>
   </div></nav>
  </header>
  <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><Link href="/shop"><Store size={19}/> Shop</Link><Link href="/track"><PackageSearch size={19}/> Orders</Link><Link href="/account"><UserRound size={19}/> Account</Link><Link href="/contact"><LifeBuoy size={19}/> Help</Link></nav>
  {children}
  <footer className="footer"><div className="container footer-inner"><div><Link href="/" className="brand footer-brand"><span className="brand-mark">N<span>.</span></span><span className="brand-type">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link><p>Thoughtfully curated gadget finds. Built in Bangladesh.</p></div><div><strong>Explore</strong><Link href="/shop">All products</Link><Link href="/shop?category=Student%20Picks">Student picks</Link><Link href="/shop?category=Mystery%20Box">Mystery box</Link><Link href="/cart">Your bag</Link></div><div><strong>Support</strong><Link href="/track">Track an order</Link><Link href="/contact">Get help</Link><Link href="/policies">Delivery, returns & privacy</Link><Link href="/admin">Owner dashboard</Link><p>For payment safety, never share OTPs or PINs.</p></div></div><div className="container footer-bottom">© 2026 Nexora · Connect with Modern World <ArrowUpRight size={14}/></div></footer>
 </CartProvider></body></html>;
}