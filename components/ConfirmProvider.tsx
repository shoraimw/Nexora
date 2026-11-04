"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState} from "react";
import {AlertTriangle,Check,ShieldAlert,X} from "lucide-react";
type ConfirmOptions={title?:string;confirmLabel?:string;cancelLabel?:string;danger?:boolean};
type Pending={message:string;title:string;confirmLabel:string;cancelLabel:string;danger:boolean};
type ConfirmFn=(message:string,options?:ConfirmOptions)=>Promise<boolean>;
const ConfirmContext=createContext<ConfirmFn|null>(null);
export function ConfirmProvider({children}:{children:React.ReactNode}){
 const [pending,setPending]=useState<Pending|null>(null);const resolveRef=useRef<((value:boolean)=>void)|null>(null);
 const confirm=useCallback<ConfirmFn>((message,options={})=>new Promise(resolve=>{resolveRef.current=resolve;setPending({message,title:options.title||"Please confirm",confirmLabel:options.confirmLabel||"Continue",cancelLabel:options.cancelLabel||"Go back",danger:!!options.danger});}),[]);
 const settle=useCallback((answer:boolean)=>{const resolve=resolveRef.current;resolveRef.current=null;setPending(null);resolve?.(answer);},[]);
 const confirmButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!pending)return;const previous=document.activeElement as HTMLElement|null;confirmButton.current?.focus();const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();settle(false);}};document.addEventListener("keydown",onKey);return()=>{document.removeEventListener("keydown",onKey);previous?.focus?.();};},[pending,settle]);
 return <ConfirmContext.Provider value={confirm}>{children}{pending&&<div className="nexora-dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)settle(false);}}><section className="nexora-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="nexora-confirm-title" aria-describedby="nexora-confirm-message"><span className={"nexora-confirm-icon"+(pending.danger?" is-danger":"")}>{pending.danger?<ShieldAlert size={22}/>:<AlertTriangle size={22}/>}</span><h2 id="nexora-confirm-title">{pending.title}</h2><p id="nexora-confirm-message">{pending.message}</p><div className="nexora-confirm-actions"><button type="button" className="nexora-confirm-cancel" onClick={()=>settle(false)}>{pending.cancelLabel}</button><button ref={confirmButton} type="button" className={"nexora-confirm-accept"+(pending.danger?" is-danger":"")} onClick={()=>settle(true)}>{pending.confirmLabel}{pending.danger?<ShieldAlert size={15}/>:<Check size={15}/>}</button></div><button type="button" className="nexora-confirm-x" aria-label="Close confirmation" onClick={()=>settle(false)}><X size={17}/></button></section></div>}</ConfirmContext.Provider>;
}
export function useConfirm(){const confirm=useContext(ConfirmContext);if(!confirm)throw new Error("useConfirm must be used inside ConfirmProvider");return confirm;}
