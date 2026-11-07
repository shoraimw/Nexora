"use client";

import {Languages} from "lucide-react";
import {useLanguage} from "@/components/LanguageProvider";

export function LanguageSwitcher(){
 const {locale,setLocale}=useLanguage();
 return <label className="nexora-language-switcher">
  <Languages size={15} aria-hidden="true"/>
  <span className="nexora-language-label">{locale==="bn"?"ভাষা":"Language"}</span>
  <select value={locale} onChange={event=>setLocale(event.target.value==="bn"?"bn":"en")} aria-label={locale==="bn"?"ভাষা পরিবর্তন করুন":"Change website language"}>
   <option value="en">English</option>
   <option value="bn">বাংলা</option>
  </select>
 </label>;
}
