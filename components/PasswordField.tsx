"use client";
import {useState} from "react";
import {Eye,EyeOff} from "lucide-react";
import {useT} from "@/components/LanguageProvider";
type Props={label:string;value:string;onChange:(value:string)=>void;required?:boolean;minLength?:number;autoComplete?:"current-password"|"new-password"};
export function PasswordField({label,value,onChange,required=true,minLength,autoComplete="current-password"}:Props){const t=useT();const [visible,setVisible]=useState(false);return <label className="nexora-password-label">{label}<span className="nexora-password-wrap"><input type={visible?"text":"password"} value={value} onChange={event=>onChange(event.target.value)} required={required} minLength={minLength} autoComplete={autoComplete}/><button type="button" className="nexora-password-toggle" onClick={()=>setVisible(v=>!v)} aria-label={t(visible?"Hide password":"Show password")} aria-pressed={visible}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>;}
