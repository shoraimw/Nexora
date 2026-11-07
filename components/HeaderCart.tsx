"use client";
import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import {useT,useLanguage} from "@/components/LanguageProvider";
import {formatNumber} from "@/lib/i18n";
export function HeaderCart(){
  const {count}=useCart();const t=useT();const {locale}=useLanguage();
  return <Link className="retail-cart" href="/cart" aria-label={t("Shopping bag with")+" "+formatNumber(count,locale)+" "+t("items")}>
    <ShoppingBag size={19}/><span>{t("My bag")}</span><b>{formatNumber(count,locale)}</b>
  </Link>;
}
