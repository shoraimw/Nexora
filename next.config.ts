import type {NextConfig} from "next";
const config:NextConfig={
 reactStrictMode:true,
 devIndicators:false,
 poweredByHeader:false,
 async headers(){
  const securityHeaders:{key:string;value:string}[]=[
   {key:"X-Content-Type-Options",value:"nosniff"},
   {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
   {key:"X-Frame-Options",value:"DENY"},
   {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
   {key:"X-Permitted-Cross-Domain-Policies",value:"none"},
   {key:"Cross-Origin-Opener-Policy",value:"same-origin"}
  ];
  if(process.env.NODE_ENV==="production")securityHeaders.push({key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"});
  return [{source:"/:path*",headers:securityHeaders}];
 }
};
export default config;
