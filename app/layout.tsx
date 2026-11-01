import type {Metadata} from "next";
import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {CartProvider} from "@/components/CartProvider";
import {HeaderCart} from "@/components/HeaderCart";
import "./globals.css";
import "./commerce.css";
export const metadata:Metadata={
 title:{default:"Nexora | Connect with Modern World",template:"%s | Nexora"},
 description:"Discover gadgets, tech accessories and unique everyday finds with Nexora.",
 robots:{index:false,follow:false}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><CartProvider>
  <header className="site-header"><div className="header-inner container"><Link className="brand" href="/" aria-label="Nexora home"><span className="brand-mark">N<span>.</span></span><span className="brand-type">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link>
   <nav className="main-nav" aria-label="Main navigation"><Link href="/shop">Shop all</Link><Link href="/shop">Gadgets</Link><Link href="/track">Track order</Link><Link href="/contact">Support</Link></nav>
   <div className="header-actions"><Link className="menu-link" href="/account">Account</Link><Link className="menu-link" href="/admin">Owners</Link><HeaderCart/></div>
  </div></header>
  {children}
  <footer className="footer"><div className="container footer-inner"><div><Link href="/" className="brand footer-brand"><span className="brand-mark">N<span>.</span></span><span className="brand-type">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link><p>Thoughtfully curated gadget finds. Built in Bangladesh.</p></div><div><strong>Explore</strong><Link href="/shop">All products</Link><Link href="/cart">Your bag</Link><Link href="/track">Track order</Link><Link href="/account">My account</Link></div><div><strong>Support</strong><Link href="/contact">Get help</Link><Link href="/policies">Delivery, returns & privacy</Link><Link href="/admin">Owner dashboard</Link><p>Secure manual payment review. Never share OTPs.</p></div></div><div className="container footer-bottom">© 2026 Nexora · Connect with Modern World <ArrowUpRight size={14}/></div></footer>
 </CartProvider></body></html>;
}