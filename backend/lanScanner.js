const axios = require("axios");
const cheerio = require("cheerio");

const BASE_IP = "192.168.29.";
const PORTS = [80, 3000, 5000, 5173, 8080];

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function extractKeywords($) {
  const meta = $('meta[name="keywords"]').attr("content");
  if (!meta) return [];
  return meta.split(",").map(k => k.trim().toLowerCase());
}

function generateTitleKeywords(title) {
  if (!title) return [];

  const clean = title.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);

  let keywords = new Set();

  // Add individual words
  words.forEach(w => keywords.add(w));

  // Add full title
  keywords.add(clean);

  // Add combinations
  if (words.length > 1) {
    for (let i = 0; i < words.length - 1; i++) {
      keywords.add(words[i] + " " + words[i + 1]);
    }
  }

  // 🔥 Add common synonyms
  const synonymMap = {
    login: ["sign in", "signin", "log in"],
    logout: ["sign out", "signout"],
    dashboard: ["panel", "control panel"],
    register: ["signup", "sign up"],
  };

  words.forEach(word => {
    if (synonymMap[word]) {
      synonymMap[word].forEach(s => keywords.add(s));
    }
  });

  return Array.from(keywords);
}


async function checkHost(ip) {
  for (let port of PORTS) {
    try {
      const url = `http://${ip}:${port}`;
      const res = await axios.get(url, { timeout: 2000 });

      const $ = cheerio.load(res.data);

      const title = $("title").text().trim() || "No Title";

      // Remove non-visible elements
      $("script, style, noscript").remove();

      // Extract readable text
      const content = $("body").text().replace(/\s+/g, " ").trim();

      const metaKeywords = extractKeywords($);
      
      const titleKeywords = generateTitleKeywords(title);

      const keywords = [...new Set([...metaKeywords, ...titleKeywords])];

      const domain = extractDomain(url);

      return {
        url,
        domain,
        ip,
        title,
        content: content.slice(0, 5000), // limit for DB
        keywords,
        indexedAt: new Date(),
      };

    } catch (err) {
      // ignore failed ports
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
      console.log("Website indexed:", site.url);
      found.push(site);
    }
  });

  return found;
}

module.exports = scanLAN;
