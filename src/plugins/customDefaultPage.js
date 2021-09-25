import crypto from "crypto";
import { readFileSync } from "fs";
const uuid = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );
const codeAlternative = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "Switch Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Time-out",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Request Entity Too Large",
  414: "Request-URI Too Large",
  415: "Unsupported Media Type",
  416: "Requested Range not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  426: "Upgrade Required",
  428: "Precondition Required", // RFC 6585
  429: "Too Many Requests",
  431: "Request Header Fields Too Large", // RFC 6585
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Time-out",
  505: "HTTP Version not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

const errorPage = readFileSync(
  decodeURIComponent(
    new URL("errorPage.html", import.meta.url).href.replace("file://", "")
  ),
  { encoding: "utf8" }
);

const getPage = ({
  statusCode = 404,
  explain = `Your request was landed on <a href="https://github.com/186526/hello-minecraft-api">Hello,Minecraft API</a>. But the page you requested is ${codeAlternative[
    statusCode
  ].toLowerCase()}.`,
  howtodo = `You can go to the <a href="/">homepage</a> of the website.`,
}) => {
  return async (req, rep) => {
    rep.statusCode = statusCode;
    rep.setHeader("Content-Type", "text/html; charset=utf-8");

    rep.end(
      errorPage
        .replaceAll("${statusCode}", statusCode)
        .replaceAll("${codeAlternative}", codeAlternative[statusCode])
        .replaceAll("${explain}", explain)
        .replaceAll("${howto}", howtodo)
        .replaceAll("${id}", rep.CustomDefaultPageRequestID)
        .replaceAll("${ServerStatus}", statusCode >= 500 ? "Error" : "Working")
        .replaceAll(
          "${ServerStatusLowerCase}",
          statusCode >= 500 ? "red" : "green"
        )
        .replaceAll("${ip}", rep.ip)
        .replaceAll(
          "${clientStatus}",
          statusCode < 500 && statusCode >= 400
            ? `Working but ${codeAlternative[statusCode]}`
            : "Working"
        )
        .replaceAll(
          "${clientStatusShort}",
          statusCode < 500 && statusCode >= 400 ? `yellow` : "green"
        )
    );
  };
};
export default {
  name: "customDefaultPage",
  func: (that) => that._customDefaultPage,
  bootstrap: async (that) => {
    if (that._customDefaultPage) {
      throw new Error("Custom Default Page is Loaded!");
    }
    that._customDefaultPage = true;

    that.use(async (req, rep) => {
      rep.set("CustomDefaultPageRequestID", uuid());
      rep.set("responseID", rep.CustomDefaultPageRequestID);
      rep.set(
        "ip",
        ((request) => {
          let answer = "";
          ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"].forEach((e) => {
            if (typeof request.headers[e] === "string") {
              answer = request.headers[e];
            }
          });
          if (answer === "" && typeof global !== "undefined") {
            answer =
              request.req.socket.remoteAddress.match(/\d+\.\d+\.\d+\.\d+/);
          }
          return answer;
        })(req)
      );
    });

    that.DefaultPage = {
      Code: function (statusCode) {
        return {
          GenAsync: async (req, rep) => {
            rep.statusCode = statusCode;
            rep.setHeader("Content-Type", "text/html; charset=utf-8");
            await getPage({
              statusCode: statusCode,
            })(req, rep);
          },
        };
      },
    };
  },
};
