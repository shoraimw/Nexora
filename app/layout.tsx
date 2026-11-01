import type {Metadata} from "next";
import Link from "next/link";
import {ShoppingBag,Instagram,ArrowUpRight} from "lucide-react";
import {CartProvider} from "@/components/CartProvider";
import {HeaderCart} from "@/components/HeaderCart";
import "./globals.css";
export const metadata:Metadata={title:"Nexora | Connect with Modern World",description:"Nexora gadget shopping experience — development preview, not a live store.",robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><CartProvider><header className="site-header"><div className="header-inner container"><Link className="brand" href="/" aria-label="Nexora home"><span className="brand-mark">N<span>.</span></span><span className="brand-type">nexora<small>CONNECT WITH MODERN WORLD</small></span></Link><nav className="main-nav" aria-label="Main navigation"><Link href="/#shop">Shop all</Link><Link href="/#shop">Collections</Link><Link href="/#shop">Student picks</Link><Link href="/#shop">Mystery box</Link></nav><div className="header-actions"><Link className="menu-link" href="/admin">Admin</Link><HeaderCart/></div></div></header>{children}<footer className="footer"><div className="container footer-inner"><div><div className="brand footer-brand"><span className="brand-mark">N<span>.</span></span><span className="brand-type">nexora<small>CONNECT WITH MODERN WORLD</small></span></div><p>Tech finds for curious people. Built with care in Bangladesh.</p></div><div><strong>Explore</strong><Link href="/#shop">All products</Link><Link href="/cart">Shopping bag</Link><Link href="/admin">Admin portal</Link></div><div><strong>Important</strong><p>Development preview — demo listings only.<br/>No real orders or payments are accepted.</p></div></div><div className="container footer-bottom">© 2026 Nexora · A work in progress <ArrowUpRight size={14}/></div></footer></CartProvider></body></html>;
}
