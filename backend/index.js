require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const Search = require('./models/Search');
const saveSitesToDB = require('./services/indexer');

const scanLAN = require('./lanScanner');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
	cors({
		origin: [
			'http://localhost:5173',
			'http://localhost:5174',
			'http://localhost:5175',
			process.env.FRONTEND_URL,
		],
	})
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
	res.send('🚀 N-jin backend running');
});


app.get("/api/search", async (req, res) => {
  try {
    let { q, page = 1, limit = 10 } = req.query

    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 10;

    const STOP_WORDS = ["the", "is", "at", "on", "of", "a", "an", "and"]

    const normalizeQuery = (query) =>
      query .toLowerCase() .trim() .replace(/[^\w\s]/gi, "") .replace(/\s+/g, " ");

    const removeStopWords = (query) =>
      query
        .split(" ")
        .filter(word => !STOP_WORDS.includes(word))
        .join(" ");

    q = normalizeQuery(q);
    q = removeStopWords(q);

    //Check if query becomes empty after cleaning

    if (q.length < 2) {
      return res.status(400).json({ message: "Query too short" });
    }

    // Calculate skip value for pagination

    const skip = (page - 1) * limit


    const totalResults = await Search.countDocuments({
      $text: { $search: q }
    });

    // Fetch paginated search results
    
    const results = await Search.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      results,
    });

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})



app.post("/index", async (req, res) => {
  try {
    const doc = await Search.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/index', async (req, res) => {
	try {
		const doc = await Search.create(req.body);
		res.status(201).json(doc);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.get('/scan', async (req, res) => {
	console.log('Manual LAN scan triggered...');
	const sites = await scanLAN();

	await saveSitesToDB(sites);

	res.json({ message: 'Scan complete & indexed', count: sites.length });
});

app.listen(PORT, () => {
	console.log(`Server running on port http://localhost:${PORT}`);

	setInterval(async () => {
		console.log('Auto LAN scan started...');
		const sites = await scanLAN();
		await saveSitesToDB(sites);
	}, 30 * 1000);

	(async () => {
		console.log('Initial LAN scan started...');
		const initialSites = await scanLAN();
		await saveSitesToDB(initialSites);
		console.log('Initial LAN scan finished');
	})();
});
