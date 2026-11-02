import {configured,db,bad,ok,requireOwner,sameOrigin} from "@/lib/server";
import {z} from "zod";
import {rateAllow} from "@/lib/rate";
function validBytes(bytes:Uint8Array,mime:string){
 return (mime==="image/png"&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)||
 (mime==="image/jpeg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)||
 (mime==="image/webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP");
}
export async function POST(req:Request){
 if(!configured)return bad("Backend not configured",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const owner=await requireOwner(req);if(!owner)return bad("Owner access required",403);
 if(!await rateAllow(req,"admin-product-upload",30,60))return bad("Upload limit reached. Try again later.",429);
 const form=await req.formData().catch(()=>null);if(!form)return bad("Invalid upload");
 const file=form.get("file"),productId=form.get("productId"),alt=form.get("alt");
 if(!(file instanceof File)||typeof productId!=="string"||!z.string().uuid().safeParse(productId).success)return bad("Invalid image or product");
 if(file.size<100||file.size>3*1024*1024)return bad("Image must be under 3 MB");
 if(!["image/png","image/jpeg","image/webp"].includes(file.type))return bad("Unsupported image format");
 const bytes=new Uint8Array(await file.arrayBuffer());if(!validBytes(bytes,file.type))return bad("Invalid image content");
 const {data:product}=await db().from("products").select("id").eq("id",productId).maybeSingle();
 if(!product)return bad("Product not found",404);
 const ext=file.type==="image/png"?"png":file.type==="image/jpeg"?"jpg":"webp";
 const path=productId+"/"+crypto.randomUUID()+"."+ext;
 const {error:uploadError}=await db().storage.from("nexora-products").upload(path,bytes,{contentType:file.type,upsert:false,cacheControl:"3600"});
 if(uploadError)return bad("Upload failed",503);
 const {data:url}=db().storage.from("nexora-products").getPublicUrl(path);
 const {data,error}=await db().from("product_images").insert({product_id:productId,url:url.publicUrl,alt:typeof alt==="string"?alt.slice(0,200):""}).select().single();
 if(error){await db().storage.from("nexora-products").remove([path]);return bad("Image record failed",503);}
 await db().from("audit_logs").insert({actor_id:owner.id,action:"image.upload",object_type:"product",object_id:productId});
 return ok({image:data},201);
}