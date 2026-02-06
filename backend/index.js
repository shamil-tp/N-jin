require('dotenv').config();

const express = require("express");
const connectDB = require("./config/db");
const Search = require("./models/Search");
const saveSitesToDB = require("./services/indexer");


const scanLAN = require("./lanScanner");
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175",process.env.FRONTEND_URL],
}))
app.use(express.urlencoded({extended:true}))
app.use(express.json());

connectDB();

app.get("/",(req, res) => {
  res.send("🚀 N-jin backend running");
});
app.post("/api/search",async (req,res)=>{
  console.log(req.body)
  const results = await Search.find( { $text: { $search: req.body.query } }, 
    { score: { $meta: "textScore" } } ).sort({ score: { $meta: "textScore" } });
  return res.status(200).json({success:true,results})
})
app.post("/index", async (req, res) => {
  try {
    const doc = await Search.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
  }, 30 * 1000);
});
