"use client";
import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {useState} from "react";
import {useCart} from "@/components/CartProvider";
export function AddProductButton({id}:{id:string}){const [added,setAdded]=useState(false);const {add}=useCart();return <div className="buy-actions"><button className="primary-button" onClick={()=>{add(id);setAdded(true);}}><ShoppingBag size={18}/>{added?"Added to bag ✓":"Add to demo bag"}</button><Link className="outline-btn" href="/cart">View bag</Link></div>;}
