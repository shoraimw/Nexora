import {configured,db,requireOwner,userFromRequest,bad,ok,sameOrigin} from "@/lib/server";
function magic(data:Uint8Array,mime:string){return(mime==="image/png"&&data[0]===137&&data[1]===80&&data[2]===78&&data[3]===71)||(mime==="image/jpeg"&&data[0]===255&&data[1]===216&&data[2]===255)||(mime==="image/webp"&&String.fromCharCode(...data.slice(0,4))==="RIFF"&&String.fromCharCode(...data.slice(8,12))==="WEBP");}
export async function POST(req:Request){
 if(!configured)return bad("Profiles unavailable",503);
 if(!sameOrigin(req))return bad("Origin rejected",403);
 const u=await userFromRequest(req);if(!u)return bad("Login required",401);
 const data=await req.formData().catch(()=>null),file=data?.get("file");
 if(!(file instanceof File)||file.size>2_097_152||file.size<100||!["image/png","image/jpeg","image/webp"].includes(file.type))return bad("Choose PNG, JPEG or WebP under 2 MB");
 const bytes=new Uint8Array(await file.arrayBuffer());if(!magic(bytes,file.type))return bad("File is not a supported image");
 const ext=file.type.split("/")[1]==="jpeg"?"jpg":file.type.split("/")[1],path=u.id+"/"+crypto.randomUUID()+"."+ext;
 const {error}=await db().storage.from("nexora-avatars").upload(path,bytes,{contentType:file.type,upsert:false});
 if(error)return bad("Avatar upload failed",503);
 const {data:prior}=await db().from("profiles").select("avatar_url").eq("user_id",u.id).maybeSingle();
 const {error:dbError}=await db().from("profiles").upsert({user_id:u.id,avatar_url:path,updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(dbError){await db().storage.from("nexora-avatars").remove([path]);return bad("Avatar could not be saved",503);}
 if(prior?.avatar_url)await db().storage.from("nexora-avatars").remove([prior.avatar_url]);
 const {data:signed}=await db().storage.from("nexora-avatars").createSignedUrl(path,3600);
 return ok({avatarUrl:signed?.signedUrl||null});
}