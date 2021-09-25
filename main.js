import sw2expressRegister from "./src/plugins/sw2express.register.js";
import ping from "./src/api/ping.js";
import pingSVG from "./src/api/svg.js";
import middleware from "./src/middlewares/index.js";
import { isMaster } from "cluster";
import { env } from "process";

export default ({
  enableCache = true,
  logger = env.NODE_ENV !== "production",
}) => {
  if (logger) {
    console.logHelloMinecraftAPI = console.log;
  } else {
    console.logHelloMinecraftAPI = () =>
      "Running at Production Mode, Can't Use console.logHelloMinecraftAPi()";
  }
  const config = {
    enableCache: enableCache,
  };
  return {
    name: "hello_minecraft_api",
    func: (that) => () => {
      if (isMaster) {
        console.log(
          `Hello,Minecraft API loading status is ${that._helloMinecraftAPI.status}`
        );
      }
    },
    bootstrap: (app) => {
      if (typeof app._helloMinecraftAPI === "undefined") {
        app._helloMinecraftAPI = {};
      } else {
        throw new Error("Hello Minecraft API has been loaded");
      }

      try {
        app.extend(sw2expressRegister);
        app.use(middleware);

        app.register((app)=>{
          app.use(async(req,rep)=>{
            rep.setHeader('X-Request-ID',rep.responseID);
          })
        },"/api/");

        app.register(ping(config), "/api/ping/");
        app.register(pingSVG(config), "/api/ping-svg/");
        app.register(pingSVG(config), "/api/svg/");

        app.route("/api/").all(async (req, rep) => "200 OK");
      } catch (err) {
        app._helloMinecraftAPI.status = "failed";
        throw err;
      }
      app._helloMinecraftAPI.status = "sucessful";
    },
  };
};
