"use client";
import {useEffect,useState} from "react";
import {storeCategories,type StoreCategory} from "@/lib/store-taxonomy";

let cached:StoreCategory[]|null=null;
let pending:Promise<StoreCategory[]>|null=null;

async function loadCategories():Promise<StoreCategory[]>{
 if(cached)return cached;
 if(!pending){
  pending=fetch("/api/categories",{cache:"no-store"})
   .then(response=>response.ok?response.json():Promise.reject())
   .then(data=>{
    if(data.live===false)return storeCategories;
    if(data.live===true&&Array.isArray(data.categories))return data.categories as StoreCategory[];
    return [];
   })
   .catch(()=>[])
   .then(categories=>{cached=categories;return categories;})
   .finally(()=>{pending=null;});
 }
 return pending;
}

export function useStoreCategories(){
 const [categories,setCategories]=useState<StoreCategory[]>(storeCategories);
 useEffect(()=>{
  let active=true;
  const refresh=()=>{cached=null;pending=null;void loadCategories().then(value=>{if(active)setCategories(value);});};
  void loadCategories().then(value=>{if(active)setCategories(value);});
  window.addEventListener("nexora:categories-updated",refresh);
  return()=>{active=false;window.removeEventListener("nexora:categories-updated",refresh);};
 },[]);
 return categories;
}
