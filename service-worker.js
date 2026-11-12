// ==========================================
// PAUSA5 SERVICE WORKER
// ==========================================

const CACHE_NAME =
    "pausa5-zeze-noche-v6.0";


const APP_SHELL = [

    "./",

    "./index.html",

    "./style.css",
    "./noche.css",
    "./noche.js",
    "./assets/desconexion-nocturna-3min.mp3",

    "./script.js",

    "./manifest.json",

    "./icon.svg",

    "./icon-maskable.svg",
    "./assets/zeze-triste.png",
    "./assets/zeze-cansado.png",
    "./assets/zeze-tranquilo.png",
    "./assets/zeze-ansioso.png",
    "./assets/zeze-feliz.png",
    "./assets/zeze-tenso.png"

];



// ==========================================
// INSTALAR
// ==========================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache => {

                        return cache.addAll(
                            APP_SHELL
                        );

                    }
                )
                .then(
                    () => {

                        return self.skipWaiting();

                    }
                )

        );

    }
);



// ==========================================
// ACTIVAR
// ==========================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    names => {

                        return Promise.all(

                            names

                                .filter(
                                    name => {

                                        return (

                                            name.startsWith(
                                                "pausa5-"
                                            )

                                            &&

                                            name !==
                                            CACHE_NAME

                                        );

                                    }
                                )

                                .map(
                                    name => {

                                        return caches.delete(
                                            name
                                        );

                                    }
                                )

                        );

                    }
                )
                .then(
                    () => {

                        return self.clients.claim();

                    }
                )

        );

    }
);



// ==========================================
// FETCH
// ==========================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }



        // Navegación:
        // intenta internet primero.

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    request
                )

                    .then(
                        response => {

                            if (
                                response &&
                                response.ok
                            ) {

                                const copy =
                                    response.clone();


                                caches
                                    .open(
                                        CACHE_NAME
                                    )
                                    .then(
                                        cache => {

                                            cache.put(
                                                request,
                                                copy
                                            );

                                        }
                                    );

                            }


                            return response;

                        }
                    )

                    .catch(
                        async () => {

                            const exacta =
                                await caches.match(
                                    request
                                );


                            if (
                                exacta
                            ) {

                                return exacta;

                            }


                            const inicio =
                                await caches.match(
                                    "./index.html"
                                );


                            if (
                                inicio
                            ) {

                                return inicio;

                            }


                            return Response.error();

                        }
                    )

            );


            return;

        }



        // Archivos estáticos:
        // usa caché y actualiza en segundo plano.

        event.respondWith(

            caches
                .match(
                    request
                )
                .then(
                    cached => {

                        const network =
                            fetch(
                                request
                            )

                                .then(
                                    response => {

                                        if (
                                            response &&
                                            response.ok
                                        ) {

                                            const copy =
                                                response.clone();


                                            caches
                                                .open(
                                                    CACHE_NAME
                                                )
                                                .then(
                                                    cache => {

                                                        cache.put(
                                                            request,
                                                            copy
                                                        );

                                                    }
                                                );

                                        }


                                        return response;

                                    }
                                )

                                .catch(
                                    () => {

                                        return cached ||
                                            Response.error();

                                    }
                                );


                        return cached ||
                            network;

                    }
                )

        );

    }
);