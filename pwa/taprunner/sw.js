
const CACHE_STORAGE_NAME = 'v1';
self.addEventListener('fetch', function(event) {
  //キャッシュ対象
  const is_assets = event.request.url.includes('ASSETS/');
  const is_fonts = event.request.url.includes('fonts/');
  const is_js = event.request.url.includes('js/') || event.request.url.includes('.js');
  const is_html = event.request.url.includes('.html');
  if(!is_assets && !is_fonts && !is_js){ return; }
  //キャッシュ制御
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        return caches.open(CACHE_STORAGE_NAME).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});