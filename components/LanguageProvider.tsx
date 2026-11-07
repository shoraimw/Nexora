"use client";

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {translate,type Locale} from "@/lib/i18n";

type LanguageContextValue={locale:Locale;setLocale:(locale:Locale)=>void;t:(source:string)=>string};
const LanguageContext=createContext<LanguageContextValue|null>(null);

export function LanguageProvider({children,initialLocale="en"}:{children:React.ReactNode;initialLocale?:Locale}){
 const router=useRouter();
 const [locale,setLocaleState]=useState<Locale>(initialLocale);
 const setLocale=useCallback((next:Locale)=>{
  setLocaleState(next);
  document.documentElement.lang=next;
  document.documentElement.dataset.locale=next;
  try{
   document.cookie="nexora_locale="+next+"; path=/; max-age=31536000; samesite=lax";
   localStorage.setItem("nexora_locale",next);
  }catch{}
  router.refresh();
 },[router]);
 useEffect(()=>{
  document.documentElement.lang=locale;
  document.documentElement.dataset.locale=locale;
 },[locale]);
 const t=useCallback((source:string)=>translate(locale,source),[locale]);
 const value=useMemo(()=>({locale,setLocale,t}),[locale,setLocale,t]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(){
 const value=useContext(LanguageContext);
 if(!value)throw new Error("useLanguage must be used inside LanguageProvider");
 return value;
}

export function useT(){
 return useLanguage().t;
}
