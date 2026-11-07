"use client";
import {useT,useLanguage} from "@/components/LanguageProvider";
import {formatDate} from "@/lib/i18n";
export function LastUpdated({date="2026-11-05"}:{date?:string}){
 const t=useT();const {locale}=useLanguage();
 const parsed=new Date(date+"T00:00:00");
 const label=Number.isNaN(parsed.getTime())?date:formatDate(parsed,locale,{day:"numeric",month:"long",year:"numeric"});
 return <p className="nexora-last-updated"><time dateTime={date}>{t("Last reviewed")}: {label}</time></p>;
}
