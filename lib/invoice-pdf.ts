import {PDFDocument,StandardFonts,rgb} from "pdf-lib";

export type InvoiceOrder = {
 order_no:string;created_at:string;full_name:string;email:string;phone:string;
 address:string;area?:string|null;district:string;payment_method:string;payment_status:string;order_status:string;
 subtotal_paisa:number;delivery_paisa:number;discount_paisa:number;total_paisa:number;
};
export type InvoiceItem = {title:string;sku?:string;variant_name:string;quantity:number;unit_price_paisa:number};

const plain=(value:unknown)=>String(value??"").replace(/[^\x20-\x7e]/g," ").replace(/\s+/g," ").trim();
const money=(paisa:number)=>(Number(paisa||0)/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
function wrap(value:string,max:number){
 const words=plain(value).split(" ").filter(Boolean),lines:string[]=[];let line="";
 for(const word of words){const next=line?line+" "+word:word;if(next.length>max&&line){lines.push(line);line=word;}else line=next;}
 if(line)lines.push(line);return lines.length?lines:["—"];
}
export async function buildInvoicePdf(order:InvoiceOrder,items:InvoiceItem[]):Promise<Uint8Array>{
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const ink=rgb(.12,.16,.2),muted=rgb(.38,.42,.46),accent=rgb(.96,.36,.12),rule=rgb(.88,.9,.92);
 let page=doc.addPage([595.28,841.89]),y=0;
 const draw=(text:string,x:number,at:number,size=10,strong=false,color=ink)=>page.drawText(plain(text).slice(0,110),{x,y:at,size,font:strong?bold:font,color});
 const line=(x1:number,y1:number,x2:number,y2:number)=>page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:.7,color:rule});
 const date=new Date(order.created_at);
 const dateLabel=Number.isNaN(date.getTime())?"—":date.toISOString().slice(0,10);
 const method=plain(order.payment_method).toUpperCase();
 const payment=plain(order.payment_status).replace(/_/g," ").toUpperCase();
 const status=plain(order.order_status).replace(/_/g," ").toUpperCase();
 const tableHead=(continued=false)=>{
  draw(continued?"ITEMS (CONTINUED)":"ITEM",42,y,9,true,muted);
  draw("QTY",350,y,9,true,muted);draw("UNIT (BDT)",397,y,9,true,muted);draw("TOTAL (BDT)",493,y,9,true,muted);
  y-=12;line(42,y,553,y);y-=18;
 };
 const startContinuation=()=>{
  page=doc.addPage([595.28,841.89]);y=790;
  draw("NEXORA",42,y,20,true,accent);draw("INVOICE CONTINUED",405,y+2,10,true);
  y-=28;draw("Invoice: "+order.order_no,42,y,9,false,muted);y-=25;tableHead(true);
 };
 draw("NEXORA",42,790,25,true,accent);draw("INVOICE",455,794,13,true);
 draw("Invoice number",42,754,8,true,muted);draw(order.order_no,42,737,12,true);
 draw("Issue date",300,754,8,true,muted);draw(dateLabel,300,737,11,true);
 line(42,718,553,718);
 draw("BILL TO",42,696,9,true,muted);draw("ORDER & PAYMENT",340,696,9,true,muted);
 draw(order.full_name,42,677,12,true);draw("Email: "+order.email,42,660,9);
 draw("Phone: "+order.phone,42,644,9);
 const address=[order.address,order.area,order.district].filter(Boolean).join(", ");
 const addressLines=wrap(address,48);let customerY=628;
 for(const part of addressLines.slice(0,3)){draw(part,42,customerY,9);customerY-=13;}
 draw("Payment method: "+method,340,677,9);draw("Payment status: "+payment,340,660,9);
 draw("Order status: "+status,340,644,9);draw("Currency: BDT",340,628,9);
 y=Math.min(customerY,604)-15;line(42,y,553,y);y-=24;tableHead();
 for(const item of items){
  const description=wrap(item.title+(item.variant_name?" — "+item.variant_name:""),43);
  const rowHeight=Math.max(25,description.length*13+8);
  if(y-rowHeight<125){startContinuation();}
  description.forEach((part,index)=>draw(part,42,y-index*13,9));
  draw(String(item.quantity),352,y,9);
  draw(money(item.unit_price_paisa),400,y,9);
  draw(money(item.unit_price_paisa*item.quantity),493,y,9);
  y-=rowHeight;line(42,y+5,553,y+5);y-=8;
 }
 if(y<190){startContinuation();}
 y-=12;
 const totalRows=[
  ["Subtotal",order.subtotal_paisa,false],
  ["Delivery",order.delivery_paisa,false],
  ["Discount",-order.discount_paisa,false]
 ] as const;
 for(const [label,value] of totalRows){draw(label,360,y,9);draw((value<0?"−":"")+money(Math.abs(value)),493,y,9);y-=18;}
 line(350,y+7,553,y+7);y-=15;
 draw("TOTAL DUE (BDT)",350,y,11,true,accent);draw(money(order.total_paisa),493,y,12,true,accent);y-=34;
 if(order.payment_status==="pending_verification"){
  draw("Payment is pending manual verification. A submitted transaction ID is not proof of payment.",42,Math.max(y,70),8,false,muted);
 }else{
  draw("Payment status: "+payment,42,Math.max(y,70),8,false,muted);
 }
 for(const pg of doc.getPages())pg.drawText("Nexora · Thank you for shopping with us",{x:42,y:24,size:8,font,color:muted});
 return doc.save();
}
