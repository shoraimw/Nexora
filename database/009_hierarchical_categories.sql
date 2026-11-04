-- Nexora hierarchical retail taxonomy (13 top-level categories).
-- Existing product rows retain their category references wherever possible.
alter table public.categories
 add column if not exists parent_id uuid references public.categories(id) on delete set null;

create index if not exists idx_categories_parent_sort
 on public.categories(parent_id,sort_order,name);

do $$
begin
 if exists(select 1 from public.categories where slug='audio')
    and not exists(select 1 from public.categories where slug='headphones-speakers') then
  update public.categories set slug='headphones-speakers',name='Headphones & Speakers',description='Earbuds, headphones, speakers and audio gear.'
  where slug='audio';
 end if;
 if exists(select 1 from public.categories where slug='wearables')
    and not exists(select 1 from public.categories where slug='watches') then
  update public.categories set slug='watches',name='Watches',description='Wrist watches, smart watches, straps and accessories.'
  where slug='wearables';
 end if;
 if exists(select 1 from public.categories where slug='accessories')
    and not exists(select 1 from public.categories where slug='phone-accessories') then
  update public.categories set slug='phone-accessories',name='Phone Accessories',description='Power banks, chargers, adapters and memory cards.'
  where slug='accessories';
 end if;
 if exists(select 1 from public.categories where slug='camera-networking')
    and not exists(select 1 from public.categories where slug='camera') then
  update public.categories set slug='camera',name='Camera',description='Cameras and accessories for creators and travellers.'
  where slug='camera-networking';
 end if;
end $$;

insert into public.categories(slug,name,description,sort_order,active)
values
 ('phones','Phones','Smartphones and mobile essentials.',10,true),
 ('mac','Mac','Mac computers and accessories.',20,true),
 ('phone-accessories','Phone Accessories','Power banks, chargers, adapters and memory cards.',30,true),
 ('tablets','Tablets','iPad and Android tablets.',40,true),
 ('cases-protectors','Cases & Protectors','Device cases, covers and screen protectors.',50,true),
 ('watches','Watches','Wrist watches, smart watches, straps and accessories.',60,true),
 ('headphones-speakers','Headphones & Speakers','Earbuds, headphones, speakers and audio gear.',70,true),
 ('pc-accessories','PC Accessories','Computer peripherals, storage and setup gear.',80,true),
 ('camera','Camera','Cameras and accessories for creators and travellers.',90,true),
 ('gadgets','Gadgets','Useful everyday gadgets and lifestyle technology.',100,true),
 ('networking','Networking','Routers and networking equipment.',110,true),
 ('gaming','Gaming','Gaming consoles, controllers and peripherals.',120,true),
 ('drone','Drone','Drones and aerial accessories.',130,true)
on conflict(slug) do update set name=excluded.name,description=excluded.description,sort_order=excluded.sort_order,active=true;

-- Reparent any old Camera & Networking children after the legacy parent is normalised.
update public.categories child
set parent_id=(select id from public.categories where slug='camera')
where child.slug in ('cameras','action-cameras','camera-accessories')
 and child.parent_id=(select id from public.categories where slug='camera');

insert into public.categories(slug,name,description,sort_order,parent_id,active)
select seed.slug,seed.name,seed.description,seed.sort_order,parent.id,true
from (values
 ('phones','apple-iphone','Apple iPhone','iPhone models and mobile essentials.',10),
 ('phones','samsung-phones','Samsung Phones','Samsung Galaxy smartphones.',20),
 ('phones','google-pixel','Google Pixel','Google Pixel phones.',30),
 ('phones','other-smartphones','Other Smartphones','Other Android smartphones.',40),
 ('mac','macbook','MacBook','MacBook Air and MacBook Pro.',10),
 ('mac','imac','iMac','Apple iMac desktop computers.',20),
 ('mac','mac-mini','Mac mini','Compact Mac desktop computers.',30),
 ('mac','mac-accessories','Mac Accessories','Accessories for Mac computers.',40),
 ('phone-accessories','power-banks','Power Banks','Portable power banks and chargers.',10),
 ('phone-accessories','chargers-adapters','Chargers & Adapters','Wall chargers, adapters and charging accessories.',20),
 ('phone-accessories','memory-cards','Memory Cards','MicroSD and memory cards.',30),
 ('tablets','apple-ipad','Apple iPad','Apple iPad tablets.',10),
 ('tablets','samsung-galaxy-tab','Samsung Galaxy Tab','Samsung Galaxy tablets.',20),
 ('tablets','android-tablets','Android Tablets','Android tablets.',30),
 ('tablets','tablet-accessories','Tablet Accessories','Cases, keyboards, stylus and tablet add-ons.',40),
 ('cases-protectors','apple-cases','Apple','Cases and protection for Apple devices.',10),
 ('cases-protectors','samsung-cases','Samsung','Cases and protection for Samsung devices.',20),
 ('cases-protectors','google-pixel-cases','Google Pixel','Cases and protection for Pixel devices.',30),
 ('cases-protectors','earbuds-cases','Earbuds Cases','Protective cases for earbuds.',40),
 ('cases-protectors','screen-protectors','Screen Protectors','Screen guards and protective films.',50),
 ('watches','wrist-watches','Wrist Watches','Classic wrist watches.',10),
 ('watches','smart-watches','Smart Watches','Smart watches and connected wearables.',20),
 ('watches','smart-watch-brands','Smart Watch Brands','Browse smart watches by brand.',30),
 ('watches','watch-straps','Watch Straps','Replacement and style straps.',40),
 ('watches','watch-accessories','Watch Accessories','Chargers and watch accessories.',50),
 ('headphones-speakers','earbuds','Earbuds','True wireless and wired earbuds.',10),
 ('headphones-speakers','speakers','Speakers','Portable and desktop speakers.',20),
 ('headphones-speakers','headphones','Headphones','Over-ear and on-ear headphones.',30),
 ('headphones-speakers','earphones','Earphones','Wired earphones.',40),
 ('headphones-speakers','neckbands','Neckbands','Wireless neckband earphones.',50),
 ('headphones-speakers','microphones','Microphones','Voice and recording microphones.',60),
 ('pc-accessories','keyboards','Keyboards','Computer and mechanical keyboards.',10),
 ('pc-accessories','mouse','Mouse','Wired and wireless computer mice.',20),
 ('pc-accessories','stylus','Stylus','Digital pens and stylus.',30),
 ('pc-accessories','pen-drives','Pen Drives','Portable USB flash storage.',40),
 ('pc-accessories','webcams','Webcams','Webcams for calls and streaming.',50),
 ('pc-accessories','bags-sleeves','Bags & Sleeves','Laptop bags and protective sleeves.',60),
 ('pc-accessories','storage','Storage','Computer storage accessories.',70),
 ('pc-accessories','hard-drives','Hard Drives','External hard drives and SSDs.',80),
 ('pc-accessories','desk-setup','Desk Setup','Workspace accessories and essentials.',90),
 ('camera','cameras','Cameras','Digital and compact cameras.',10),
 ('camera','action-cameras','Action Cameras','Compact cameras for active use.',20),
 ('camera','camera-accessories','Camera Accessories','Batteries, tripods and camera add-ons.',30),
 ('gadgets','daily-lifestyle','Daily Lifestyle','Useful everyday lifestyle gadgets.',10),
 ('gadgets','charging-fans','Charging Fans','Portable rechargeable fans.',20),
 ('gadgets','tv-boxes','TV Boxes','Smart TV and streaming boxes.',30),
 ('networking','routers','Routers','Wi-Fi routers for home and office.',10),
 ('networking','tp-link-routers','TP-Link Routers','TP-Link routers and networking.',20),
 ('networking','network-accessories','Network Accessories','Adapters and networking accessories.',30),
 ('gaming','gaming-consoles','Gaming Consoles','Gaming consoles and systems.',10),
 ('gaming','gamepads','Gamepads','Game controllers and gamepads.',20),
 ('gaming','gaming-keyboards','Gaming Keyboards','Gaming and mechanical keyboards.',30),
 ('gaming','gaming-mouse','Gaming Mouse','Gaming mice and precision peripherals.',40),
 ('gaming','gaming-headphones','Gaming Headphones','Headphones designed for gaming.',50),
 ('gaming','gaming-earphones','Gaming Earphones','Earphones for gaming.',60),
 ('drone','camera-drones','Camera Drones','Aerial photography drones.',10),
 ('drone','mini-drones','Mini Drones','Compact and beginner drones.',20),
 ('drone','drone-accessories','Drone Accessories','Drone batteries, propellers and accessories.',30)
) as seed(parent_slug,slug,name,description,sort_order)
join public.categories parent on parent.slug=seed.parent_slug
on conflict(slug) do update set
 name=excluded.name,description=excluded.description,sort_order=excluded.sort_order,
 parent_id=excluded.parent_id,active=true;

-- Preserve products in the former combined Camera & Networking category.
update public.products p
set category_id=target.id
from public.categories legacy,public.categories target
where legacy.slug='camera-networking' and target.slug='camera'
 and p.category_id=legacy.id;

-- Move network subcategories from a legacy combined category to Networking.
update public.categories child
set parent_id=(select id from public.categories where slug='networking')
where child.slug in ('routers','tp-link-routers','network-accessories')
 and child.parent_id=(select id from public.categories where slug='camera');

-- Legacy duplicate names are merged without deleting their products.
update public.products p set category_id=canonical.id
from public.categories legacy,public.categories canonical
where legacy.slug='audio' and canonical.slug='headphones-speakers' and p.category_id=legacy.id;
delete from public.categories legacy using public.categories canonical
where legacy.slug='audio' and canonical.slug='headphones-speakers' and legacy.id<>canonical.id;

update public.products p set category_id=canonical.id
from public.categories legacy,public.categories canonical
where legacy.slug='wearables' and canonical.slug='watches' and p.category_id=legacy.id;
delete from public.categories legacy using public.categories canonical
where legacy.slug='wearables' and canonical.slug='watches' and legacy.id<>canonical.id;

update public.products p set category_id=canonical.id
from public.categories legacy,public.categories canonical
where legacy.slug='accessories' and canonical.slug='phone-accessories' and p.category_id=legacy.id;
delete from public.categories legacy using public.categories canonical
where legacy.slug='accessories' and canonical.slug='phone-accessories' and legacy.id<>canonical.id;

-- Hide the old plushies collection from customer-facing navigation.
update public.categories set active=false where slug='plushies';

-- Remove the legacy combined category after its products and subcategories are reassigned.
delete from public.categories legacy using public.categories camera
where legacy.slug='camera-networking' and camera.slug='camera' and legacy.id<>camera.id;
