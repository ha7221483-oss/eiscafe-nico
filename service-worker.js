const c="list-v1";
const f=["./","./index.html","./style.css","./app.js","./manifest.json"];
self.addEventListener("install",e=>{
e.waitUntil(caches.open(c).then(x=>x.addAll(f)));
});
self.addEventListener("fetch",e=>{
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
