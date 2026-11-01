import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import {configured,db,bad,readBody,tokenHash,userFromRequest,sameOrigin} from "@/lib/server";
import {z} from "zod";
export async function POST(request:Request){
 if(!configured)return bad("Invoices unavailable",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 let input:unknown;try{input=await readBody(request,1800);}catch{return bad("Invalid request");}
 const parsed=z.object({orderNo:z.string().min(8).max(35),token:z.string().length(64).optional()}).safeParse(input);
 if(!parsed.success)return bad("Invalid request");
 const {data:order}=await db().from("orders").select("*").eq("order_no",parsed.data.orderNo).maybeSingle();
 if(!order)return bad("Invoice not found",404);
 const u=await userFromRequest(request);
 if(!((u&&order.customer_id===u.id)||(parsed.data.token&&tokenHash(parsed.data.token)===order.tracking_token_hash)))return bad("Invoice not found",404);
 const {data:items}=await db().from("order_items").select("title,quantity,unit_price_paisa,variant_name").eq("order_id",order.id);
 const doc=await PDFDocument.create(),page=doc.addPage([595,842]),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const draw=(t:string,x:number,y:number,size=11,b=false)=>page.drawText(t.replace(/[^\x20-\x7e]/g,"?").slice(0,92),{x,y,size,font:b?bold:font,color:rgb(.16,.16,.17)});
 draw("NEXORA",42,785,26,true);draw("ORDER INVOICE",390,790,14,true);
 draw("Order: "+order.order_no,42,750,11,true);draw("Date: "+new Date(order.created_at).toISOString().slice(0,10),42,730);
 draw("Customer: "+order.full_name,42,700);draw("Mobile: "+order.phone,42,680);draw("Email: "+order.email,42,660);
 draw("Delivery: "+order.address+", "+order.district,42,640);
 draw("Payment: "+order.payment_method.toUpperCase()+" / "+order.payment_status,42,610);
 draw("Item",42,570,11,true);draw("Qty",350,570,11,true);draw("BDT",440,570,11,true);
 let y=548;for(const item of(items||[]).slice(0,24)){draw(item.title+" - "+item.variant_name,42,y,10);draw(String(item.quantity),355,y,10);draw((item.unit_price_paisa*item.quantity/100).toFixed(2),440,y,10);y-=20;}
 draw("Subtotal: BDT "+(order.subtotal_paisa/100).toFixed(2),300,Math.min(y-35,100),11,true);
 draw("Discount: BDT "+(order.discount_paisa/100).toFixed(2),300,Math.min(y-54,81));
 draw("TOTAL: BDT "+(order.total_paisa/100).toFixed(2),300,Math.min(y-74,60),14,true);
 draw("Generated electronically. Payment verification status shown above.",42,35,9);
 const pdf=await doc.save();
 return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="'+order.order_no+'.pdf"',"Cache-Control":"no-store"}});
}
