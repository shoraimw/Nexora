import type {Metadata} from "next";
import Link from "next/link";
import {ArrowUpRight,Search,UserRound,Store,PackageSearch,LifeBuoy} from "lucide-react";
import {CartProvider} from "@/components/CartProvider";
import {HeaderCart} from "@/components/HeaderCart";
import {ShopCategoryMenu} from "@/components/ShopCategoryMenu";
import {OffersNavLink} from "@/components/OffersNavLink";
import "./globals.css";
import "./commerce.css";
import "./mobile.css";
import "./brand-refresh.css";
import "./retail-store.css";
import "./filter-ui.css";
import "./logo-brand.css";
import "./retail-interactions.css";
import "./offers.css";
export const metadata:Metadata={
 title:{default:"Nexora | Connect with Modern World",template:"%s | Nexora"},
 description:"Discover gadgets, tech accessories and unique everyday finds with Nexora.",
 icons:{icon:[{url:"/favicon.png",type:"image/png",sizes:"96x96"}],shortcut:"/favicon.png",apple:"/favicon.png"},
 robots:{index:false,follow:false}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><CartProvider>
  <header className="retail-site-header">
   <div className="retail-container retail-header-main">
    <Link className="retail-brand retail-brand-header" href="/" aria-label="Nexora home"><img className="retail-brand-image" src="/brand/nexora-logo-dark.png" alt="Nexora" width={280} height={160} fetchPriority="high"/></Link>
    <form className="retail-search" action="/shop" method="get"><Search size={19}/><input name="q" type="search" placeholder="Search for products, brands and more..." aria-label="Search Nexora"/><button type="submit">Search</button></form>
    <div className="retail-header-actions"><OffersNavLink/><Link href="/account"><UserRound size={19}/><span>Account</span></Link><HeaderCart/></div>
   </div>
   <nav className="retail-nav" aria-label="Main navigation"><div className="retail-container retail-nav-inner">
    <ShopCategoryMenu/>
    <Link href="/">Home</Link><Link href="/shop">All products</Link><Link href="/shop?category=Audio">Audio</Link><Link href="/shop?category=Wearables">Wearables</Link><Link href="/shop?category=Accessories">Accessories</Link><Link href="/shop?category=Student%20Picks">Student picks</Link><Link href="/shop?category=Mystery%20Box">Mystery box</Link><Link href="/contact">Help & support</Link>
   </div></nav>
  </header>
  <nav className="retail-mobile-nav" aria-label="Mobile navigation"><Link href="/shop"><Store size={19}/>Shop</Link><Link href="/track"><PackageSearch size={19}/>Orders</Link><OffersNavLink compact/><Link href="/account"><UserRound size={19}/>Account</Link><Link href="/contact"><LifeBuoy size={19}/>Help</Link></nav>
  {children}
  <footer className="retail-footer"><div className="retail-container retail-footer-main"><div className="retail-footer-brand"><Link className="retail-brand retail-brand-footer" href="/" aria-label="Nexora home"><img className="retail-brand-image" src="/brand/nexora-logo-light.png" alt="Nexora" width={280} height={160} loading="lazy"/></Link><p>Gadgets, accessories and little upgrades for everyday life.</p></div><div><strong>Shop</strong><Link href="/shop">All products</Link><Link href="/shop?category=Audio">Audio</Link><Link href="/shop?category=Wearables">Wearables</Link><Link href="/shop?category=Accessories">Accessories</Link><Link href="/shop?category=Student%20Picks">Student picks</Link></div><div><strong>Customer care</strong><Link href="/track">Track an order</Link><Link href="/account">My account</Link><Link href="/contact">Contact us</Link><Link href="/policies">Delivery & return policies</Link></div><div><strong>About Nexora</strong><p>Thoughtfully curated everyday tech. Built in Bangladesh.</p><Link href="/admin">Owner dashboard <ArrowUpRight size={13}/></Link></div></div><div className="retail-container retail-footer-bottom"><span>© 2026 Nexora. All rights reserved.</span><span>Connect with Modern World.</span></div></footer>
 </CartProvider></body></html>;
}
