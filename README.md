# WebRTC statistics

## Quick start

```sh
npm install # install all dependencies
npm run build # build the dist directory
npm run watch # watch source modifications and updates files in the dist directory
npm run serve # expose all files from the dist directory on http://localhost:5000
```

## Jitsi Meet

This projects also generate a custom analytics handler for Jitsi Meet, that sends statistics to a specific backend.

This assumes that your backend is reachable under http://localhost:3000, and accepts `POST` requests to `/`.

Here are the required steps if you want to try it live on your machine.

### Generate required files

First, you will need to install all npm dependencies and build the `dist` directory by using:

```sh
npm install
npm run build
```

In the `dist` directory, you will see that the two following files will be generated among some other one:

- `JitsiMeetAnalyticsHandler.js`
- `JitsiMeetAnalyticsHandler.min.js`

The second one is the minified version of the first one.

### Test it locally

To begin with, open a new shell and run `npm run serve`.
This will serve all built files at http://localhost:5000.
Leave this shell open.

In another shell, you will need to clone the https://github.com/jitsi/docker-jitsi-meet project.

```sh
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet # go in the directory where the repo was cloned
```

Do following steps to have it running:

```sh
cp env.example .env # create a .env file from the example
./gen-passwords.sh # generate some required passwords in the .env file
echo 'ENABLE_XMPP_WEBSOCKET=false' >> .env # disable XMPP websocket for now

# create configuration directories in ~/.jitsi-meet-cfg
mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
```

Run the stack by using `docker-compose up`.
Wait a few seconds to one minute the time it is starting and generates some files in `~/.jitsi-meet-cfg`.
Edit `~/.jitsi-meet-cfg/web/config` and in the `config.analytics.scriptURLs` array that you will have to uncomment, add `"http://localhost:5000/JitsiMeetAnalyticsHandler.min.js",`, to have something like it:

```js
var config = {
  // ...
  analytics: {
    scriptURLs: [
      "http://localhost:5000/JitsiMeetAnalyticsHandler.min.js",
      // ...
    ],
  },
  // ...
};
```

Open your Jitsi Meet instance at https://localhost:8443 or http://localhost:8000, for respectively the HTTPS or HTTP version, join a room, and you should start receiving some statistics on your backend.

### Use it in a production instance

You have a Jitsi Meet instance running somewhere.
Here are the steps to include our analytics handler to your instance.

First, you will need to host the version of your choice of the generated files (the recommended version to use is the minified one) somewhere, like a classic web server, a S3 bucket, a CDN… and expose it to a public URL.

Then, you will have to update the `config.js` file of your Jitsi Meet instance to include the script URL to the `config.analytics.scriptURLs` array.
