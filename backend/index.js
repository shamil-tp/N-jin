const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Search = require("./models/Search");
const saveSitesToDB = require("./services/indexer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect DB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("🚀 N-jin backend running");
});

// Sample insert route (for testing)
app.post("/index", async (req, res) => {
  try {
    const doc = await Search.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
const scanLAN = require("./lanScanner");

app.get("/scan", async (req, res) => {
  console.log("Manual LAN scan triggered...");
  const sites = await scanLAN();

  await saveSitesToDB(sites); 

  res.json({ message: "Scan complete & indexed", count: sites.length });
});


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  console.log("Initial LAN scan...");
  const initialSites = await scanLAN();
  await saveSitesToDB(initialSites);

  setInterval(async () => {
    console.log("Auto LAN scan started...");
    const sites = await scanLAN();
    await saveSitesToDB(sites);
  }, 3 * 60 * 1000);
});
