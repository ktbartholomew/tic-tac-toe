# Tic Tac Toe

This is a real-time Tic-Tac-Toe game. The front-end consists of HTML5 Canvas to draw the game board, and WebSockets to pass two-way game information and statistics in real-time. The back-end consists of an NGINX proxy that also serves the static assets, several Node.js WebSocket handlers, a Redis pub/sub queue, and RethinkDB for persistent storage.

The entire stack runs in handful of Docker containers, and is super-easy to deploy on a platform like [Carina](https://getcarina.com/).

[Play the game](https://tictac.io/)

### Installation

1. First, [clone the GitHub repo](https://github.com/ktbartholomew/tic-tac-toe). This repo contains all of the application code and Docker scripts needed to start the right containers and run the entire application.
1. Copy `env.example` to a new file named `env` and set the environment variables with values that are appropriate for your environment. For simplicity, set `NGINX_SSL` to `0` to avoid the extra complication of getting certificates from Let's Encrypt.
1. Run the following admin scripts, in this order:
  1. `script/create-db-data`
  1. `script/create-redis-data`
  1. `script/create-letsencrypt-data`
  1. `script/create-htpasswd-data`
  1. `script/create-redis-data`
  1. `script/create-frontend-data`
  1. `script/build-app`
  1. `script/build-nginx-proxy`
  1. `script/start-db`
  1. `script/start-redis`
  1. `script/update-frontend`
  1. `script/start-app 2 blue`
  1. `script/update-nginx blue`
  1. `script/start-nginx-proxy`
