import sw2express from "sw2express";
import sw2expressRegister from "./src/plugins/sw2express.register.js";
import ping from "./src/api/ping.js";
import pingSVG from "./src/api/svg.js";
import middleware from "./src/middlewares/index.js";

const app = new sw2express({
  logger: true,
  cluster: 4,
  ETag: true,
});

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

app.extend(sw2expressRegister);
app.use(middleware);

app.register(ping, "/api/ping/");
app.register(pingSVG, "/api/ping-svg/");

app.route("/api/").all(async (req, rep) => "200 OK");

if (typeof module !== "undefined") {
  module.exports = async (req, rep) => {
    const func = await app.makeNewHandler("VERCEL");
    await func(req, rep);
  };
} else {
  app.listen(8080);
}
