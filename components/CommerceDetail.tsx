"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ShoppingBag,ArrowLeft,Truck,ShieldCheck,Star,CheckCircle2,Send} from "lucide-react";
import {useCart} from "@/components/CartProvider";
import {authHeaders,browserDb} from "@/lib/browser";
import type {LiveProduct} from "@/lib/catalog-live";
const money=(v:number)=>"৳"+(v/100).toLocaleString("en-BD",{maximumFractionDigits:2});
type Review={id:string;rating:number;title:string;body:string;verified_purchase:boolean;created_at:string};
type ReviewPayload={count:number;average:number;reviews:Review[];canReview:boolean;hasReviewed:boolean;signedIn:boolean;emailVerified:boolean};
function StarDisplay({value}:{value:number}){
 return <span className="detail-stars" role="img" aria-label={value.toFixed(1)+" out of 5 stars"}>{[1,2,3,4,5].map(n=><Star key={n} size={15} fill={n<=Math.round(value)?"currentColor":"none"}/>)}</span>;
}
export function CommerceDetail({product:p}:{product:LiveProduct}){
 const [index,setIndex]=useState(0);
 const [selected,setSelected]=useState(p.variants.find(x=>x.available>0)?.id||p.variants[0]?.id||"");
 const [reviewData,setReviewData]=useState<ReviewPayload>({count:0,average:0,reviews:[],canReview:false,hasReviewed:false,signedIn:false,emailVerified:false});
 const [reviewLoading,setReviewLoading]=useState(true);
 const [reviewError,setReviewError]=useState("");
 const [reviewMessage,setReviewMessage]=useState("");
 const [reviewRating,setReviewRating]=useState(5);
 const [reviewTitle,setReviewTitle]=useState("");
 const [reviewBody,setReviewBody]=useState("");
 const [reviewSubmitting,setReviewSubmitting]=useState(false);
 const v=p.variants.find(x=>x.id===selected),{add}=useCart();
 async function refreshReviews(){
  setReviewLoading(true);setReviewError("");
  try{
   const response=await fetch("/api/reviews?productId="+encodeURIComponent(p.id),{headers:await authHeaders(),cache:"no-store"});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||"Customer reviews are temporarily unavailable.");
   setReviewData({count:Number(data.count||0),average:Number(data.average||0),reviews:Array.isArray(data.reviews)?data.reviews:[],canReview:!!data.canReview,hasReviewed:!!data.hasReviewed,signedIn:!!data.signedIn,emailVerified:!!data.emailVerified});
  }catch(error){setReviewError(error instanceof Error?error.message:"Customer reviews are temporarily unavailable.");}
  finally{setReviewLoading(false);}
 }
 useEffect(()=>{
  void refreshReviews();
  const client=browserDb();
  const {data:listener}=client?.auth.onAuthStateChange(()=>{void refreshReviews();})||{data:null};
  return()=>listener?.subscription.unsubscribe();
 },[p.id]);
 async function submitReview(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setReviewSubmitting(true);setReviewMessage("");
  try{
   const response=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json",...await authHeaders()},body:JSON.stringify({productId:p.id,rating:reviewRating,title:reviewTitle,body:reviewBody})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||"Your review could not be submitted.");
   setReviewMessage(data.message||"Thank you. Your review is awaiting moderation.");
   setReviewTitle("");setReviewBody("");setReviewRating(5);
   await refreshReviews();
  }catch(error){setReviewMessage(error instanceof Error?error.message:"Your review could not be submitted.");}
  finally{setReviewSubmitting(false);}
 }
 return <main className="container detail-page">
  <div className="retail-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">{p.category}</Link><span>/</span><span>{p.title}</span></div>
  <Link className="back-link" href="/shop"><ArrowLeft size={17}/> Back to all gadgets</Link>
  <div className="detail-grid">
   <div className="detail-gallery"><div className="detail-product-image">{p.images[index]?.url?<img src={p.images[index].url} alt={p.images[index].alt||p.title}/>:<span className="commerce-placeholder">N.</span>}</div>
    {p.images.length>1&&<div className="detail-thumbs">{p.images.map((image,i)=><button type="button" className={index===i?"active":""} onClick={()=>setIndex(i)} key={i} aria-label={"View product image "+(i+1)}><img src={image.url} alt={image.alt||p.title}/></button>)}</div>}
   </div>
   <div className="detail-copy">
    <p className="eyebrow">{p.category} / {p.brand||"Nexora"}</p><h1>{p.title}</h1>
    <div className="detail-rating-line"><StarDisplay value={reviewData.average}/><strong>{reviewData.count?reviewData.average.toFixed(1):"No ratings yet"}</strong><a href="#product-reviews">({reviewData.count} customer {reviewData.count===1?"review":"reviews"})</a></div>
    <p className="detail-description">{p.description||"Product information is being updated by the Nexora team."}</p>
    <div className="detail-price">{money(v?.price_paisa||0)}{v?.compare_at_paisa&&v.compare_at_paisa>v.price_paisa?<s className="old-price">{money(v.compare_at_paisa)}</s>:null}<span className={v?.available?"detail-availability in-stock":"detail-availability out-stock"}>{v?.available? v.available+" available":"Out of stock"}</span></div>
    <p className="detail-label">Select colour / variation</p>
    <div className="variant-row">{p.variants.map(x=><button type="button" key={x.id} className={"variant-button "+(x.id===selected?"active":"")} onClick={()=>setSelected(x.id)}>{x.color||x.name} · {money(x.price_paisa)}{x.available<=0?" · Out of stock":""}</button>)}</div>
    <button className="primary-button detail-add-button" disabled={!v||v.available<=0} onClick={()=>v&&add(v.id)}><ShoppingBag size={18}/>{v?.available?"Add to shopping bag":"Currently out of stock"}</button>
    <div className="detail-notice"><ShieldCheck size={20}/><p><strong>Warranty:</strong> {p.warranty||"Contact Nexora for warranty terms"}</p></div>
    <div className="detail-notice"><Truck size={20}/><p>Delivery charge and estimated arrival are confirmed for your district at checkout.</p></div>
   </div>
  </div>
  <nav className="detail-info-tabs" aria-label="Product information"><a href="#product-description">Description</a><a href="#product-specifications">Specifications</a><a href="#product-reviews">Customer reviews ({reviewData.count})</a></nav>
  <section id="product-description" className="detail-info-section"><span className="retail-eyebrow">GET TO KNOW IT</span><h2>Product description</h2><p className="detail-long-description">{p.description||"Detailed product information will be added by Nexora before publication."}</p></section>
  <section id="product-specifications" className="detail-info-section"><span className="retail-eyebrow">THE DETAILS</span><h2>Specifications</h2>
   {Object.keys(p.specs||{}).length>0?<table className="spec-table"><tbody>{Object.entries(p.specs).map(([key,value])=><tr key={key}><th>{key.replace(/_/g," ")}</th><td>{String(value)}</td></tr>)}</tbody></table>:<p className="detail-muted">Specifications have not been added yet.</p>}
  </section>
  <section id="product-reviews" className="detail-info-section detail-reviews-section">
   <div className="detail-review-heading"><div><span className="retail-eyebrow">REAL CUSTOMER FEEDBACK</span><h2>Customer reviews</h2><p>Reviews are accepted only from customers with a delivered Nexora order.</p></div>
    <div className="detail-review-score"><strong>{reviewData.count?reviewData.average.toFixed(1):"—"}</strong><StarDisplay value={reviewData.average}/><small>{reviewData.count} verified {reviewData.count===1?"review":"reviews"}</small></div>
   </div>
   {reviewLoading?<p className="detail-muted">Loading customer reviews…</p>:reviewError?<p className="detail-review-notice" role="status">{reviewError}</p>:reviewData.reviews.length?<div className="detail-review-list">{reviewData.reviews.map(review=><article className="detail-review-card" key={review.id}><div className="detail-review-card-top"><StarDisplay value={review.rating}/><time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("en-BD",{day:"numeric",month:"short",year:"numeric"})}</time></div><h3>{review.title}</h3><p>{review.body}</p>{review.verified_purchase&&<span className="detail-verified-buyer"><CheckCircle2 size={13}/> Verified purchase</span>}</article>)}</div>:<div className="detail-no-reviews"><Star size={24}/><strong>No customer reviews yet</strong><p>Be the first verified buyer to share your experience.</p></div>}
   <div className="detail-review-form-wrap">
    <h3>Share your experience</h3>
    {reviewMessage&&<p className="detail-review-notice" role="status">{reviewMessage}</p>}
    {reviewData.hasReviewed?<p className="detail-muted">You have already submitted a review for this product.</p>
    :reviewData.canReview?<form className="detail-review-form" onSubmit={submitReview}>
      <fieldset className="detail-rating-field"><legend>Your rating</legend><span className="detail-rating-picker">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setReviewRating(n)} aria-label={"Rate "+n+" out of 5"} aria-pressed={reviewRating===n}><Star size={22} fill={n<=reviewRating?"currentColor":"none"}/></button>)}</span></fieldset>
      <label>Review title<input required minLength={3} maxLength={100} value={reviewTitle} onChange={e=>setReviewTitle(e.target.value)} placeholder="Summarise your experience"/></label>
      <label>Your review<textarea required minLength={10} maxLength={1600} rows={4} value={reviewBody} onChange={e=>setReviewBody(e.target.value)} placeholder="What did you like or dislike about this product?"/></label>
      <button className="primary-button" disabled={reviewSubmitting}><Send size={15}/>{reviewSubmitting?"Submitting…":"Submit review"}</button>
      <small>Your review will appear publicly after an owner checks it. Only one review per product per account.</small>
     </form>
    :reviewData.signedIn&&!reviewData.emailVerified?<p className="detail-muted">Please verify your account email before submitting a customer review.</p>
    :reviewData.signedIn?<p className="detail-muted">A delivered order containing this product is required before you can submit a review. If you just received your order, please allow the order status to update.</p>
    :<p className="detail-muted"><Link href="/account">Sign in to your Nexora account</Link> to submit a review after your order has been delivered.</p>}
   </div>
  </section>
 </main>;
}
