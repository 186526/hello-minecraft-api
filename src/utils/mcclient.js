import mc from "minecraft-protocol";
const CreateClient = ({ host, port, username = "Hello-Minecraft-API" }) => {
  const client = mc.createClient({
    host: host,
    port: port,
    username: username,
    password: "",
    auth: "mojang",
  });
  return new Promise((resolve, reject) => {
    client.on("session", () => {
      resolve(client);
    });
    client.on("error", () => {
      reject(client);
    });
  });
};
export default CreateClient;
