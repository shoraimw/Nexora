"use client";
import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {useCart} from "@/components/CartProvider";
export function HeaderCart(){
  const {count}=useCart();
  return <Link className="retail-cart" href="/cart" aria-label={"Shopping bag with "+count+" items"}>
    <ShoppingBag size={19}/><span>My bag</span><b>{count}</b>
  </Link>;
}
