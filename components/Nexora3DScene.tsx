"use client";

import {useEffect,useRef,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from "react";

function roundedShape(THREE:typeof import("three"),width:number,height:number,radius:number){
 const shape=new THREE.Shape();
 const left=-width/2,right=width/2,bottom=-height/2,top=height/2;
 shape.moveTo(left+radius,bottom);
 shape.lineTo(right-radius,bottom);
 shape.quadraticCurveTo(right,bottom,right,bottom+radius);
 shape.lineTo(right,top-radius);
 shape.quadraticCurveTo(right,top,right-radius,top);
 shape.lineTo(left+radius,top);
 shape.quadraticCurveTo(left,top,left,top-radius);
 shape.lineTo(left,bottom+radius);
 shape.quadraticCurveTo(left,bottom,left+radius,bottom);
 return shape;
}

function makeScreenTexture(THREE:typeof import("three"),kind:"phone"|"watch"){
 const canvas=document.createElement("canvas");
 canvas.width=512;
 canvas.height=kind==="phone"?1024:512;
 const context=canvas.getContext("2d");
 if(!context)return null;
 const height=canvas.height;
 const base=context.createLinearGradient(0,0,512,height);
 base.addColorStop(0,"#102d40");
 base.addColorStop(.48,"#071521");
 base.addColorStop(1,"#132b3d");
 context.fillStyle=base;
 context.fillRect(0,0,512,height);
 const glow=context.createRadialGradient(365,245,12,260,290,330);
 glow.addColorStop(0,"#ff9b6b");
 glow.addColorStop(.22,"#8d6e77");
 glow.addColorStop(.56,"#244d62");
 glow.addColorStop(1,"#07152100");
 context.fillStyle=glow;
 context.fillRect(0,0,512,height);
 context.strokeStyle="rgba(255,255,255,.17)";
 context.lineWidth=2;
 for(let i=0;i<4;i++){
  context.beginPath();
  context.arc(350,275,72+i*38,0,Math.PI*2);
  context.stroke();
 }
 context.fillStyle="rgba(255,255,255,.88)";
 context.font="700 23px Arial, sans-serif";
 context.fillText("NEXORA",38,kind==="phone"?100:78);
 context.fillStyle="rgba(255,255,255,.58)";
 context.font="500 14px Arial, sans-serif";
 context.fillText(kind==="phone"?"A LITTLE MORE YOU":"MONDAY  ·  05 NOV",38,kind==="phone"?132:105);
 if(kind==="phone"){
  context.fillStyle="#f8fafc";
  context.font="700 62px Arial, sans-serif";
  context.fillText("MAKE IT",38,625);
  context.fillText("YOURS.",38,695);
  context.fillStyle="#ffad86";
  context.font="700 17px Arial, sans-serif";
  context.fillText("TECH FOR EVERY DAY",40,740);
  context.fillStyle="rgba(255,255,255,.48)";
  context.font="500 13px Arial, sans-serif";
  context.fillText("DESIGNED TO CONNECT",40,790);
  context.strokeStyle="rgba(255,255,255,.3)";
  context.lineWidth=2;
  context.beginPath();context.moveTo(40,850);context.lineTo(470,850);context.stroke();
  context.fillStyle="rgba(255,255,255,.8)";
  context.font="600 16px Arial, sans-serif";
  context.fillText("09:41",40,895);
 }else{
  context.fillStyle="rgba(255,255,255,.7)";
  context.font="600 19px Arial, sans-serif";
  context.fillText("MON",42,165);
  context.fillStyle="#ffffff";
  context.font="700 82px Arial, sans-serif";
  context.fillText("09:41",40,270);
  const rings=[{color:"#ff9569",radius:63},{color:"#65d7e5",radius:46},{color:"#a99aff",radius:29}];
  rings.forEach((ring,index)=>{
   context.beginPath();context.strokeStyle=ring.color;context.lineWidth=9;
   context.arc(256,365,ring.radius,-Math.PI*.78,Math.PI*.65-index*.08);context.stroke();
  });
  context.fillStyle="rgba(255,255,255,.65)";
  context.font="600 13px Arial, sans-serif";
  context.fillText("MOVE  ·  FOCUS  ·  GO",165,475);
 }
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=8;
 return texture;
}

function makeBrushedMetalTexture(THREE:typeof import("three")){
 const canvas=document.createElement("canvas");
 canvas.width=256;
 canvas.height=256;
 const context=canvas.getContext("2d");
 if(!context)return null;
 const pixels=context.createImageData(256,256);
 for(let y=0;y<256;y++){
  for(let x=0;x<256;x++){
   const index=(y*256+x)*4;
   const grain=(Math.sin(x*1.73+y*.11)+Math.sin(x*.37-y*.19)+2)*.25;
   const noise=((x*37+y*17)%31)/31;
   const value=Math.max(0,Math.min(255,118+Math.round(grain*30+noise*24)));
   pixels.data[index]=value;
   pixels.data[index+1]=value;
   pixels.data[index+2]=value;
   pixels.data[index+3]=255;
  }
 }
 context.putImageData(pixels,0,0);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.NoColorSpace;
 texture.wrapS=THREE.RepeatWrapping;
 texture.wrapT=THREE.RepeatWrapping;
 texture.repeat.set(3,3);
 texture.anisotropy=4;
 return texture;
}

export function Nexora3DScene({label}:{label:string}){
 const hostRef=useRef<HTMLDivElement>(null);
 const pointerRef=useRef({x:0,y:0,dragging:false,lastX:0,lastY:0});

 useEffect(()=>{
  const host=hostRef.current;
  if(!host)return;
  let disposed=false;
  let animationFrame=0;
  let renderer:import("three").WebGLRenderer|null=null;
  let scene:import("three").Scene|null=null;
  let environmentTarget:import("three").WebGLRenderTarget|null=null;
  let resizeObserver:ResizeObserver|null=null;
  let intersectionObserver:IntersectionObserver|null=null;
  let motionQuery:MediaQueryList|null=null;
  let pageVisible=document.visibilityState==="visible";
  let inViewport=true;
  let reducedMotion=false;
  host.dataset.webgl="loading";

  const onVisibility=()=>{pageVisible=document.visibilityState==="visible";};
  const onMotionChange=()=>{reducedMotion=motionQuery?.matches??false;};

  const boot=async()=>{
   try{
    const [THREE,{RoundedBoxGeometry},{RoomEnvironment}]=await Promise.all([
     import("three"),
     import("three/addons/geometries/RoundedBoxGeometry.js"),
     import("three/addons/environments/RoomEnvironment.js")
    ]);
    if(disposed)return;

    const bounds=host.getBoundingClientRect();
    const width=Math.max(1,bounds.width);
    const height=Math.max(1,bounds.height);
    const compactDevice=window.matchMedia("(max-width: 640px)").matches;
    const activeScene=new THREE.Scene();
    scene=activeScene;
    const camera=new THREE.PerspectiveCamera(34,width/height,.1,60);
    camera.position.set(0,.18,8.5);
    camera.lookAt(0,0,0);

    let activeRenderer:import("three").WebGLRenderer;
    try{
     activeRenderer=new THREE.WebGLRenderer({alpha:true,antialias:!compactDevice,powerPreference:compactDevice?"low-power":"high-performance"});
     renderer=activeRenderer;
    }catch{
     host.dataset.webgl="fallback";
     return;
    }
    activeRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,compactDevice?1.2:1.55));
    activeRenderer.setSize(width,height);
    activeRenderer.setClearColor(0x000000,0);
    activeRenderer.outputColorSpace=THREE.SRGBColorSpace;
    activeRenderer.toneMapping=THREE.ACESFilmicToneMapping;
    activeRenderer.toneMappingExposure=1.12;
    activeRenderer.shadowMap.enabled=true;
    activeRenderer.shadowMap.type=THREE.PCFSoftShadowMap;
    activeRenderer.domElement.className="nexora-webgl-canvas";
    activeRenderer.domElement.setAttribute("aria-hidden","true");
    host.appendChild(activeRenderer.domElement);

    const pmrem=new THREE.PMREMGenerator(activeRenderer);
    const activeEnvironment=pmrem.fromScene(new RoomEnvironment(),.04);
    environmentTarget=activeEnvironment;
    activeScene.environment=activeEnvironment.texture;
    pmrem.dispose();

    activeScene.add(new THREE.HemisphereLight(0xc8e4ff,0x17202c,2.1));
    activeScene.add(new THREE.AmbientLight(0xffffff,.34));
    const keyLight=new THREE.DirectionalLight(0xffe1ce,4.3);
    keyLight.position.set(-3.8,5.2,5.5);
    keyLight.castShadow=true;
    keyLight.shadow.mapSize.set(compactDevice?512:1024,compactDevice?512:1024);
    keyLight.shadow.radius=4;
    keyLight.shadow.camera.near=.1;
    keyLight.shadow.camera.far=18;
    keyLight.shadow.camera.left=-5;
    keyLight.shadow.camera.right=5;
    keyLight.shadow.camera.top=5;
    keyLight.shadow.camera.bottom=-5;
    activeScene.add(keyLight);
    const coolLight=new THREE.DirectionalLight(0x72c9ff,3.1);
    coolLight.position.set(4,2.5,-3);
    activeScene.add(coolLight);
    const warmRim=new THREE.PointLight(0xff895f,34,8);
    warmRim.position.set(-2,-.2,3.2);
    activeScene.add(warmRim);
    const blueRim=new THREE.PointLight(0x5c9eff,28,8);
    blueRim.position.set(2.8,1.3,-2);
    activeScene.add(blueRim);

    const root=new THREE.Group();
    activeScene.add(root);
    const addMesh=(parent:import("three").Object3D,geometry:import("three").BufferGeometry,material:import("three").Material)=>{
     const object=new THREE.Mesh(geometry,material);
     object.castShadow=true;
     object.receiveShadow=true;
     parent.add(object);
     return object;
    };
    const rounded=(parent:import("three").Object3D,w:number,h:number,d:number,r:number,material:import("three").Material)=>{
     return addMesh(parent,new RoundedBoxGeometry(w,h,d,10,r),material);
    };
    const brushedTexture=makeBrushedMetalTexture(THREE);
    const titanium=new THREE.MeshPhysicalMaterial({color:0xaeb8c2,metalness:.94,roughness:.24,roughnessMap:brushedTexture,bumpMap:brushedTexture,bumpScale:.003,clearcoat:.78,clearcoatRoughness:.18,envMapIntensity:1.35});
    const darkTitanium=new THREE.MeshPhysicalMaterial({color:0x273746,metalness:.9,roughness:.3,roughnessMap:brushedTexture,bumpMap:brushedTexture,bumpScale:.002,clearcoat:.72,envMapIntensity:1.2});
    const blackGlass=new THREE.MeshPhysicalMaterial({color:0x03080e,metalness:.08,roughness:.065,clearcoat:1,clearcoatRoughness:.022,envMapIntensity:1.55});
    const screenGlass=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.055,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.13,depthWrite:false});
    const pearl=new THREE.MeshPhysicalMaterial({color:0xf1f4f7,metalness:.12,roughness:.2,clearcoat:.9,clearcoatRoughness:.12});
    const silicone=new THREE.MeshPhysicalMaterial({color:0x202c38,metalness:0,roughness:.72});
    const cushion=new THREE.MeshPhysicalMaterial({color:0x101923,metalness:0,roughness:.88});

    // Smartphone: satin titanium rails, layered glass and a custom-lit OLED display.
    const phone=new THREE.Group();
    rounded(phone,1.04,2.12,.145,.065,titanium);
    rounded(phone,.997,2.075,.025,.012,blackGlass).position.z=.078;
    const phoneTexture=makeScreenTexture(THREE,"phone");
    if(phoneTexture){
     const phoneScreen=addMesh(phone,new THREE.ShapeGeometry(roundedShape(THREE,.944,1.995,.078),16),new THREE.MeshBasicMaterial({map:phoneTexture,toneMapped:false}));
     phoneScreen.position.z=.096;
     phoneScreen.castShadow=false;
     phoneScreen.receiveShadow=false;
     const glass=addMesh(phone,new THREE.ShapeGeometry(roundedShape(THREE,.944,1.995,.078),16),screenGlass);
     glass.position.z=.099;
     glass.castShadow=false;
     glass.receiveShadow=false;
    }
    rounded(phone,.29,.064,.014,.006,blackGlass).position.set(0,.925,.105);
    const selfieLens=addMesh(phone,new THREE.SphereGeometry(.018,16,12),new THREE.MeshPhysicalMaterial({color:0x315f83,metalness:.25,roughness:.08,clearcoat:1}));
    selfieLens.position.set(.105,.925,.118);
    rounded(phone,.025,.22,.048,.012,darkTitanium).position.set(.535,.38,.005);
    rounded(phone,.025,.13,.048,.012,darkTitanium).position.set(.535,.08,.005);
    rounded(phone,.025,.29,.048,.012,darkTitanium).position.set(-.535,.22,.005);
    // Rear camera island with separate sapphire-like lens glass and machined rings.
    const cameraIsland=rounded(phone,.43,.54,.045,.09,darkTitanium);
    cameraIsland.position.set(-.27,.72,-.105);
    const cameraRingMaterial=new THREE.MeshPhysicalMaterial({color:0xb5c1cb,metalness:.96,roughness:.18,clearcoat:1});
    const cameraLensMaterial=new THREE.MeshPhysicalMaterial({color:0x071b2c,metalness:.45,roughness:.08,clearcoat:1,clearcoatRoughness:.02});
    const cameraPositions:[number,number][]=[[-.4,.88],[-.4,.64],[-.16,.64]];
    cameraPositions.forEach(([x,y])=>{
     const ring=addMesh(phone,new THREE.TorusGeometry(.075,.012,12,36),cameraRingMaterial);
     ring.position.set(x,y,-.137);
     ring.rotation.y=Math.PI;
     const lens=addMesh(phone,new THREE.CircleGeometry(.058,36),cameraLensMaterial);
     lens.position.set(x,y,-.139);
     lens.rotation.y=Math.PI;
     const glint=addMesh(phone,new THREE.SphereGeometry(.012,12,10),new THREE.MeshBasicMaterial({color:0x6b9fcb}));
     glint.position.set(x-.014,y+.018,-.143);
    });
    rounded(phone,.24,.035,.018,.014,darkTitanium).position.set(0,-1.055,0);
    for(let i=0;i<5;i++){
     const grille=addMesh(phone,new THREE.SphereGeometry(.012,10,8),darkTitanium);
     grille.position.set(-.19+i*.095,-1.055,.015);
    }
    phone.position.set(-.72,.12,.25);
    phone.rotation.set(-.045,.26,-.105);
    root.add(phone);

    // Smartwatch: shaped fluoroelastomer straps, polished case, glass and crown.
    const watch=new THREE.Group();
    const addWatchBand=(direction:1|-1)=>{
     const bandShape=new THREE.Shape();
     bandShape.moveTo(-.23,direction*.43);
     bandShape.lineTo(.23,direction*.43);
     bandShape.bezierCurveTo(.25,direction*.76,.21,direction*1.2,.16,direction*1.48);
     bandShape.quadraticCurveTo(0,direction*1.57,-.16,direction*1.48);
     bandShape.bezierCurveTo(-.21,direction*1.2,-.25,direction*.76,-.23,direction*.43);
     const geometry=new THREE.ExtrudeGeometry(bandShape,{depth:.1,bevelEnabled:true,bevelThickness:.022,bevelSize:.018,bevelSegments:3,curveSegments:18});
     geometry.translate(0,0,-.05);
     addMesh(watch,geometry,silicone);
    };
    addWatchBand(1);
    addWatchBand(-1);
    rounded(watch,.9,.98,.22,.095,titanium);
    rounded(watch,.82,.9,.035,.016,blackGlass).position.z=.119;
    const watchTexture=makeScreenTexture(THREE,"watch");
    if(watchTexture){
     const dial=addMesh(watch,new THREE.ShapeGeometry(roundedShape(THREE,.755,.825,.15),16),new THREE.MeshBasicMaterial({map:watchTexture,toneMapped:false}));
     dial.position.z=.143;
     dial.castShadow=false;
     dial.receiveShadow=false;
     const watchGlass=addMesh(watch,new THREE.ShapeGeometry(roundedShape(THREE,.755,.825,.15),16),screenGlass);
     watchGlass.position.z=.146;
     watchGlass.castShadow=false;
     watchGlass.receiveShadow=false;
    }
    rounded(watch,.34,.075,.12,.03,darkTitanium).position.set(0,1.14,.015);
    for(let i=0;i<3;i++){
     const strapHole=addMesh(watch,new THREE.SphereGeometry(.018,12,10),darkTitanium);
     strapHole.position.set(0,-1.12-i*.12,.055);
    }
    const crown=addMesh(watch,new THREE.CylinderGeometry(.073,.073,.145,28),titanium);
    crown.rotation.z=Math.PI/2;
    crown.position.set(.49,.12,.015);
    const crownCap=addMesh(watch,new THREE.CylinderGeometry(.045,.045,.012,24),darkTitanium);
    crownCap.rotation.z=Math.PI/2;
    crownCap.position.set(.565,.12,.015);
    watch.position.set(1.42,.57,-.12);
    watch.rotation.set(-.08,-.32,.075);
    watch.scale.setScalar(.77);
    root.add(watch);

    // Over-ear headphones with an arched metal headband and circular acoustic cups.
    const headphones=new THREE.Group();
    const archCurve=new THREE.CatmullRomCurve3([
     new THREE.Vector3(-.7,-.04,0),new THREE.Vector3(-.72,.55,0),new THREE.Vector3(-.52,1.03,0),
     new THREE.Vector3(0,1.22,0),new THREE.Vector3(.52,1.03,0),new THREE.Vector3(.72,.55,0),new THREE.Vector3(.7,-.04,0)
    ]);
    addMesh(headphones,new THREE.TubeGeometry(archCurve,72,.092,18,false),darkTitanium);
    [-1,1].forEach(side=>{
     const slider=rounded(headphones,.12,.3,.12,.045,titanium);
     slider.position.set(side*.7,-.08,.045);
     const cup=addMesh(headphones,new THREE.CylinderGeometry(.28,.28,.19,48),titanium);
     cup.rotation.x=Math.PI/2;
     cup.position.set(side*.7,-.25,.105);
     const outerRing=addMesh(headphones,new THREE.TorusGeometry(.255,.018,12,48),darkTitanium);
     outerRing.position.set(side*.7,-.25,.207);
     const pad=addMesh(headphones,new THREE.TorusGeometry(.205,.058,16,48),cushion);
     pad.position.set(side*.7,-.25,.225);
     const speaker=addMesh(headphones,new THREE.CircleGeometry(.155,48),blackGlass);
     speaker.position.set(side*.7,-.25,.23);
     for(let i=0;i<3;i++){
      const detail=addMesh(headphones,new THREE.SphereGeometry(.012,10,8),titanium);
      detail.position.set(side*.7+(i-1)*.075,-.25,.247);
     }
    });
    headphones.position.set(-1.86,-.93,-.28);
    headphones.rotation.set(-.04,.17,-.08);
    headphones.scale.setScalar(.82);
    root.add(headphones);

    // Wireless charging case with a hinge, status light and sculpted earbuds.
    const earbuds=new THREE.Group();
    rounded(earbuds,.96,.4,.47,.18,pearl).position.set(0,-.08,0);
    rounded(earbuds,.94,.17,.455,.085,pearl).position.set(0,.205,0);
    const caseSeam=rounded(earbuds,.89,.012,.012,.005,darkTitanium);
    caseSeam.position.set(0,.112,.239);
    caseSeam.castShadow=false;
    const hinge=addMesh(earbuds,new THREE.CylinderGeometry(.052,.052,.56,24),titanium);
    hinge.rotation.z=Math.PI/2;
    hinge.position.set(0,.235,-.19);
    const caseLight=addMesh(earbuds,new THREE.SphereGeometry(.018,16,12),new THREE.MeshBasicMaterial({color:0xff9a70}));
    caseLight.position.set(0,-.12,.24);
    [-1,1].forEach(side=>{
     const bud=new THREE.Group();
     const head=addMesh(bud,new THREE.SphereGeometry(.12,24,20),pearl);
     head.scale.set(1,.9,.78);
     head.position.y=.045;
     const tip=addMesh(bud,new THREE.SphereGeometry(.068,18,14),silicone);
     tip.scale.set(1,.8,.9);
     tip.position.set(0,.025,-.075);
     const stem=rounded(bud,.085,.25,.075,.03,pearl);
     stem.position.set(0,-.13,.018);
     stem.rotation.z=side*.1;
     const sensor=addMesh(bud,new THREE.SphereGeometry(.022,12,10),blackGlass);
     sensor.position.set(0,.05,.104);
     const microphone=addMesh(bud,new THREE.SphereGeometry(.012,10,8),darkTitanium);
     microphone.position.set(.045,-.17,.059);
     bud.position.set(side*.23,.52,.19);
     bud.rotation.z=side*-.18;
     earbuds.add(bud);
    });
    earbuds.position.set(1.58,-1.12,.48);
    earbuds.rotation.set(-.08,-.2,.09);
    earbuds.scale.setScalar(.76);
    root.add(earbuds);

    // A dark anodised display plinth grounds the floating products and catches shadows.
    const floorMaterial=new THREE.MeshStandardMaterial({color:0x101d2b,metalness:.42,roughness:.48});
    const plinth=addMesh(root,new THREE.CylinderGeometry(2.55,2.7,.14,96),floorMaterial);
    plinth.position.set(0,-1.73,-.15);
    plinth.receiveShadow=true;
    const rim=addMesh(root,new THREE.TorusGeometry(2.48,.012,8,120),new THREE.MeshBasicMaterial({color:0xff9a70,transparent:true,opacity:.62}));
    rim.rotation.x=Math.PI/2;
    rim.position.set(0,-1.645,-.15);
    rim.castShadow=false;
    const ground=addMesh(activeScene,new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x0a1521,roughness:.88,metalness:.12}));
    ground.rotation.x=-Math.PI/2;
    ground.position.y=-1.82;
    ground.receiveShadow=true;
    ground.castShadow=false;

    const floaters=[
     {object:phone,baseY:.12,phase:0,amount:.055},
     {object:watch,baseY:.57,phase:1.3,amount:.07},
     {object:headphones,baseY:-.93,phase:2.2,amount:.045},
     {object:earbuds,baseY:-1.12,phase:3.1,amount:.06}
    ];

    const resize=()=>{
     const rect=host.getBoundingClientRect();
     const nextWidth=Math.max(1,rect.width);
     const nextHeight=Math.max(1,rect.height);
     const isCompact=nextWidth<560;
     camera.aspect=nextWidth/nextHeight;
     camera.position.z=isCompact?9.6:8.5;
     camera.fov=isCompact?36:34;
     camera.updateProjectionMatrix();
     root.scale.setScalar(isCompact ? 0.84 : 1);
     activeRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isCompact?1.2:1.55));
     activeRenderer.setSize(nextWidth,nextHeight);
    };
    resizeObserver=new ResizeObserver(resize);
    resizeObserver.observe(host);
    intersectionObserver=new IntersectionObserver(entries=>{
     inViewport=entries[0]?.isIntersecting??true;
    },{rootMargin:"120px"});
    intersectionObserver.observe(host);
    motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion=motionQuery.matches;
    motionQuery.addEventListener("change",onMotionChange);
    document.addEventListener("visibilitychange",onVisibility);

    let lastRenderTime=0;
    const frameInterval=compactDevice?1000/30:1000/45;
    const animate=(time:number)=>{
     if(disposed)return;
     animationFrame=window.requestAnimationFrame(animate);
     if(!pageVisible||!inViewport||time-lastRenderTime<frameInterval)return;
     lastRenderTime=time;
     const seconds=time*.001;
     if(!reducedMotion){
      const targetY=pointerRef.current.x*.3+Math.sin(seconds*.24)*.035;
      const targetX=-pointerRef.current.y*.15;
      root.rotation.y+=(targetY-root.rotation.y)*.035;
      root.rotation.x+=(targetX-root.rotation.x)*.035;
      floaters.forEach(item=>{
       item.object.position.y=item.baseY+Math.sin(seconds*.88+item.phase)*item.amount;
      });
     }
     activeRenderer.render(activeScene,camera);
    };
    host.dataset.webgl="ready";
    animationFrame=window.requestAnimationFrame(animate);
   }catch{
    if(!disposed){
     host.dataset.webgl="fallback";
     renderer?.dispose();
     renderer?.domElement.remove();
     renderer=null;
    }
   }
  };

  void boot();
  return()=>{
   disposed=true;
   window.cancelAnimationFrame(animationFrame);
   resizeObserver?.disconnect();
   intersectionObserver?.disconnect();
   motionQuery?.removeEventListener("change",onMotionChange);
   document.removeEventListener("visibilitychange",onVisibility);
   if(scene){
    scene.traverse(object=>{
     const mesh=object as import("three").Mesh;
     if(mesh.geometry)mesh.geometry.dispose();
     if(mesh.material){
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      materials.forEach(material=>{
       const mapped=material as import("three").Material & {map?:import("three").Texture};
       mapped.map?.dispose();
       material.dispose();
      });
     }
    });
   }
   environmentTarget?.dispose();
   renderer?.dispose();
   renderer?.domElement.remove();
  };
 },[]);

 const handlePointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
  pointerRef.current.dragging=true;
  pointerRef.current.lastX=event.clientX;
  pointerRef.current.lastY=event.clientY;
  event.currentTarget.setPointerCapture(event.pointerId);
 };
 const handlePointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const pointer=pointerRef.current;
  const rect=event.currentTarget.getBoundingClientRect();
  if(pointer.dragging){
   pointer.x=Math.max(-1,Math.min(1,pointer.x+((event.clientX-pointer.lastX)/rect.width)*2.2));
   pointer.y=Math.max(-1,Math.min(1,pointer.y+((event.clientY-pointer.lastY)/rect.height)*2.2));
   pointer.lastX=event.clientX;
   pointer.lastY=event.clientY;
   return;
  }
  if(event.pointerType==="touch")return;
  pointer.x=((event.clientX-rect.left)/rect.width-.5)*2;
  pointer.y=((event.clientY-rect.top)/rect.height-.5)*2;
 };
 const handlePointerUp=(event:ReactPointerEvent<HTMLDivElement>)=>{
  pointerRef.current.dragging=false;
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
 };
 const handlePointerLeave=()=>{
  if(pointerRef.current.dragging)return;
  pointerRef.current.x=0;
  pointerRef.current.y=0;
 };
 const handleKeyDown=(event:ReactKeyboardEvent<HTMLDivElement>)=>{
  const step=.16;
  if(event.key==="ArrowLeft")pointerRef.current.x=Math.max(-1,pointerRef.current.x-step);
  else if(event.key==="ArrowRight")pointerRef.current.x=Math.min(1,pointerRef.current.x+step);
  else if(event.key==="ArrowUp")pointerRef.current.y=Math.max(-1,pointerRef.current.y-step);
  else if(event.key==="ArrowDown")pointerRef.current.y=Math.min(1,pointerRef.current.y+step);
  else return;
  event.preventDefault();
 };

 return <div ref={hostRef} className="nexora-webgl-stage" role="group" tabIndex={0} aria-label={"Interactive 3D gadget display. Drag or use arrow keys to rotate the smartphone, smartwatch, headphones and wireless earbuds. Featured collection: "+label} onKeyDown={handleKeyDown} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onPointerLeave={handlePointerLeave}>
  <div className="nexora-webgl-fallback" aria-hidden="true">
   <span className="nexora-fallback-phone"><i/></span>
   <span className="nexora-fallback-watch"><i/></span>
   <span className="nexora-fallback-headphones"><i/></span>
   <span className="nexora-fallback-earbuds"><i/></span>
  </div>
 </div>;
}
