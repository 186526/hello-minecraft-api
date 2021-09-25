import minecraftAPI from "minecraft-protocol";

export default (config) => (app) => {
  app.use(
    (req, rep, registerPrefix) =>
      new Promise((resolve, reject) => {
        const id = rep.responseID;
        const startTime = new Date().getTime();

        const host = req.path.replace(registerPrefix, "").split(":");

        if (host.length > 2) {
          rep.json({
            sucess: false,
            msg: "invalid host",
          });
          resolve(null);
        }

        console.logHelloMinecraftAPI(
          `\nRequest ID: ${id} Running.\nPing on ${host[0]}:${
            typeof host[1] === "string" ? host[1] : 25565
          }...`
        );

        ping(host[0], host[1])
          .then((result) => {
            console.logHelloMinecraftAPI(
              `\nRequest ID: ${id} Finish.\n${JSON.stringify(result)}\n`
            );
            rep.setHeader(
              "X-Runtime",
              `${new Date().getTime() - startTime} ms`
            );
            rep.json({
              sucess: true,
              msg: result,
            });
            resolve();
          })
          .catch((error) => {
            console.logHelloMinecraftAPI(
              `\nRequest ID: ${id} Error.\n${JSON.stringify(error)}\n`
            );
            rep.setHeader(
              "X-Runtime",
              `${new Date().getTime() - startTime} ms`
            );
            rep.statusCode = 400;
            rep.json({ sucess: false, msg: error });
            resolve();
          });
      })
  );
};

export const ping = (host, port = 25565) =>
  new Promise((resolve, reject) => {
    minecraftAPI.ping(
      {
        host: host,
        port: port,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
