"use client";
import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {useCart} from "@/components/CartProvider";
export function HeaderCart(){const {count}=useCart();return <Link className="cart-link" href="/cart" aria-label={"Shopping bag with "+count+" demo items}><ShoppingBag size={21}/><span>{count}</span></Link>;}
