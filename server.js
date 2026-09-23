// Custom production entry point for hosts that run a Node app via a single
// startup file rather than `npm start` (e.g. Hostinger's hPanel "Node.js
// App" feature, which uses Phusion Passenger under the hood and expects one
// JS file it invokes directly with `node server.js`). Wraps Next.js's own
// programmatic server API — this is the pattern Next.js itself documents
// for custom servers: https://nextjs.org/docs/app/guides/custom-server
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
