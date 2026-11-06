"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
type Item={id:string;quantity:number};
type Context={items:Item[];add:(id:string)=>void;remove:(id:string)=>void;change:(id:string,quantity:number)=>void;clear:()=>void;count:number};
const CartContext=createContext<Context|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){
  const [items,setItems]=useState<Item[]>([]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("nexora_demo_cart")||"[]") as Item[];if(Array.isArray(saved))setItems(saved.filter(i=>typeof i.id==="string"&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=20).slice(0,30));}catch{}setReady(true);},[]);
  useEffect(()=>{if(ready){try{localStorage.setItem("nexora_demo_cart",JSON.stringify(items));}catch{}}},[items,ready]);
  const add=useCallback((id:string)=>setItems(old=>{const match=old.find(i=>i.id===id);return match?old.map(i=>i.id===id?{...i,quantity:Math.min(20,i.quantity+1)}:i):[...old,{id,quantity:1}];}),[]);
  const remove=useCallback((id:string)=>setItems(old=>old.filter(i=>i.id!==id)),[]);
  const change=useCallback((id:string,quantity:number)=>setItems(old=>old.map(i=>i.id===id?{...i,quantity:Math.max(1,Math.min(20,quantity))}:i)),[]);
  const clear=useCallback(()=>setItems([]),[]);
  const value=useMemo(()=>({items,add,remove,change,clear,count:items.reduce((n,i)=>n+i.quantity,0)}),[items,add,remove,change,clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const state=useContext(CartContext);if(!state)throw new Error("Missing CartProvider");return state;}
