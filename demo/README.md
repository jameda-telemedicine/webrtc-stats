# Jitsi Meet Statistics Demo

## Quick start

First, you will need to install all dependencies and build the library files in the parent directory:

```sh
cd .. # go in the parent directory
npm install # install dependencies
npm run build # build library files
cd demo # go in this directory back
```

Then you can run the stack using `docker-compose up --build -d`.

Open http://localhost:5001/ to see the demo running.

To see statistics logs, you can use `docker-compose logs -f backend`.

To stop and remove the stack, use: `docker-compose down`.

## Stack

Here is the list of all components used in this demo.

### `iframe`

This is a simple HTML page that use the external API of Jitsi Meet to display an instance of it into an iframe.

It also serves the builded file for the library.

It is configured to pass some data to the analytics handler included with this project.

It is listening on the 5001 port.

### `backend`

A simple application that get statistics sent using a `POST` request to `/`.

Statistics are displayed in the logs.
To access them when the stack is running, you can use `docker-compose logs -f backend`.

It is listening on the 3000 port.

### `jitsi`

The frontend part of Jitsi Meet.

It is listening on the following ports: 8000 for the http endpoint and 8443 for the https endpoint.

### `prosody`

XMPP server used by Jitsi Meet.

### `jicofo`

Focus component used by Jitsi Meet.

### `jvb`

Video bridge for Jitsi Meet.

It uses following ports: 10000/udp and 4443/tcp.
