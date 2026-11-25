// Service worker de l'île (version à distance).
// Rôle limité : rendre l'app installable et recevoir les partages d'autres apps (menu Partager).
// Aucune donnée n'est mise en cache ici, sauf un partage en transit (effacé dès qu'il est repris).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/partage')) {
    e.respondWith((async () => {
      const donnees = await e.request.formData();
      const cache = await caches.open('partage');
      await cache.put('partage-meta', new Response(JSON.stringify({ titre: donnees.get('titre') || '', texte: donnees.get('texte') || '', url: donnees.get('url') || '' })));
      const fichier = donnees.getAll('fichiers').find((f) => f && f.size);
      if (fichier) await cache.put('partage-fichier', new Response(fichier, { headers: { 'Content-Type': fichier.type } }));
      return Response.redirect(new URL('./?partage=1', self.registration.scope).href, 303);
    })());
  }
  // Tout le reste passe normalement par le réseau.
});
