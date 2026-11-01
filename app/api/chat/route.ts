import {NextResponse} from "next/server";
import {products,currency} from "@/lib/catalog";
export async function POST(request:Request){
  let payload:unknown;
  try {
    if(Number(request.headers.get("content-length")||0)>2048)return NextResponse.json({error:"Too large"},{status:413});
    payload=await request.json();
  } catch {return NextResponse.json({error:"Invalid JSON"},{status:400});}
  if(!payload||typeof payload!=="object"||!("message" in payload)||typeof payload.message!=="string")return NextResponse.json({error:"Message required"},{status:400});
  const message=payload.message.trim().slice(0,280).toLowerCase();
  if(message.length<2)return NextResponse.json({error:"Message too short"},{status:400});
  const words=(message.match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>x.length>2&&!["with","have","the","any","product","tomader","ache","price","কত","আছে","দাম"].includes(x));
  const hits=products.map(p=>({p,score:words.reduce((score,w)=>score+(p.name.toLowerCase().includes(w)?3:(p.name+" "+p.category+" "+p.description).toLowerCase().includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
  let answer="This is a demo shopping assistant. Try searching earbuds, smartwatch, speaker, desk light, student combo or mystery box. Real Nexora inventory is not connected.";
  let links:{slug:string;name:string}[]=[];
  if(/deliver|shipping|কুরিয়ার|ডেলিভারি|steadfast/i.test(message))answer="We plan to use courier delivery, including Steadfast. Delivery charges, delivery times and order tracking are not live yet.";
  else if(/bkash|nagad|cod|cash on delivery|বিকাশ|নগদ|পেমেন্ট/i.test(message))answer="Manual bKash, Nagad and cash on delivery are planned. This preview does not accept orders or payments.";
  else if(/warrant|refund|return|ওয়ারেন্টি|রিটার্ন/i.test(message))answer="Warranty, refund and return details will be published after verification by Nexora's owners.";
  else if(/airpods|apple|iphone|এয়ারপড|অ্যাপল/i.test(message))answer="I can't verify any Apple product's price, colors or stock. The live Nexora catalog is not connected.";
  else if(hits.length){answer="Sample matches: "+hits.map(x=>x.p.name+" ("+currency(x.p.price)+" demo price)").join(", ")+". These are illustrative, not real stock. Use the links below to view each demo product.";links=hits.map(x=>({slug:x.p.slug,name:x.p.name}));}
  return NextResponse.json({answer,links},{headers:{"Cache-Control":"no-store"}});
}
