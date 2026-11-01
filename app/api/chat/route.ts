import {z} from "zod";
import {configured,db,readBody,bad,ok,userFromRequest,sameOrigin,price} from "@/lib/server";
import {rateAllow} from "@/lib/rate";
import {liveCatalog} from "@/lib/catalog-live";
import {products} from "@/lib/catalog";
export const dynamic="force-dynamic";
const input=z.object({message:z.string().trim().min(2).max(300),sessionId:z.string().uuid().optional()});
export async function POST(req:Request){
 if(!sameOrigin(req))return bad("Origin rejected",403);
 let value:unknown;try{value=await readBody(req,1800);}catch{return bad("Invalid message");}
 const parsed=input.safeParse(value);if(!parsed.success)return bad("Message must be 2–300 characters");
 if(configured&&!await rateAllow(req,"chat",45,60))return bad("Chat limit reached. Please try later.",429);
 const message=parsed.data.message.toLowerCase();
 const user=await userFromRequest(req);
 const isLive=configured;
 const catalog=isLive?await liveCatalog().catch(()=>[]):[];
 const tokens=(message.match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>x.length>=3&&!["price","have","with","your","available","colour","color","কত","আছে","দাম","কি","তোমাদের"].includes(x));
 const found=catalog.map(p=>({p,score:tokens.reduce((sum,word)=>sum+(p.title.toLowerCase().includes(word)?4:(p.brand+" "+p.category+" "+p.description).toLowerCase().includes(word)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
 let answer="I can help with products, prices, colors, warranty, delivery and shopping. Please tell me what gadget you're looking for.";
 let links:{slug:string;name:string;image?:string;variants?:{name:string;price:string;available:number}[]}[]=[];
 const asksDelivery=/deliver|courier|shipping|ডেলিভারি|কুরিয়ার|পাঠাও/i.test(message);
 const asksPay=/bkash|nagad|cod|payment|বিকাশ|নগদ|পেমেন্ট/i.test(message);
 if(asksDelivery){answer="Nexora plans Steadfast deliveries. Exact delivery estimates and fees are shown only when configured for your area; none are confirmed in this preview.";}
 else if(asksPay){answer="Nexora supports plans for manual bKash/Nagad transaction-ID claims and cash on delivery. A transaction ID is never proof of successful payment until our team verifies it.";}
 else if(!isLive){const samples=products.filter(p=>tokens.some(t=>p.name.toLowerCase().includes(t))).slice(0,3);answer="Nexora is in preview mode. Prices and stock shown here are illustrative—not confirmed inventory. "+(samples.length?"Sample matches: "+samples.map(x=>x.name).join(", "):"Browse our demonstration catalog to see the design.");links=samples.map(p=>({slug:p.slug,name:p.name}));}
 else if(found.length){links=found.map(({p})=>({slug:p.slug,name:p.title,image:user?p.images[0]?.url:undefined,variants:p.variants.map(v=>({name:v.color||v.name,price:price(v.price_paisa),available:v.available}))}));answer="Here are verified catalog matches: "+found.map(({p})=>p.title+" — "+p.variants.map(v=>(v.color||v.name)+": "+price(v.price_paisa)+" ("+(v.available>0?v.available+" in stock":"out of stock")+")").join("; ")).join(" | ")+". Tap a product to open the exact page.";}
 else {const {data:faqs}=await db().from("faq_entries").select("question,answer").eq("active",true).limit(40);const match=(faqs||[]).find(f=>tokens.some(w=>f.question.toLowerCase().includes(w)));answer=match?.answer||"I could not find a matching product or official answer. Please contact Nexora support; I won't invent a price or stock detail.";}
 // Optional free Gemini only receives a catalog-derived intent, never the raw message or customer information.
 if(found.length&&process.env.GEMINI_FREE_ENABLED==="true"&&process.env.GEMINI_API_KEY&&isLive){
  try{
   const verified=found.map(({p})=>({name:p.title,variants:p.variants.map(v=>({color:v.color||v.name,price:price(v.price_paisa),available:v.available}))}));
   const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(process.env.GEMINI_MODEL||"gemini-2.5-flash-lite")+":generateContent?key="+encodeURIComponent(process.env.GEMINI_API_KEY),{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({systemInstruction:{parts:[{text:"You are a Nexora shop assistant. Rephrase grounded product listings concisely in friendly English. Do not invent information. Do not add products, prices, colors, warranty, delivery or stock not present in supplied JSON."}]},contents:[{parts:[{text:"Summarize these verified matching products only: "+JSON.stringify(verified).slice(0,4500)}]}],generationConfig:{temperature:0,maxOutputTokens:200}}),signal:AbortSignal.timeout(4500)
   });
   if(response.ok){const result=await response.json();const output=result.candidates?.[0]?.content?.parts?.[0]?.text;if(typeof output==="string"&&output.length<1200)answer=output;}
  }catch{} // Always fall back to exact database response without any charge.
 }
 let sessionId:string|undefined;
 if(user&&configured){
  const {data:profile}=await db().from("profiles").select("chat_history_opt_in").eq("user_id",user.id).maybeSingle();
  if(profile?.chat_history_opt_in){
   let session=parsed.data.sessionId;
   if(session){const {data}=await db().from("chat_sessions").select("id").eq("user_id",user.id).eq("id",session).maybeSingle();if(!data)session=undefined;}
   if(!session){const {data}=await db().from("chat_sessions").insert({user_id:user.id,title:parsed.data.message.slice(0,60)}).select("id").single();session=data?.id;}
   if(session){sessionId=session;await db().from("chat_messages").insert([{session_id:session,role:"user",body:parsed.data.message},{session_id:session,role:"assistant",body:answer.slice(0,2000)}]);}
  }
 }
 return ok({answer,links,sessionId,live:isLive});
}
