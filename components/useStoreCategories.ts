"use client";
import {useEffect,useState} from "react";
import {storeCategories,type StoreCategory} from "@/lib/store-taxonomy";

export function useStoreCategories(){
 const [categories,setCategories]=useState<StoreCategory[]>(storeCategories);
 useEffect(()=>{
  let active=true;
  fetch("/api/categories",{cache:"no-store"})
   .then(response=>response.ok?response.json():Promise.reject())
   .then(data=>{
    if(!active)return;
    if(data.live===false){setCategories(storeCategories);return;}
    if(data.live===true&&Array.isArray(data.categories)){setCategories(data.categories as StoreCategory[]);return;}
    setCategories([]);
   })
   .catch(()=>{if(active)setCategories([]);});
  return()=>{active=false;};
 },[]);
 return categories;
}
