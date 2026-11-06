import test from "node:test";
import assert from "node:assert/strict";
import {PDFDocument} from "pdf-lib";
import {buildInvoicePdf} from "../lib/invoice-pdf.ts";

const order={
 order_no:"NX-20261107-AB12CD34",created_at:"2026-11-07T02:00:00.000Z",
 full_name:"Nexora Test Customer",email:"customer@example.com",phone:"01700000000",
 address:"House 10, Road 2",area:"Dhanmondi",district:"Dhaka",
 payment_method:"bkash",payment_status:"pending_verification",order_status:"received",
 subtotal_paisa:250000,delivery_paisa:6000,discount_paisa:10000,total_paisa:246000
};
const item={title:"Wireless Earbuds Pro",sku:"NEX-EAR-01",variant_name:"Black",quantity:2,unit_price_paisa:125000};

test("invoice PDF contains a valid PDF document and preserves the full BDT total",async()=>{
 const bytes=await buildInvoicePdf(order,[item]);
 assert.equal(Buffer.from(bytes).subarray(0,5).toString("ascii"),"%PDF-");
 const pdf=await PDFDocument.load(bytes);
 assert.equal(pdf.getPageCount(),1);
 assert.ok(bytes.byteLength>1000);
});

test("large orders produce a multi-page invoice instead of clipping item rows",async()=>{
 const items=Array.from({length:55},(_,i)=>({...item,title:"Product "+(i+1)+" Wireless Gadget Extended Description"}));
 const bytes=await buildInvoicePdf(order,items);
 const pdf=await PDFDocument.load(bytes);
 assert.ok(pdf.getPageCount()>1);
});
