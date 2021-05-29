const getReallyPrefix = (relativePrefix, globalPrefix) => {
  const prefix = new URL("http://sw2express.localhost");
  prefix.pathname = globalPrefix;
  const reallyPrefix = new URL(relativePrefix, prefix.href);
  return reallyPrefix.pathname;
};

export default {
  name: "register",

  func: (that) => (func, globalPrefix = "/") => {
    const app = {
      route: (prefix) => {
        const reallyRoute = that.route(getReallyPrefix(prefix, globalPrefix));
        return reallyRoute;
      },
      use: (Handler) => {
        that._registerMiddlewares.push({
          prefix: globalPrefix,
          Handler: Handler,
        });
      },
    };
    func(app);
    return that;
  },

  bootstrap: (app) => {
    app._register = true;
    app._registerMiddlewares = [];
    app.use(async (req, rep) => {
      for (let i of app._registerMiddlewares) {
        if (req.path.indexOf(i.prefix) === 0) {
          await i.Handler(req, rep);
        }
      }
    });
  },
};
