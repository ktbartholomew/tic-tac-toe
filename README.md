# Tic Tac Toe

This is a real-time Tic-Tac-Toe game. The front-end consists of HTML5 Canvas to draw the game board, and WebSockets to pass two-way game information and statistics in real-time. The back-end consists of an NGINX proxy that also serves the static assets, several Node.js WebSocket handlers, a Redis pub/sub queue, and RethinkDB for persistent storage.

The entire stack runs in a handful of Docker containers, and is super-easy to deploy on a platform like [Carina](https://getcarina.com/).

[Play the game](https://tictac.io/)

### Installation

**Before you start:** This application depends on overlay networks, so you'll need to run this on a Docker host that supports them. Any Carina cluster created after 2016-02-15 has this capability.

1. First, [clone the GitHub repo](https://github.com/ktbartholomew/tic-tac-toe). This repo contains all of the application code and Docker scripts needed to start the right containers and run the entire application.
1. Copy `env.example` to a new file named `env` and set the environment variables with values that are appropriate for your environment. For simplicity, set `NGINX_SSL` to `0` to avoid the extra complication of getting certificates from Let's Encrypt.
1. Run `script/setup`. This runs a long series of Bash scripts found in `script/` that create data volume containers, build custom images, and start the containers necessary to run the app.
1. Run `$(docker port ttt_nginx_proxy_1 80)` to get the public IP address of the NGINX proxy container. Visiting this IP address exposes the front-end of the tic-tac-toe game. Visiting `/live/` proxies to the WebSocket handlers, and visiting `/rethinkdb/` proxies to the RethinkDB web interface, if you've assigne a password to `${NGINX_RETHINKDB_PASS}`.

### Components

For the purpose of demonstration, the repo contains application code for several different components that would ideally be contained in separate repositories.

* `app/` contains a Node.js application that acts a WebSocket server for game clients. This application expects to have access to a RethinkDB server and a Redis server.
* `bot/` contains a very poorly-written WebSocket client that plays games of tic-tac-toe indefinitely. It "thinks" (twiddles its thumbs) for a random amount of time between 0.8 and 1.8 seconds, then picks a random available spot on the game board.
* `cron/` contains a simple Bash script that renews an SSL certificate from Let's Encrypt. When the cron container is running, the script runs and renews the certificate monthly.
* `db-schema/` contains a Node.js script that creates the databases, tables, and indexes the application needs to run.
* `frontend/` contains the SCSS and Javascript for the front-end of the game. It also contains Bash scripts to compile these assets into browser-ready assets.
* `nginx/` contains a [Nunjucks](https://mozilla.github.io/nunjucks/) template for an NGINX configuration file. This template is rendered by `script/update-nginx`, which then copies the final configuration file to the appropriate data container and tells NGINX to reload its config.

### Admin scripts

`script/` contains all the commands needed to set up and run the application's various containers. They all have pretty self-explanatory names. Each of the scripts is fairly idempotent, so they can be run multiple times without changing the overall state of the application too much.

**N.B:** `script/update-frontend` and `script/update-nginx` are Node.js command-line scripts, so you'll need a working Node environment on your local machine to run them. Sorry about that.
