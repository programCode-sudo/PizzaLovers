const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
    '/',
    // Rutas de PWA Cliente
    '/PWA_Clientes/index.html',
    '/PWA_Clientes/css/detalleOrden.css',
    '/PWA_Clientes/css/finalizarCompra.css',
    '/PWA_Clientes/css/index.css',
    '/PWA_Clientes/css/login.css',
    '/PWA_Clientes/css/menuDia.css',
    '/PWA_Clientes/css/pedidos.css',
    '/PWA_Clientes/css/reclamos.css',
    '/PWA_Clientes/css/registro.css',
    '/PWA_Clientes/images/Bebidas.png',
    '/PWA_Clientes/images/BFamiliar.png',
    '/PWA_Clientes/images/carrito.png',
    '/PWA_Clientes/images/Entrada1.jpg',
    '/PWA_Clientes/images/Entrada2.jpg',
    '/PWA_Clientes/images/Entrada3.jpg',
    '/PWA_Clientes/images/Entradas.png',
    '/PWA_Clientes/images/Facebook.png',
    '/PWA_Clientes/images/Google play.png',
    '/PWA_Clientes/images/Instagram.png',
    '/PWA_Clientes/images/Pizza1.jpg',
    '/PWA_Clientes/images/Pizza2.jpg',
    '/PWA_Clientes/images/Pizza3.jpg',
    '/PWA_Clientes/images/Pizza4.jpg',
    '/PWA_Clientes/images/Pizza5.jpg',
    '/PWA_Clientes/images/Pizza6.jpg',
    '/PWA_Clientes/images/PizzaP.png',
    '/PWA_Clientes/images/Pizzas.png',
    '/PWA_Clientes/images/Postre1.jpg',
    '/PWA_Clientes/images/Postre2.jpg',
    '/PWA_Clientes/images/Postre3.jpg',
    '/PWA_Clientes/images/Postres.png',
    '/PWA_Clientes/images/Promo_Online.png',
    '/PWA_Clientes/images/Promocion_Dia.png',
    '/PWA_Clientes/images/Ticket.png',
    '/PWA_Clientes/images/Twitter.png',
    '/PWA_Clientes/images/User.png',
    '/PWA_Clientes/images/v71_74.png',
    '/PWA_Clientes/js/finalizarCompra.js',
    '/PWA_Clientes/js/login.js',
    '/PWA_Clientes/js/menuDia.js',
    '/PWA_Clientes/js/pedidos.js',
    '/PWA_Clientes/js/registro.js',
    '/PWA_Clientes/js/verPedido.js',
    '/PWA_Clientes/FinalizarCompra.html',
    '/PWA_Clientes/login.html',
    '/PWA_Clientes/menuDia.html',
    '/PWA_Clientes/Pedidos.html',
    '/PWA_Clientes/Reclamos.html',
    '/PWA_Clientes/Registro.html',
    '/PWA_Clientes/verPedido.html',
    
    // Rutas de PWA Repartidor
    '/PWA_Repartidor/index.html',
    '/PWA_Repartidor/css/detalleOrden.css',
    '/PWA_Repartidor/css/index.css',
    '/PWA_Repartidor/images/Bebidas.png',
    '/PWA_Repartidor/images/BFamiliar.png',
    '/PWA_Repartidor/images/carrito.png',
    '/PWA_Repartidor/images/Entrada1.jpg',
    '/PWA_Repartidor/images/Entrada2.jpg',
    '/PWA_Repartidor/images/Entrada3.jpg',
    '/PWA_Repartidor/images/Entradas.png',
    '/PWA_Repartidor/images/Facebook.png',
    '/PWA_Repartidor/images/Google play.png',
    '/PWA_Repartidor/images/Instagram.png',
    '/PWA_Repartidor/images/notificacion.svg',
    '/PWA_Repartidor/images/Pizza1.jpg',
    '/PWA_Repartidor/images/Pizza2.jpg',
    '/PWA_Repartidor/images/Pizza3.jpg',
    '/PWA_Repartidor/images/Pizza4.jpg',
    '/PWA_Repartidor/images/Pizza5.jpg',
    '/PWA_Repartidor/images/Pizza6.jpg',
    '/PWA_Repartidor/images/PizzaP.png',
    '/PWA_Repartidor/images/Pizzas.png',
    '/PWA_Repartidor/images/Postre1.jpg',
    '/PWA_Repartidor/images/Postre2.jpg',
    '/PWA_Repartidor/images/Postre3.jpg',
    '/PWA_Repartidor/images/Postres.png',
    '/PWA_Repartidor/images/Promo_Online.png',
    '/PWA_Repartidor/images/Promocion_Dia.png',
    '/PWA_Repartidor/images/Ticket.png',
    '/PWA_Repartidor/images/Twitter.png',
    '/PWA_Repartidor/images/User.png',
    '/PWA_Repartidor/images/v71_74.png',
    '/PWA_Repartidor/js/delivery.js',
    '/PWA_Repartidor/js/responsive.js',
    '/PWA_Repartidor/detalleOrden.html',

    // Rutas de Common
    '/Common/js/api.js',
    '/Common/js/auth.js',
    '/Common/js/utils.js',

    // Iconos
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',

    // Otros archivos relevantes
    '/index.html',
    '/manifest.json',
    '/service-worker.js'
];

// Instala el Service Worker y cachea los recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercepta las solicitudes de red para servir contenido cacheado
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Actualiza el Service Worker y limpia el caché viejo
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
