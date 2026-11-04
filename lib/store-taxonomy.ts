export type StoreSubcategory={name:string;slug:string;hint:string};
export type StoreCategory={name:string;slug:string;hint:string;description:string;subcategories:StoreSubcategory[]};

export const storeCategories:StoreCategory[]=[
 {name:"Phones",slug:"phones",hint:"Smartphones & essentials",description:"Explore phones and everyday mobile technology.",subcategories:[
  {name:"Apple iPhone",slug:"apple-iphone",hint:"iPhone models and accessories"},
  {name:"Samsung Phones",slug:"samsung-phones",hint:"Galaxy smartphones"},
  {name:"Google Pixel",slug:"google-pixel",hint:"Pixel phones"},
  {name:"Other Smartphones",slug:"other-smartphones",hint:"More Android phones"}
 ]},
 {name:"Mac",slug:"mac",hint:"MacBook & Apple computers",description:"Mac computers and the accessories that make them more useful.",subcategories:[
  {name:"MacBook",slug:"macbook",hint:"MacBook Air and Pro"},
  {name:"iMac",slug:"imac",hint:"Desktop Mac"},
  {name:"Mac mini",slug:"mac-mini",hint:"Compact desktop"},
  {name:"Mac Accessories",slug:"mac-accessories",hint:"Everyday Mac essentials"}
 ]},
 {name:"Phone Accessories",slug:"phone-accessories",hint:"Power, charging & storage",description:"Useful accessories to power, protect and expand your phone.",subcategories:[
  {name:"Power Banks",slug:"power-banks",hint:"Portable charging"},
  {name:"Chargers & Adapters",slug:"chargers-adapters",hint:"Wall chargers and adapters"},
  {name:"Memory Cards",slug:"memory-cards",hint:"Extra storage"}
 ]},
 {name:"Tablets",slug:"tablets",hint:"iPad & Android tablets",description:"Tablets and practical accessories for work, study and entertainment.",subcategories:[
  {name:"Apple iPad",slug:"apple-ipad",hint:"iPad models"},
  {name:"Samsung Galaxy Tab",slug:"samsung-galaxy-tab",hint:"Galaxy tablets"},
  {name:"Android Tablets",slug:"android-tablets",hint:"More Android tablets"},
  {name:"Tablet Accessories",slug:"tablet-accessories",hint:"Cases, keyboards and more"}
 ]},
 {name:"Cases & Protectors",slug:"cases-protectors",hint:"Cases for your devices",description:"Cases, covers and screen protection for your everyday devices.",subcategories:[
  {name:"Apple Cases",slug:"apple-cases",hint:"iPhone and Apple device cases"},
  {name:"Samsung Cases",slug:"samsung-cases",hint:"Galaxy cases"},
  {name:"Google Pixel Cases",slug:"google-pixel-cases",hint:"Pixel protection"},
  {name:"Earbuds Cases",slug:"earbuds-cases",hint:"Protective earbud covers"},
  {name:"Screen Protectors",slug:"screen-protectors",hint:"Display protection"}
 ]},
 {name:"Watches",slug:"watches",hint:"Wrist watches & smart wearables",description:"Classic wrist watches, smart watches, straps and useful watch accessories.",subcategories:[
  {name:"Wrist Watches",slug:"wrist-watches",hint:"Classic everyday watches"},
  {name:"Smart Watches",slug:"smart-watches",hint:"Connected watches"},
  {name:"Smart Watch Brands",slug:"smart-watch-brands",hint:"Browse by watch brand"},
  {name:"Watch Straps",slug:"watch-straps",hint:"Change your look"},
  {name:"Watch Accessories",slug:"watch-accessories",hint:"Chargers and add-ons"}
 ]},
 {name:"Headphones & Speakers",slug:"headphones-speakers",hint:"Listen your way",description:"Earbuds, headphones, speakers and audio gear for every day.",subcategories:[
  {name:"Earbuds",slug:"earbuds",hint:"True wireless earbuds"},
  {name:"Speakers",slug:"speakers",hint:"Portable and desktop speakers"},
  {name:"Headphones",slug:"headphones",hint:"Over-ear and on-ear audio"},
  {name:"Earphones",slug:"earphones",hint:"Wired listening"},
  {name:"Neckbands",slug:"neckbands",hint:"Wireless neckband audio"},
  {name:"Microphones",slug:"microphones",hint:"Voice and recording gear"}
 ]},
 {name:"PC Accessories",slug:"pc-accessories",hint:"Build a better setup",description:"Computer accessories, peripherals and storage for work, study and play.",subcategories:[
  {name:"Keyboards",slug:"keyboards",hint:"Everyday and mechanical keyboards"},
  {name:"Mouse",slug:"mouse",hint:"Wireless and wired mice"},
  {name:"Stylus",slug:"stylus",hint:"Digital pens"},
  {name:"Pen Drives",slug:"pen-drives",hint:"Portable USB storage"},
  {name:"Webcams",slug:"webcams",hint:"Cameras for calls and streaming"},
  {name:"Bags & Sleeves",slug:"bags-sleeves",hint:"Carry and protect your devices"},
  {name:"Storage",slug:"storage",hint:"Storage solutions"},
  {name:"Hard Drives",slug:"hard-drives",hint:"External hard drives and SSDs"},
  {name:"Desk Setup",slug:"desk-setup",hint:"Make your workspace yours"}
 ]},
 {name:"Camera & Networking",slug:"camera-networking",hint:"Capture & connect",description:"Cameras, routers and networking equipment for home and work.",subcategories:[
  {name:"Cameras",slug:"cameras",hint:"Capture everyday moments"},
  {name:"Routers",slug:"routers",hint:"Home and office Wi-Fi"},
  {name:"TP-Link Routers",slug:"tp-link-routers",hint:"TP-Link networking"},
  {name:"Network Accessories",slug:"network-accessories",hint:"Adapters and connectivity"}
 ]},
 {name:"Gadgets",slug:"gadgets",hint:"Clever everyday tech",description:"Small useful gadgets and lifestyle technology for everyday life.",subcategories:[
  {name:"Daily Lifestyle",slug:"daily-lifestyle",hint:"Useful everyday finds"},
  {name:"Charging Fans",slug:"charging-fans",hint:"Portable rechargeable fans"},
  {name:"TV Boxes",slug:"tv-boxes",hint:"Smart TV and streaming boxes"}
 ]},
 {name:"Gaming",slug:"gaming",hint:"Gear up and play",description:"Gaming consoles, controllers and peripherals.",subcategories:[
  {name:"Gaming Consoles",slug:"gaming-consoles",hint:"Gaming systems"},
  {name:"Gamepads",slug:"gamepads",hint:"Controllers and gamepads"},
  {name:"Gaming Keyboards",slug:"gaming-keyboards",hint:"Keyboards for gaming"},
  {name:"Gaming Mouse",slug:"gaming-mouse",hint:"Precision gaming mice"},
  {name:"Gaming Headphones",slug:"gaming-headphones",hint:"Immersive gaming audio"},
  {name:"Gaming Earphones",slug:"gaming-earphones",hint:"Compact gaming audio"}
 ]},
 {name:"Drone",slug:"drone",hint:"Explore from above",description:"Drones, aerial cameras and accessories.",subcategories:[
  {name:"Camera Drones",slug:"camera-drones",hint:"Aerial photography drones"},
  {name:"Mini Drones",slug:"mini-drones",hint:"Compact beginner drones"},
  {name:"Drone Accessories",slug:"drone-accessories",hint:"Batteries, propellers and more"}
 ]}
];

export const collectionLinks=[
 {name:"Student Picks",slug:"student-picks",href:"/shop?category=Student%20Picks",hint:"Budget-friendly finds"},
 {name:"Mystery Box",slug:"mystery-box",href:"/shop?category=Mystery%20Box",hint:"A little surprise"}
];
export function categoryBySlug(slug:string){return storeCategories.find(category=>category.slug===slug);}
export function subcategoryBySlug(category:StoreCategory,slug:string){return category.subcategories.find(subcategory=>subcategory.slug===slug);}
export function categoryHref(category:StoreCategory,subcategory?:StoreSubcategory){return subcategory?"/category/"+category.slug+"/"+subcategory.slug:"/category/"+category.slug;}
