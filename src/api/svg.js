import { ping } from "./ping.js";
import * as utils from "../utils/index.js";
import { makeBadge, ValidationError } from "badge-maker";
import maxmind from 'maxmind';
import {isIPv4} from 'net';

try{
  maxmind.init('/usr/share/GeoIP/GeoIP.dat');
  globalThis.maxmindCheckIP = true;
}
catch(e){
  globalThis.maxmindCheckIP = false;
}

export default (app) => {
  app.use(
    (req, rep) =>
      new Promise((resolve, reject) => {
        const id = utils.randomString(8);

        const host = req.path.replace("/api/ping-svg/", "").split(":");

        if (host.length > 2) {
          rep.json({
            sucess: false,
            msg: "invalid host",
          });
          resolve(null);
        }

        console.log(
          `\nRequest ID: ${id} Ping SVG on ${host[0]}:${
            typeof host[1] === "string" ? host[1] : 25565
          }...`
        );

        const sendBadge = async(options) => {
          rep.setHeader("Content-Type", "image/svg+xml;charset=utf-8");
          rep.setHeader("X-Generator", "badge-maker");
          try {
            let badge = makeBadge(await options);
            rep.end(badge);
          } catch (e) {
            rep.end(`
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="206" height="20" role="img" aria-label="Error: badge-maker ValidationError"><title>Error: badge-maker ValidationError</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="206" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="37" height="20" fill="#555"/><rect x="37" width="169" height="20" fill="#9f9f9f"/><rect width="206" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="195" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="270">Error</text><text x="195" y="140" transform="scale(.1)" fill="#fff" textLength="270">Error</text><text aria-hidden="true" x="1205" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="1590">badge-maker ValidationError</text><text x="1205" y="140" transform="scale(.1)" fill="#fff" textLength="1590">badge-maker ValidationError</text></g></svg>`);
          }
          resolve();
        };

        ping(host[0], host[1])
          .then((answer) => {
            console.log(
              `\nRequest ID: ${id} Finish.\n${JSON.stringify(answer)}\n`
            );
            sendBadge(generateSVG(answer,host[0]));
          })
          .catch((error) => {
            console.log(
              `\nRequest ID: ${id} Error.\n${JSON.stringify(error)}\n`
            );
            sendBadge({
              label: "Error",
              message: JSON.stringify(error),
              color: "inactive",
            });
          });
      })
  );
};
export const generateSVG = (
  result,
  host,
  getImage = async(label, message, color) =>
    {
      let answer = {
        label: label,
        message: message,
        color: color,
      };
      try{
        if(globalThis.maxmindCheckIP){
          let v4 = isIPv4(host) ? host : (await utils.resolve4(host))[0];
          answer.message+=`| in ${maxmind.getCountry(v4).name}`;
        }
      }catch(err){
        console.log(err);
      }
      return answer;
    }
) => {
  let badgeName = typeof result.description.text !== "undefined" ? result.description.text : result.description;

  if(typeof result.description.extra === 'object'){
    result.description.extra.forEach(
      (description) => (badgeName += description.text)
    );
  }

  badgeName = badgeName.replace(/§./g, '');

  let badgeText = `${result.latency} ms | ${result.players.online}/${result.players.max} | ${result.version.name} Protocol@${result.version.protocol}`;
  let badgeColor = "successful";
  if (result.latency > 100) {
    badgeColor = "important";
  } else if (result.latency > 200) {
    badgeColor = "yellow";
  } else if (result.latency > 300) {
    badgeColor = "orange";
  }
  if (result.players.online == result.players.max) {
    badgeColor = "yellowgreen";
  }
  return getImage(badgeName, badgeText, badgeColor);
};
