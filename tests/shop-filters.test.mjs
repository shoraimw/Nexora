import test from "node:test";
import assert from "node:assert/strict";
import {connectionFlags,priceBoundBdt,selectMatchingProducts,initialFilters,distinctBrands,discountPercent,countAppliedFilters} from "../lib/shop-filters.ts";
const sample=[
 {id:"a",name:"Demo Wireless Headset",category:"Audio",brand:"Sample Audio",connectionType:"Wireless",pricePaisa:160000,compareAtPaisa:200000,available:true,featured:true,createdAt:"2026-10-10"},
 {id:"b",name:"Demo Wired Headset",category:"Audio",brand:"Sample Audio",connectionType:"Wired",pricePaisa:65000,available:true,createdAt:"2026-11-01"},
 {id:"c",name:"Desk Lamp",category:"Desk Setup",brand:"Sample Desk",connectionType:"USB-C charging",pricePaisa:90000,available:false,createdAt:"2026-09-01"},
 {id:"d",name:"Hybrid Audio",category:"Audio",brand:"Sample Hybrid",connectionType:"Wireless & Wired",pricePaisa:199000,available:true,createdAt:"2026-09-02"}
];
const withFilter=(patch)=>selectMatchingProducts(sample,{...initialFilters,...patch}).map(x=>x.id);
test("wireless / wired classification uses explicit metadata",()=>{
 assert.deepEqual(connectionFlags("Bluetooth, USB-C charging"),{wireless:true,wired:false});
 assert.deepEqual(connectionFlags("Wireless & Wired"),{wireless:true,wired:true});
 assert.deepEqual(connectionFlags("USB-C charging"),{wireless:false,wired:false});
});
test("stack brand, category, connection and price filters without mutating source",()=>{
 const snapshot=sample.map(x=>x.id);
 assert.deepEqual(withFilter({category:"Audio",brand:"sample audio",connection:"wireless"}),["a"]);
 assert.deepEqual(withFilter({category:"Audio",connection:"wired",maxPriceBdt:"1000"}),["b"]);
 assert.deepEqual(withFilter({connection:"wireless"}),["a","d"]);
 assert.deepEqual(withFilter({connection:"wired"}),["b","d"]);
 assert.deepEqual(sample.map(x=>x.id),snapshot);
});
test("stock, discount and sorting filters",()=>{
 assert.deepEqual(withFilter({inStockOnly:true,sort:"low"}),["b","a","d"]);
 assert.deepEqual(withFilter({onSaleOnly:true}),["a"]);
 assert.deepEqual(withFilter({sort:"newest"}),["b","a","d","c"]);
 assert.equal(discountPercent(sample[0]),20);
 assert.equal(discountPercent(sample[1]),0);
});
test("safe prices, distinct brands and filter counts",()=>{
 assert.equal(priceBoundBdt("1500.50"),150050);
 assert.equal(priceBoundBdt("-1"),null);
 assert.equal(priceBoundBdt("1e5"),null);
 assert.equal(priceBoundBdt("999999999"),null);
 assert.deepEqual(distinctBrands(sample),["Sample Audio","Sample Desk","Sample Hybrid"]);
 assert.equal(countAppliedFilters({...initialFilters,category:"Audio",connection:"wired",inStockOnly:true}),3);
});
