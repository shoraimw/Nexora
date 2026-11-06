import {buildInvoicePdf} from "@/lib/invoice-pdf";
import {configured,db,bad,readBody,tokenMatches,userFromRequest,sameOrigin} from "@/lib/server";
import {z} from "zod";
import {rateAllow} from "@/lib/rate";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!configured)return bad("Invoices unavailable",503);
 if(!sameOrigin(request))return bad("Origin rejected",403);
 if(!await rateAllow(request,"invoice",15,60))return bad("Too many invoice requests",429);
 let input:unknown;try{input=await readBody(request,1800);}catch{return bad("Invalid request");}
 const parsed=z.object({orderNo:z.string().regex(/^NX-[0-9]{8}-[A-F0-9]{8}$/),token:z.string().length(64).optional()}).safeParse(input);
 if(!parsed.success)return bad("Invalid request");
 const {data:order}=await db().from("orders").select("*").eq("order_no",parsed.data.orderNo).maybeSingle();
 if(!order)return bad("Invoice not found",404);
 const u=await userFromRequest(request);
 if(!((u&&order.customer_id===u.id)||(parsed.data.token&&tokenMatches(parsed.data.token,order.tracking_token_hash))))return bad("Invoice not found",404);
 const {data:items,error}=await db().from("order_items").select("title,sku,quantity,unit_price_paisa,variant_name").eq("order_id",order.id);
 if(error||!items?.length)return bad("Invoice details are unavailable",503);
 const pdf=await buildInvoicePdf(order,items);
 return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="'+order.order_no+'.pdf"',"Cache-Control":"no-store"}});
}
