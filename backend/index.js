const express = require("express");
const scanLAN = require("./lanScanner");
const app = express();
const PORT = 5000;

app.get("/scan", async (req, res) => {
  console.log("Manual LAN scan triggered...");
  const sites = await scanLAN();
  res.json(sites);
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  //  RUN ONE SCAN IMMEDIATELY ON START
  console.log("Initial LAN scan...");
  const initialSites = await scanLAN();
  console.log("Initial discovered sites:", initialSites);

  setInterval(async () => {
    console.log("Auto LAN scan started...");
    const sites = await scanLAN();

    console.log("Discovered sites:", sites);

  }, 3 * 60 * 1000);
});
