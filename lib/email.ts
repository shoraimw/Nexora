import "server-only";
import {db} from "@/lib/server";
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
export async function deliverPendingEmails(max=3){
 const key=process.env.BREVO_API_KEY,from=process.env.BREVO_SENDER_EMAIL;
 if(!key||!from)return {sent:0,disabled:true};
 let sent=0;
 for(let n=0;n<Math.min(max,10);n++){
  const {data:id,error:claimError}=await db().rpc("nexora_claim_email");
  if(claimError||!id)break;
  try{
   const {data:outbox,error:e1}=await db().from("outbound_emails").select("*").eq("id",id).single();
   if(e1||!outbox)throw new Error("Missing message");
   const {data:order,error:e2}=await db().from("orders").select("order_no,full_name,email,order_status,payment_status,total_paisa").eq("id",outbox.order_id).single();
   if(e2||!order)throw new Error("Missing order");
   const label:Record<string,string>={order_received:"We received your order",payment_confirmed:"Payment verified",shipped:"Your parcel has been dispatched",delivered:"Your order was delivered",cancelled:"Order cancelled"};
   const heading=label[outbox.kind]||"Order update";
   const message=outbox.kind==="order_received"?"Your order was recorded. Any bKash/Nagad payment is awaiting manual verification; submitting a transaction ID does not confirm payment.":outbox.kind==="payment_confirmed"?"Our team has verified the payment.":outbox.kind==="shipped"?"Your parcel is on its way.":outbox.kind==="delivered"?"Your delivery has been marked complete.":"Your order has been cancelled. Please contact support for payment and refund questions.";
   const res=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"Content-Type":"application/json","api-key":key},body:JSON.stringify({
    sender:{email:from,name:"Nexora"},to:[{email:order.email,name:order.full_name}],subject:"Nexora | "+heading+" · "+order.order_no,
    htmlContent:'<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#272422"><h1>Nexora</h1><h2>'+escape(heading)+'</h2><p>Hello '+escape(order.full_name)+',</p><p>'+escape(message)+'</p><p><b>Order:</b> '+escape(order.order_no)+'</p><p><b>Order status:</b> '+escape(order.order_status)+'</p><p><b>Payment status:</b> '+escape(order.payment_status)+'</p><p>Thank you for shopping with Nexora.</p></div>'
   }),signal:AbortSignal.timeout(8000)});
   if(!res.ok)throw Error("Email provider rejected request ("+res.status+")");
   await db().from("outbound_emails").update({status:"sent",sent_at:new Date().toISOString(),last_error:null,locked_at:null}).eq("id",id);
   sent++;
  }catch(error){await db().from("outbound_emails").update({status:"failed",locked_at:null,last_error:error instanceof Error?error.message.slice(0,300):"Email error"}).eq("id",id);}
 }
 return {sent,disabled:false};
}
