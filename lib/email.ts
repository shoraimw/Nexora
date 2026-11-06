import "server-only";
import {db} from "@/lib/server";
import {buildInvoicePdf} from "@/lib/invoice-pdf";
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const bdt=(paisa:number)=>(Number(paisa||0)/100).toLocaleString("en-BD",{minimumFractionDigits:2,maximumFractionDigits:2});
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
   const {data:order,error:e2}=await db().from("orders").select("order_no,full_name,email,phone,address,area,district,order_status,payment_status,payment_method,total_paisa,subtotal_paisa,delivery_paisa,discount_paisa,created_at").eq("id",outbox.order_id).single();
   if(e2||!order)throw new Error("Missing order");
   const label:Record<string,string>={order_received:"Your Nexora invoice",payment_confirmed:"Payment verified",shipped:"Your parcel has been dispatched",delivered:"Your order was delivered",cancelled:"Order cancelled"};
   const heading=label[outbox.kind]||"Order update";
   const message=outbox.kind==="order_received"?"Your order has been recorded. Your invoice is attached as a PDF. Any bKash/Nagad payment remains pending until our team verifies it.":outbox.kind==="payment_confirmed"?"Our team has verified the payment.":outbox.kind==="shipped"?"Your parcel is on its way.":outbox.kind==="delivered"?"Your delivery has been marked complete.":"Your order has been cancelled. Please contact support for payment and refund questions.";
   let attachment:{name:string;content:string}|undefined;
   let invoiceRows="";
   if(outbox.kind==="order_received"){
    const {data:items,error:e3}=await db().from("order_items").select("title,sku,variant_name,quantity,unit_price_paisa").eq("order_id",outbox.order_id);
    if(e3||!items?.length)throw new Error("Invoice items could not be loaded");
    const pdf=await buildInvoicePdf(order,items);
    attachment={name:order.order_no+".pdf",content:Buffer.from(pdf).toString("base64")};
    invoiceRows=items.map((item:any)=>'<tr><td style="padding:10px 8px;border-bottom:1px solid #e8eaed">'+escape(item.title)+(item.variant_name?" · "+escape(item.variant_name):"")+'</td><td style="padding:10px 8px;text-align:center;border-bottom:1px solid #e8eaed">'+item.quantity+'</td><td style="padding:10px 8px;text-align:right;border-bottom:1px solid #e8eaed">BDT '+bdt(item.unit_price_paisa*item.quantity)+'</td></tr>').join("");
   }
   const htmlContent=outbox.kind==="order_received"
    ?'<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:28px;color:#20252b"><div style="font-size:25px;font-weight:800;letter-spacing:2px;color:#f45b2a">NEXORA</div><h1 style="font-size:23px;margin:24px 0 8px">Thank you for your order!</h1><p>Hello '+escape(order.full_name)+', your order has been received. Your official order invoice is attached to this email as a PDF.</p><div style="background:#f5f6f7;border-radius:12px;padding:16px;margin:20px 0"><b>Order '+escape(order.order_no)+'</b><br><span style="color:#606873">Order status: '+escape(order.order_status.replace(/_/g," "))+'</span><br><span style="color:#606873">Payment status: '+escape(order.payment_status.replace(/_/g," "))+'</span></div><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding:8px">Item</th><th style="padding:8px">Qty</th><th style="text-align:right;padding:8px">Amount</th></tr></thead><tbody>'+invoiceRows+'</tbody></table><table style="width:100%;max-width:320px;margin:18px 0 18px auto;font-size:14px"><tr><td style="padding:5px">Subtotal</td><td style="text-align:right">BDT '+bdt(order.subtotal_paisa)+'</td></tr><tr><td style="padding:5px">Delivery</td><td style="text-align:right">BDT '+bdt(order.delivery_paisa)+'</td></tr><tr><td style="padding:5px">Discount</td><td style="text-align:right">−BDT '+bdt(order.discount_paisa)+'</td></tr><tr><td style="padding:9px 5px;border-top:1px solid #ddd;font-weight:bold">Total</td><td style="text-align:right;border-top:1px solid #ddd;font-weight:bold">BDT '+bdt(order.total_paisa)+'</td></tr></table><p style="padding:12px 14px;background:#fff5eb;border-radius:8px;font-size:13px">'+(order.payment_status==="pending_verification"?"Your payment is pending manual verification. Submitting a transaction ID does not mean payment has been confirmed.":"Payment status: "+escape(order.payment_status.replace(/_/g," ")))+'</p><p style="font-size:13px;color:#68717b">Delivery address: '+escape([order.address,order.area,order.district].filter(Boolean).join(", "))+'</p><p>Keep this email for your records. Thank you for shopping with Nexora.</p></div>'
    :'<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#272422"><h1>Nexora</h1><h2>'+escape(heading)+'</h2><p>Hello '+escape(order.full_name)+',</p><p>'+escape(message)+'</p><p><b>Order:</b> '+escape(order.order_no)+'</p><p><b>Order status:</b> '+escape(order.order_status)+'</p><p><b>Payment status:</b> '+escape(order.payment_status)+'</p><p>Thank you for shopping with Nexora.</p></div>';
   const payload:{sender:{email:string;name:string};to:{email:string;name:string}[];subject:string;htmlContent:string;attachment?:{name:string;content:string}[]}={
    sender:{email:from,name:"Nexora"},to:[{email:outbox.recipient||order.email,name:order.full_name}],
    subject:"Nexora | "+(outbox.kind==="order_received"?"Invoice":"Order update")+" · "+order.order_no,
    htmlContent
   };
   if(attachment)payload.attachment=[attachment];
   const res=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"Content-Type":"application/json","api-key":key},body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});
   if(!res.ok)throw Error("Email provider rejected request ("+res.status+")");
   await db().from("outbound_emails").update({status:"sent",sent_at:new Date().toISOString(),last_error:null,locked_at:null}).eq("id",id);
   sent++;
  }catch(error){
   await db().from("outbound_emails").update({status:"failed",locked_at:null,last_error:error instanceof Error?error.message.slice(0,300):"Email error"}).eq("id",id);
  }
 }
 return {sent,disabled:false};
}
