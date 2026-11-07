"use client";
import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import {useT} from "@/components/LanguageProvider";
export function HeaderCart(){
  const {count}=useCart();const t=useT();
  return <Link className="retail-cart" href="/cart" aria-label={t("Shopping bag with")+" "+count+" "+t("items")}>
    <ShoppingBag size={19}/><span>{t("My bag")}</span><b>{count}</b>
  </Link>;
}
