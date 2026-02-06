import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Search from "./models/Search.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect DB
await connectDB();

// Test route
app.get("/", (req, res) => {
  res.send(" N-jin backend running");
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
