"use client";
import Link from "next/link";
import {FaqAccordion} from "@/components/FaqAccordion";
import {LastUpdated} from "@/components/LastUpdated";
import {useT} from "@/components/LanguageProvider";
export default function Contact(){const t=useT();return <main className="container customer-page prose-page"><p className="eyebrow">{t("NEED A HAND?")}</p><h1>{t("We're here to help.")}</h1><p>{t("Ask Nexora Assist about the current catalog, warranties and delivery. For payment disputes, refunds, or details the chatbot cannot verify, contact the official Nexora support channel shown on your order email or our verified social pages.")}</p><p>{t("Never share OTPs, passwords or full payment credentials in chat.")}</p><Link className="primary-button" href="/track">{t("Track an order")}</Link><FaqAccordion/><LastUpdated date="2026-11-05"/></main>;}