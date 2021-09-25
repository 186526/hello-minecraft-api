import sw2express from "sw2express";
import cluster from "cluster";
import helloMinecraftAPI from "./main.js";
import customDefaultPage from "./src/plugins/customDefaultPage.js";
import https from "https";
import fs from "fs";

const app = new sw2express({
  logger: process.env.NODE_ENV !== "production",
  cluster: process.env.CLUSTER || 4,
  ETag: true,
});

app
  .extend(customDefaultPage)
  .then(() => app.extend(helloMinecraftAPI({})))
  .then(async(e) => {

    globalThis.app = app;
    const func = await app.makeNewHandler("VERCEL");

    if (typeof module !== "undefined") {
      module.exports = async (req, rep) => {
        await func(req, rep);
      };
    } else {
      app.listen(process.env.PORT || 8080);
      if(process.env.HTTPS_ENABLED) {
        const httpsServer = https.createServer({
          key:fs.readFileSync(process.env.HTTPS_KEY||"config/cert.key",{encoding: "utf8"}),
          cert:fs.readFileSync(process.env.HTTPS_CERT||"config/cert.pem",{encoding: "utf8"}),
        },func);
        if(cluster.isMaster) httpsServer.listen(process.env.HTTPS_PORT || 8443);
      }
    }
  });
