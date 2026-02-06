const axios = require("axios");

const BASE_IP = "192.168.29."; 
const PORTS = [80, 3000, 5000, 5173, 8080, 5174, 5175];

async function checkHost(ip) {
  for (let port of PORTS) {
    try {
      const res = await axios.get(`http://${ip}:${port}`, {
        timeout: 1500,
      });

      const titleMatch = res.data.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "No Title";

      return {
        ip,
        port,
        url: `http://${ip}:${port}`,
        title,
      };
    } catch (err) {

    }
  }
  return null;
}

async function scanLAN() {
  let found = [];

  const promises = [];

  for (let i = 1; i < 255; i++) {
    const ip = BASE_IP + i;
    promises.push(checkHost(ip));
  }

  const results = await Promise.all(promises);

  results.forEach(site => {
    if (site) {
      console.log("Website found:", site);
      found.push(site);
    }
  });

  return found;
}

module.exports = scanLAN;
