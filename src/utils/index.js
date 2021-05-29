import {resolve4 as resolver} from "dns";
export const randomString = (r = 32) => {
  let s = "0123456789",
    n = s.length,
    t = "";
  for (let o = 0; o < r; o++) t += s.charAt(Math.floor(Math.random() * n));
  return t;
};
export const resolve4 = (host) => new Promise((resolve, reject) => {
  resolver(host,(error, result) => {
    if(error) reject(error);
    else resolve(result);
  })
});