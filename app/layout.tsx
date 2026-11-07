import type {Metadata} from "next";
import {cookies} from "next/headers";
import type {Locale} from "@/lib/i18n";
import {translate} from "@/lib/i18n";
import Link from "next/link";
import {ArrowUpRight,UserRound,Store,PackageSearch,LifeBuoy} from "lucide-react";
import {CartProvider} from "@/components/CartProvider";
import {HeaderCart} from "@/components/HeaderCart";
import {OffersNavLink} from "@/components/OffersNavLink";
import {ConfirmProvider} from "@/components/ConfirmProvider";
import {MobileMenu} from "@/components/MobileMenu";
import {RetailCategoryNav} from "@/components/RetailCategoryNav";
import {SiteSearch} from "@/components/SiteSearch";
import {NewsletterSignup} from "@/components/NewsletterSignup";
import {storeCategories,categoryHref,collectionLinks} from "@/lib/store-taxonomy";
import {ThemeToggle,SiteExperience} from "@/components/SiteExperience";
import {LanguageProvider} from "@/components/LanguageProvider";
import {LanguageSwitcher} from "@/components/LanguageSwitcher";
import "./language.css";
import "./globals.css";
import "./commerce.css";
import "./mobile.css";
import "./brand-refresh.css";
import "./retail-store.css";
import "./filter-ui.css";
import "./logo-brand.css";
import "./retail-interactions.css";
import "./offers.css";
import "./gadget-layout.css";
import "./category-experience.css";
import "./site-experience.css";
import "./print.css";
import "./startech-inspired.css";
export const metadata:Metadata={
 title:{default:"Nexora | Connect with Modern World",template:"%s | Nexora"},
 description:"Discover gadgets, tech accessories and unique everyday finds with Nexora.",
 icons:{icon:[{url:"/favicon.png",type:"image/png",sizes:"96x96"}],shortcut:"/favicon.png",apple:"/favicon.png"},
 robots:{index:true,follow:true}
};
export default async function RootLayout({children}:{children:React.ReactNode}){
 const locale:Locale=(await cookies()).get("nexora_locale")?.value==="bn"?"bn":"en";
 return <html lang={locale} data-locale={locale}><body><LanguageProvider initialLocale={locale}><a className="skip-link" href="#main-content">{translate(locale,"Skip to content")}</a><ConfirmProvider><CartProvider>
  <div className="nexora-utility-bar"><div className="retail-container nexora-utility-inner"><span>{translate(locale,"Everyday technology, made easier.")}</span><div><Link href="/track"><PackageSearch size={13}/>{translate(locale,"Track order")}</Link><Link href="/contact"><LifeBuoy size={13}/>{translate(locale,"Help & support")}</Link><Link href="/policies">{translate(locale,"Delivery & returns")}</Link><LanguageSwitcher/></div></div></div>
  <header className="retail-site-header">
   <div className="retail-container retail-header-main">
    <MobileMenu/>
    <Link className="retail-brand retail-brand-header" href="/" aria-label="Nexora home"><img className="retail-brand-image nexora-logo-light-theme" src="/brand/nexora-logo-dark.png" alt="Nexora" width={280} height={160} fetchPriority="high"/><img className="retail-brand-image nexora-logo-dark-theme" src="/brand/nexora-logo-light.png" alt="" width={280} height={160} aria-hidden="true"/></Link>
    <SiteSearch/>
    <div className="retail-header-actions"><ThemeToggle/><OffersNavLink/><Link href="/account"><UserRound size={19}/><span>{translate(locale,"Account")}</span></Link><HeaderCart/></div>
   </div>
   <RetailCategoryNav/>
  </header>
  <nav className="retail-mobile-nav" aria-label={translate(locale,"Mobile navigation")}><Link href="/shop"><Store size={19}/>{translate(locale,"Shop")}</Link><Link href="/track"><PackageSearch size={19}/>{translate(locale,"Orders")}</Link><OffersNavLink compact/><Link href="/account"><UserRound size={19}/>{translate(locale,"Account")}</Link><Link href="/contact"><LifeBuoy size={19}/>{translate(locale,"Help")}</Link></nav>
  <div id="main-content" tabIndex={-1}>{children}</div>
  <footer className="retail-footer"><div className="retail-container retail-footer-main"><div className="retail-footer-brand"><Link className="retail-brand retail-brand-footer" href="/" aria-label="Nexora home"><img className="retail-brand-image" src="/brand/nexora-logo-light.png" alt="Nexora" width={280} height={160} loading="lazy"/></Link><p>{translate(locale,"Gadgets, accessories and little upgrades for everyday life.")}</p></div><div><strong>{translate(locale,"Shop")}</strong><Link href="/shop">{translate(locale,"All products")}</Link>{storeCategories.slice(0,6).map(category=><Link key={category.slug} href={categoryHref(category)}>{translate(locale,category.name)}</Link>)}<Link href={collectionLinks[0].href}>{translate(locale,"Student picks")}</Link><Link href={collectionLinks[1].href}>{translate(locale,"Mystery box")}</Link></div><div><strong>{translate(locale,"Customer care")}</strong><Link href="/track">{translate(locale,"Track an order")}</Link><Link href="/account">{translate(locale,"My account")}</Link><Link href="/contact">{translate(locale,"Contact us")}</Link><Link href="/policies">{translate(locale,"Delivery & returns")}</Link></div><div><strong>{translate(locale,"About Nexora")}</strong><p>{translate(locale,"Thoughtfully curated everyday tech. Built in Bangladesh.")}</p><Link href="/admin">{translate(locale,"Owner dashboard")} <ArrowUpRight size={13}/></Link></div></div><div className="retail-container"><NewsletterSignup/></div><div className="retail-container retail-footer-bottom"><span>{translate(locale,"© 2026 Nexora. All rights reserved.")}</span><span>{translate(locale,"Connect with Modern World.")}</span></div></footer>
 </CartProvider><SiteExperience/></ConfirmProvider></LanguageProvider></body></html>;
}
