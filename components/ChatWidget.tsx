"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Bot,MessageCircle,Send,X,Trash2} from "lucide-react";
import {authHeaders,browserDb} from "@/lib/browser";
import {useConfirm} from "@/components/ConfirmProvider";
import {useT,useLanguage} from "@/components/LanguageProvider";
type LinkResult={slug:string;name:string;image?:string;variants?:{name:string;price:string;available:number}[]};
type Message={role:"assistant"|"user";text:string;links?:LinkResult[]};
export function ChatWidget(){
 const t=useT();const {locale}=useLanguage();
 const greeting:Message={role:"assistant",text:locale==="bn"?"হ্যালো! Nexora-তে স্বাগতম। গ্যাজেট, রং, দাম, স্টক, ডেলিভারি বা ওয়ারেন্টি সম্পর্কে জিজ্ঞাসা করুন। লাইভ ক্যাটালগ যুক্ত থাকলে আমি যাচাইকৃত তথ্য দেখে জানাব।":"Hi! Welcome to Nexora. Ask me about a gadget, color, price, stock, delivery or warranty. I'll check verified information when the live catalog is connected."};
 const confirmAction=useConfirm();
 const [open,setOpen]=useState(false),[input,setInput]=useState(""),[messages,setMessages]=useState<Message[]>([greeting]),[save,setSave]=useState(false),[loading,setLoading]=useState(false),[sessionId,setSessionId]=useState<string|undefined>(),[authenticated,setAuthenticated]=useState(false);
 useEffect(()=>{setMessages(current=>current.length===1&&current[0].role==="assistant"&&/^(Hi! Welcome to Nexora|হ্যালো! Nexora-তে স্বাগতম)/.test(current[0].text)?[greeting]:current);},[locale]);
 useEffect(()=>{
  try{if(localStorage.getItem("nexora_chat_consent")==="yes"){setSave(true);const local=JSON.parse(localStorage.getItem("nexora_chat_history")||"[]");if(Array.isArray(local)&&local.length)setMessages(local.slice(-40));}}
  catch{}
  const supabase=browserDb();if(supabase){void supabase.auth.getUser().then(({data})=>setAuthenticated(!!data.user));const {data}=supabase.auth.onAuthStateChange((_event,session)=>setAuthenticated(!!session?.user));return()=>data.subscription.unsubscribe();}
 },[]);
 useEffect(()=>{if(save){try{localStorage.setItem("nexora_chat_history",JSON.stringify(messages.slice(-40)));}catch{}}},[messages,save]);
 async function toggleSave(value:boolean){if(!value&&save&&!await confirmAction(t("Stop remembering this chat on this device and delete its locally saved messages?"),{title:t("Delete saved chat"),confirmLabel:t("Delete saved chat"),danger:true}))return;setSave(value);if(value)localStorage.setItem("nexora_chat_consent","yes");else{localStorage.removeItem("nexora_chat_consent");localStorage.removeItem("nexora_chat_history");}}
 async function clearHistory(){if(!await confirmAction(t("Clear the conversation currently stored in this browser?"),{title:t("Clear this conversation"),confirmLabel:t("Clear chat"),danger:true}))return;setMessages([greeting]);setSessionId(undefined);localStorage.removeItem("nexora_chat_history");}
 async function send(){
  const question=input.trim();if(!question||loading)return;
  setLoading(true);setInput("");setMessages(m=>[...m,{role:"user",text:question}]);
  try{
   const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json",...await authHeaders()},body:JSON.stringify({message:question,sessionId,locale})});
   const value=await response.json();if(!response.ok)throw Error(value.error||t("Chat unavailable"));
   if(value.sessionId)setSessionId(value.sessionId);
   setMessages(m=>[...m,{role:"assistant",text:value.answer,links:value.links}]);
  }catch(e){setMessages(m=>[...m,{role:"assistant",text:e instanceof Error?t(e.message):t("Please try again.")}]);}finally{setLoading(false);}
 }
 return <div className="chat-wrap">
 {open&&<section className="chat-panel" aria-label={t("Nexora shopping assistant")}>
  <div className="chat-heading"><div className="chat-avatar"><Bot size={20}/></div><div><strong>{t("Nexora Assist")}</strong><small>{t("Smart shopping support")}</small></div><button onClick={()=>setOpen(false)} aria-label={t("Close chat")}><X size={18}/></button></div>
  <div className="chat-scroll" role="log" aria-live="polite">{messages.map((m,i)=><div key={i} className={"message "+m.role}><p>{m.text}</p>
   {m.links?.length?<div className="chat-links">{m.links.map(p=><Link key={p.slug} href={"/product/"+p.slug} onClick={()=>setOpen(false)} className="chat-product-link">
    {authenticated&&p.image&&<img className="chat-product-image" src={p.image} alt={p.name}/>}
    <span><b>{p.name}</b>{p.variants?.length&&<small>{p.variants.map(v=>v.name+" "+v.price+(v.available>0?" · "+t("In stock"):" · "+t("Out of stock"))).join(" / ")}</small>}</span><span>↗</span>
   </Link>)}</div>:null}
  </div>)}{loading&&<span className="chat-loading">{t("Checking Nexora information…")}</span>}</div>
  <div className="chat-consent"><label><input type="checkbox" checked={save} onChange={e=>void toggleSave(e.target.checked)}/> {t("Remember on this device")}</label><button onClick={()=>void clearHistory()} aria-label={t("Delete local chat")}><Trash2 size={15}/></button></div>
  <form className="chat-input" onSubmit={e=>{e.preventDefault();void send();}}><input maxLength={300} aria-label={t("Ask Nexora")} value={input} onChange={e=>setInput(e.target.value)} placeholder={t("What gadget do you need?")}/><button disabled={!input.trim()||loading} aria-label={t("Send")}><Send size={17}/></button></form>
  <small className="chat-disclaimer">{t(authenticated?"Enable account chat history under Profile to sync across devices.":"Sign in for product images in chat and optional account history.")} {t("Don't send private payment details.")}</small>
 </section>}
 <button className="chat-toggle" aria-label={t(open?"Close assistant":"Open assistant")} onClick={()=>setOpen(o=>!o)}>{open?<X size={24}/>:<MessageCircle size={24}/>}<span>{t(open?"Close":"Need help?")}</span></button>
 </div>;
}
