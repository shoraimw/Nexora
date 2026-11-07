"use client";
import {ChevronDown} from "lucide-react";
import {useT} from "@/components/LanguageProvider";
const questions=[
 {question:"Can I order without creating an account?",answer:"Yes. Nexora is designed to support guest shopping. You can browse products and place an order without registering. An account is optional for saved details and order history."},
 {question:"How do bKash and Nagad payments work?",answer:"Where enabled, you pay to the verified receiving number shown at checkout and submit the transaction ID. Nexora checks the payment manually. An order-received email means the request was received; it is not proof that payment has been verified."},
 {question:"Is Cash on Delivery available?",answer:"Cash on Delivery appears only when the Nexora owners enable it for your delivery area. If it is not shown at checkout, it is not currently available for that order."},
 {question:"How long does delivery take?",answer:"The checkout page or support team will show the current estimate for your district. Estimates can change with courier conditions and are not guaranteed delivery dates."},
 {question:"How do I check a product's warranty?",answer:"Open the product details page and read its warranty or guarantee information before ordering. Warranty coverage varies by product and supplier."},
 {question:"Can Nexora Assist help me choose a gadget?",answer:"Yes. The shopping assistant can help search the catalog and explain verified product details, variants, availability and listed prices. Never share passwords, OTPs or full payment credentials in chat."}
];
export function FaqAccordion(){const t=useT();return <section className="nexora-faq" aria-labelledby="nexora-faq-title"><span className="retail-eyebrow">{t("QUICK ANSWERS")}</span><h2 id="nexora-faq-title">{t("Frequently asked questions")}</h2><div className="nexora-faq-list">{questions.map((item,index)=><details key={item.question} className="nexora-faq-item" open={index===0}><summary><span>{t(item.question)}</span><ChevronDown size={18}/></summary><p>{t(item.answer)}</p></details>)}</div></section>;}
