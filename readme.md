Pour server :

HTTP_PORT (8090), TCP_PORT(5555) commande pour lancer : node dist/index.js server 8090 5555

Pour worker : Nombre de threads : 12 server socket : "127.0.0.1:5555" Commande pour lancer : node dist/index.js worker 127.0.0.1:5555 12