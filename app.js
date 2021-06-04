import sw2express from "sw2express";
import helloMinecraftAPI from "./main.js";

const app = new sw2express({
  logger: process.env.NODE_ENV !== "production",
  cluster: process.env.CLUSTER || 4,
  ETag: true,
});

app.extend(helloMinecraftAPI({}));

app.hello_minecraft_api();

if (typeof module !== "undefined") {
  module.exports = async (req, rep) => {
    const func = await app.makeNewHandler("VERCEL");
    await func(req, rep);
  };
} else {
  app.listen(process.env.PORT || 8080);
}
