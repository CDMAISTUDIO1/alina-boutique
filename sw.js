// Alina Boutique - service worker (network-first, 3.5 sec baad phone ki copy)
const C='alina-v26';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(['./','./index.html','./manifest.webmanifest','./firebase-config.js','./logo.png','./banner-home.jpg'].map(x=>c.add(x).catch(()=>{})))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const ok=u.origin===location.origin||u.hostname==='www.gstatic.com'||u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com');
  if(!ok)return;
  const same=u.origin===location.origin;
  const fromCache=()=>caches.match(r,{ignoreSearch:same}).then(m=>m||(r.mode==='navigate'?caches.match('./index.html',{ignoreSearch:true}):undefined));
  const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res});
  // Baaki files (config, logo, Firebase SDK, fonts): phone ki copy foran, peeche se nayi le lo
  if(r.mode!=='navigate'&&!/\.html?$/.test(u.pathname)){net.catch(()=>{});e.respondWith(fromCache().then(m=>m||net));return}
  e.respondWith(new Promise(done=>{
    let fin=false;const give=x=>{if(!fin&&x){fin=true;done(x)}};
    // Kamzor net: 3.5 sec mein jawab na aaye to phone ki copy
    const tm=setTimeout(()=>fromCache().then(give),3500);
    net.then(res=>{clearTimeout(tm);give(res)}).catch(()=>{clearTimeout(tm);fromCache().then(m=>{if(m)give(m);else if(!fin){fin=true;done(Response.error())}})});
  }));
});
