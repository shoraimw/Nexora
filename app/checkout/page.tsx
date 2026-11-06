"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,AlertTriangle,ShieldCheck} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import {authHeaders} from "@/lib/browser";
export default function Checkout(){
 const {items,clear}=useCart();
 const [enabled,setEnabled]=useState(false),[configured,setConfigured]=useState(false),[settings,setSettings]=useState({bkashEnabled:false,bkashNumber:"",nagadEnabled:false,nagadNumber:"",codEnabled:false,deliveryNotice:"Delivery fee confirmed separately.",deliveryEstimate:"ETA confirmed by support."}),[method,setMethod]=useState<"bkash"|"nagad"|"cod">("cod"),[loading,setLoading]=useState(false),[message,setMessage]=useState(""),[order,setOrder]=useState<{orderNo:string;trackingToken:string}|null>(null),[key,setKey]=useState("");
 const [quote,setQuote]=useState<{subtotalPaisa:number;deliveryPaisa:number;discountPaisa:number;totalPaisa:number;deliveryEta:string}|null>(null),[quoteError,setQuoteError]=useState("");
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[accountEmail,setAccountEmail]=useState(""),[phone,setPhone]=useState(""),[district,setDistrict]=useState(""),[area,setArea]=useState(""),[address,setAddress]=useState(""),[notes,setNotes]=useState(""),[coupon,setCoupon]=useState(""),[transactionId,setTransactionId]=useState(""),[sender,setSender]=useState("");
 useEffect(()=>{setKey(crypto.randomUUID());fetch("/api/health").then(r=>r.json()).then(x=>{setConfigured(x.mode==="configured");setEnabled(!!x.checkoutEnabled);}).catch(()=>{});fetch("/api/settings").then(r=>r.json()).then(x=>setSettings(v=>({...v,...x.store}))).catch(()=>{});void authHeaders().then(headers=>{if(!headers.Authorization)return;return fetch("/api/account",{headers}).then(r=>r.ok?r.json():null).then(data=>{if(data?.emailVerified&&typeof data.email==="string"){setAccountEmail(data.email);setEmail(data.email);}});}).catch(()=>{});},[]);
 useEffect(()=>{
  if(!configured||!district.trim()||items.length===0){setQuote(null);return;}
  let cancelled=false;const t=setTimeout(async()=>{
   try{const r=await fetch("/api/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({district,coupon,items:items.map(i=>({variant_id:i.id,quantity:i.quantity}))})});const data=await r.json();if(cancelled)return;if(!r.ok){setQuote(null);setQuoteError(data.error||"Could not calculate");}else{setQuote(data);setQuoteError("");}}
   catch{if(!cancelled){setQuote(null);setQuoteError("Quote unavailable");}}
  },450);
  return()=>{cancelled=true;clearTimeout(t);};
 },[configured,district,coupon,items]);
 async function place(e:React.FormEvent){e.preventDefault();if(!enabled||loading||!key)return;setLoading(true);setMessage("");
  try{
   const headers=await authHeaders();const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify({
    idempotencyKey:key,customer:{name,email,phone,district,area,address,notes},items:items.map(x=>({variant_id:x.id,quantity:x.quantity})),paymentMethod:method,transactionId:transactionId||undefined,senderNumber:sender||undefined,coupon:coupon||undefined
   })});const data=await r.json();if(!r.ok)throw Error(data.error||"Checkout failed");
   setOrder({orderNo:data.orderNo,trackingToken:data.trackingToken});
   clear();
   try{localStorage.setItem("nexora_order_"+data.orderNo,data.trackingToken);}catch{}
  }catch(error){setMessage(error instanceof Error?error.message:"Could not place order");}finally{setLoading(false);}
 }
 if(order)return <main className="container checkout-page"><div className="checkout-success"><ShieldCheck size={52}/><h1>Order received!</h1><p>Order <b>{order.orderNo}</b> has been recorded. Payment claims will be checked manually. Check your email for updates if email delivery is configured.</p><p>Keep your secure order tracking token to retrieve this order on another device:</p><code>{order.trackingToken}</code><Link className="primary-button" href={"/track?orderNo="+encodeURIComponent(order.orderNo)}>View order status</Link></div></main>;
 return <main className="container checkout-page"><Link className="back-link" href="/cart"><ArrowLeft size={16}/> Back to bag</Link><p className="eyebrow">NEXORA / SECURE CHECKOUT</p><h1>Checkout, made simple.</h1>{!enabled?<div className="preview-banner"><AlertTriangle size={20}/><div><b>Checkout is in preview mode</b><p>{configured?"The Nexora owners have not enabled live order submission yet.":"The secure backend and business payment details have not been configured yet."} No personal or payment information is collected, and no order can be placed.</p><Link className="outline-btn" href="/shop">Continue browsing</Link></div></div>:items.length===0?<div className="empty-state"><h2>Your bag is empty.</h2><p>Add a product before starting checkout.</p><Link className="primary-button" href="/shop">Browse collection</Link></div>:<form onSubmit={place} className="checkout-form checkout-large"><h2>01 / Delivery information</h2><div className="form-grid">
 {[[name,setName,"Full name"],[email,setEmail,"Email address"],[phone,setPhone,"Mobile number"],[district,setDistrict,"District"],[area,setArea,"Area / Upazila"],[address,setAddress,"Full delivery address"]].map(([value,setValue,label])=><label key={label as string}>{label as string}<input type={label==="Email address"?"email":"text"} autoComplete={label==="Email address"?"email":"off"} readOnly={label==="Email address"&&!!accountEmail} required={label!=="Area / Upazila"} value={value as string} onChange={e=>(setValue as (v:string)=>void)(e.target.value)} placeholder={label as string}/>{label==="Email address"&&accountEmail&&<small>Your invoice will be sent to this verified account email.</small>}</label>)}
 <label className="wide">Delivery instructions (optional)<textarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={500}/></label></div>
 <h2>02 / Choose payment</h2><div className="payment-options">{(["bkash","nagad","cod"] as const).map(m=><button key={m} type="button" disabled={enabled&&!(m==="bkash"?settings.bkashEnabled:m==="nagad"?settings.nagadEnabled:settings.codEnabled)} className={method===m?"active":""} onClick={()=>setMethod(m)}>{m==="cod"?"Cash on Delivery":m==="bkash"?"bKash":"Nagad"}</button>)}</div>
 {method!=="cod"&&<div className="payment-claim"><p><strong>Manual verification only.</strong> Pay only to the official receiving number published by Nexora. {method==="bkash"?(settings.bkashEnabled?"Official bKash number: "+settings.bkashNumber:"bKash payments are not yet enabled."):(settings.nagadEnabled?"Official Nagad number: "+settings.nagadNumber:"Nagad payments are not yet enabled.")} Do not pay until you confirm the official recipient.</p><label>Transaction ID<input value={transactionId} onChange={e=>setTransactionId(e.target.value)} placeholder="Transaction ID" required minLength={5}/></label><label>Sender mobile (optional)<input value={sender} onChange={e=>setSender(e.target.value)}/></label></div>}
 <p className="checkout-warning"><strong>Delivery:</strong> {settings.deliveryNotice} {settings.deliveryEstimate}</p><h2>03 / Discount</h2><label className="coupon-field">Coupon code (optional)<input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="e.g. NEXORA10"/></label>
 {configured&&<div className="checkout-quote"><h2>Your order total</h2>
 {quote?<><p>Items: BDT {(quote.subtotalPaisa/100).toLocaleString("en-BD")}</p><p>Delivery: BDT {(quote.deliveryPaisa/100).toLocaleString("en-BD")}</p><p>Discount: −BDT {(quote.discountPaisa/100).toLocaleString("en-BD")}</p><strong>Payable: BDT {(quote.totalPaisa/100).toLocaleString("en-BD")}</strong><small>Estimated shipping: {quote.deliveryEta}</small></>:<p>{quoteError||"Enter a delivery district to calculate your full total."}</p>}</div>}
 <p className="checkout-warning">Final total is recalculated from official Nexora prices on the server. Submit does not automatically verify bKash/Nagad payment.</p>
 {message&&<p role="alert" className="form-error">{message}</p>}
 <button disabled={!enabled||!quote||loading||items.length===0||(method==="bkash"&&!settings.bkashEnabled)||(method==="nagad"&&!settings.nagadEnabled)||(method==="cod"&&!settings.codEnabled)} className="primary-button">{loading?"Placing order…":"Place order"} </button>
 </form>}</main>;
}