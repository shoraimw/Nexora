export type Product = {
  id: string; slug: string; name: string; category: string; price: number;
  previous?: number; description: string; features: string[]; variants: string[];
  art: string; accent: string; tag?: string; student?: boolean;
};
// All listings are demo placeholders. They are NOT confirmed Nexora inventory.
export const products: Product[] = [
  {id:"NX-D01",slug:"aero-buds",name:"Aero Buds",category:"Audio",price:1290,previous:1590,description:"Pocket-sized wireless listening, imagined for the Nexora demo catalog.",features:["Wireless listening","Compact charging case","Everyday portability"],variants:["Pearl","Graphite"],art:"♫",accent:"peach",tag:"Demo deal",student:true},
  {id:"NX-D02",slug:"orbit-watch",name:"Orbit Smartwatch",category:"Wearables",price:2450,description:"A clean everyday smartwatch concept with a lightweight silhouette.",features:["Digital watch face","Notification concept","Comfort strap"],variants:["Black","Sand"],art:"◷",accent:"lilac",tag:"Trending"},
  {id:"NX-D03",slug:"glow-speaker",name:"Glow Mini Speaker",category:"Audio",price:1850,description:"A colorful portable speaker concept for your desk or weekend.",features:["Portable design","Wireless concept","Compact form"],variants:["Midnight","Cream"],art:"◉",accent:"blue",student:true},
  {id:"NX-D04",slug:"pixel-desk-lamp",name:"Pixel Desk Light",category:"Desk Setup",price:990,previous:1190,description:"Soft lighting and a playful desk aesthetic for the demo storefront.",features:["Compact footprint","Decorative lighting","Desk-friendly"],variants:["White"],art:"✦",accent:"mint",tag:"Student pick",student:true},
  {id:"NX-D05",slug:"cozy-plush",name:"Cozy Cloud Plush",category:"Plushies",price:690,description:"An adorable gift-ready plush concept featured in the Nexora preview.",features:["Soft-touch concept","Gift idea","Playful decor"],variants:["Cloud","Peach"],art:"☁",accent:"pink"},
  {id:"NX-D06",slug:"charge-kit",name:"Everyday Charging Kit",category:"Accessories",price:790,description:"Keep essential charging accessories in one minimal kit.",features:["Travel-ready","Organizer-friendly","Everyday carry"],variants:["Black","White"],art:"↯",accent:"yellow",student:true},
  {id:"NX-D07",slug:"mystery-box",name:"Nexora Mystery Box",category:"Mystery Box",price:999,description:"An example of a future transparent mystery-box promotion; not purchasable.",features:["Contents and odds must be disclosed","No live sale yet"],variants:["Demo only"],art:"✧",accent:"lilac",tag:"Concept"},
  {id:"NX-D08",slug:"study-combo",name:"Student Setup Combo",category:"Student Picks",price:1590,description:"A proposed budget-conscious gadget bundle for students.",features:["Curated essentials","Bundle concept","Student-focused"],variants:["Demo only"],art:"▦",accent:"mint",student:true}
];
export const categories = ["All","Audio","Wearables","Accessories","Desk Setup","Student Picks","Plushies","Mystery Box"];
export function currency(value:number){return "৳" + value.toLocaleString("en-BD");}
export function bySlug(slug:string){return products.find(p=>p.slug===slug);}
