const CACHE = 'opositamap-v2';
const STATIC = ['./manifest.json','./icon.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never cache: index, Firebase, Google APIs
  if(url.pathname.endsWith('index.html')||url.pathname==='/'||
     url.hostname.includes('firebase')||url.hostname.includes('googleapis')||
     url.hostname.includes('gstatic')){
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
    return;
  }
  // Cache first for static assets
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200){const c=res.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}
        return res;
      });
    })
  );
});
