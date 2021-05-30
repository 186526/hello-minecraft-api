export default async (req, rep) => {
  rep.headers = Object.assign(
    {
      Accept: "application/json",
      "Cache-Control": "max-age=600, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Max-Age": "86400000",
      "Access-Control-Request-Headers": "Content-Type",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    },
    rep.headers
  );
  delete rep.headers["X-Served-By"];
  rep.headers["Server"] = `Hello,Minecraft API`;
};
