import express from "express";
import axios from "axios";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// API KEYS
const FINNHUB_API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg";
const TWELVE_API_KEY = "96c92ea18dfd481495a9c4e557c1d9b8";

// --- MONGO CONNECTION ---
// const MONGO_URI = "mongodb://127.0.0.1:27017/entity_pulse_users";
const MONGO_URI = "mongodb+srv://jayashree52:Tekiindu07@cluster0.oyco3gx.mongodb.net/?appName=Cluster0";
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);


// History Schema
const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sentence: {
    type: String,
    required: true,
  },
  sentimentResult: {
    type: Object, // { label: "Positive", score: 0.9 }
    required: true,
  },
   entities: {
    type: Array, // ✅ store entity objects like { entityName, sentiment, confidence }
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const History = mongoose.model("History", historySchema);

// -------------------------------
// 🧠 Helper Function (for sentiment aggregation)
// -------------------------------
export async function aggregateSentiment(allNews, today, companyName) {
  const sentimentBuckets = {
    "This Week": { positive: 0, neutral: 0, negative: 0, total: 0 },
    "Last Week": { positive: 0, neutral: 0, negative: 0, total: 0 },
    "Last Month": { positive: 0, neutral: 0, negative: 0, total: 0 },
  };

  const msPerDay = 24 * 60 * 60 * 1000;
  const todayMs = today.getTime();

  const sentimentPromises = allNews.map(async (item) => {
    const itemDate = new Date(item.datetime * 1000);
    const ageInDays = Math.floor((todayMs - itemDate.getTime()) / msPerDay);
    if (ageInDays > 29) return null;

    let classification = "Neutral";

    try {
      const response = await axios.post(
        "http://localhost:5001/analyze-text-ner-sentiment",
        {
          text: item.headline,
          summary: item.summary,
          entity: companyName,
        }
      );
      classification = response.data.overallSentiment || "Neutral";
    } catch (err) {
      console.error("Error calling Python service:", err.message);
    }

    let bucketName;
    if (ageInDays <= 6) bucketName = "This Week";
    else if (ageInDays <= 13) bucketName = "Last Week";
    else bucketName = "Last Month";

    const bucket = sentimentBuckets[bucketName];
    if (bucket) {
      bucket.total++;
      if (classification === "Positive") bucket.positive++;
      else if (classification === "Negative") bucket.negative++;
      else bucket.neutral++;
    }

    return { ...item, sentiment: classification };
  });

  const newsWithSentiment = (await Promise.all(sentimentPromises)).filter(
    (n) => n !== null
  );

  const trendResults = Object.keys(sentimentBuckets).map((period) => {
    const bucket = sentimentBuckets[period];
    const total = bucket.total;
    if (total === 0)
      return {
        period,
        positive: 0,
        neutral: 0,
        negative: 0,
        mainSentiment: "Neutral",
        totalArticles: 0,
      };

    const positive = Math.round((bucket.positive / total) * 100);
    const negative = Math.round((bucket.negative / total) * 100);
    const neutral = Math.round((bucket.neutral / total) * 100);

    let mainSentiment = "Neutral";
    if (positive > negative && positive > neutral) mainSentiment = "Positive";
    else if (negative > positive && negative > neutral)
      mainSentiment = "Negative";

    return {
      period,
      positive,
      neutral,
      negative,
      mainSentiment,
      totalArticles: total,
    };
  });

  return { trendData: trendResults, newsWithSentiment };
}



// -------------------------------
// 🧩 HISTORY ROUTES
// -------------------------------

// Create new history record
app.post("/api/history", async (req, res) => {
  try {
    const { userId, sentence, sentimentResult, entities } = req.body;

    if (!userId || !sentence || !sentimentResult) {
      return res
        .status(400)
        .json({ error: "Missing userId, sentence or sentimentResult" });
    }

    const newHistory = await History.create({
      userId,
      sentence,
      sentimentResult,
      entities: entities || [], // ✅ Save entities if available
    });

    res.status(201).json(newHistory);
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
});



// Get all history for a user
app.get("/api/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await History.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get single record
app.get("/api/history/detail/:id", async (req, res) => {
  try {
    const historyItem = await History.findById(req.params.id);
    res.json(historyItem);
  } catch (err) {
    res.status(404).json({ error: "Record not found" });
  }
});





// ------------------------------
// AUTH ROUTES
// ------------------------------
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists!" });

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });
    if (user.password !== password)
      return res.status(400).json({ message: "Incorrect password!" });

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// COMPANY DETAILS ENDPOINT
// ------------------------------
app.get("/get-company-details/:entityName", async (req, res) => {
  const entityName = req.params.entityName.toLowerCase();

  try {
    const searchRes = await axios.get(
      `https://finnhub.io/api/v1/search?q=${entityName}&token=${FINNHUB_API_KEY}`
    );

    const results = searchRes.data.result;
    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const result =
      results.find((r) => r.type === "Common Stock") || results[0];
    const symbol = result.symbol;

    const profileRes = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    const sentimentOptions = ["positive", "neutral", "negative"];
    const randomSentiment =
      sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
    const confidence = Math.floor(Math.random() * 30) + 70;

    const company = {
      name: profileRes.data.name,
      industry: profileRes.data.finnhubIndustry,
      description: profileRes.data.description || "No description available",
      marketCap: profileRes.data.marketCapitalization,
      sentiment: randomSentiment,
      confidence: confidence,
      symbol: symbol,
    };

    res.json(company);
  } catch (err) {
    console.error("Error fetching company data:", err.message);
    res.status(500).json({ error: "Failed to fetch company data" });
  }
});

// ------------------------------
// TEXT SENTIMENT ANALYSIS
// ------------------------------
app.post("/get-text-data-analysis-results", async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const response = await axios.post(
      "http://127.0.0.1:5001/analyze-text-ner-sentiment",
      { text }
    );
    return res.json(response.data);
  } catch (err) {
    console.error("Error calling Python service:", err.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

// ------------------------------
// STOCK PRICE HISTORY
// ------------------------------
app.get("/get-current-price-market-cap/:entitySymbol", async (req, res) => {
  const entitySymbol = req.params.entitySymbol.toUpperCase();

  try {
    const priceData = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${entitySymbol}&token=${FINNHUB_API_KEY}`
    );

    const profileData = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${entitySymbol}&token=${FINNHUB_API_KEY}`
    );

    const data = {
      symbol: entitySymbol,
      currentPrice: priceData.data.c,
      highPrice: priceData.data.h,
      lowPrice: priceData.data.l,
      openPrice: priceData.data.o,
      previousClose: priceData.data.pc,
      marketCap: profileData.data.marketCapitalization,
      companyName: profileData.data.name,
      industry: profileData.data.finnhubIndustry,
      country: profileData.data.country,
    };

    res.json(data);
  } catch (e) {
    console.log("Error fetching stock data: ", e.message);
    res.status(500).json({ error: "Error fetching stock data" });
  }
});

// ------------------------------
// TOP-3 NEWS ANALYSIS ENDPOINT
// ------------------------------
app.get("/news-analysis", async (req, res) => {
  console.log("Request for TOP-3 news analysis made.");
  console.log("req query:", req.query);

  const symbol = (req.query.symbol || "").toUpperCase();
  const companyName = req.query.companyName || "";

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol in query" });
  }

  const http = axios.create({ timeout: 12000 });

  try {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 14);

    const from = fromDate.toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);

    const newsResp = await http.get(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );

    const allNews = Array.isArray(newsResp.data) ? newsResp.data : [];

    if (!allNews.length) {
      return res.json({ headlines: [], asOf: to, count: 0 });
    }

    const top3 = allNews
      .slice()
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, 3);

    // First try batch sentiment
    let sentiments = [];
    try {
      const batchItems = top3.map((item) => ({
        text: item.headline,
        summary: item.summary,
        entity: companyName,
      }));

      const py = await http.post(
        "http://127.0.0.1:5001/analyze-batch",
        { items: batchItems }
      );

      sentiments = py?.data?.results || [];
    } catch (batchErr) {
      console.warn("Batch sentiment failed, falling back:", batchErr?.message);

      // fallback: call individually
      sentiments = await Promise.all(
        top3.map(async (item) => {
          try {
            const py = await http.post(
              "http://127.0.0.1:5001/analyze-text-ner-sentiment",
              {
                text: item.headline,
                summary: item.summary,
                entity: companyName,
              }
            );

            return {
              overallSentiment: py?.data?.overallSentiment || "Neutral",
            };
          } catch (e) {
            return { overallSentiment: "Neutral" };
          }
        })
      );
    }

    const analyzed = top3.map((item, idx) => ({
      headline: item.headline,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
      image: item.image || null,
      category: item.category || null,
      sentiment: sentiments[idx]?.overallSentiment || "Neutral",
    }));

    return res.json({
      headlines: analyzed,
      asOf: to,
      count: analyzed.length,
    });
  } catch (e) {
    console.error("Error fetching top-3 news:", e.message);
    return res.status(500).json({ error: "Failed to fetch news." });
  }
});

// ------------------------------
// OCR IMAGE → TEXT EXTRACTION
// ------------------------------
app.post(
  "/extract-text",
  express.raw({ type: "application/octet-stream", limit: "20mb" }),
  async (req, res) => {
    const imageBuffer = req.body;

    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      return res.status(400).json({ error: "Empty image body" });
    }

    try {
      const ocrResp = await axios.post(
        "http://127.0.0.1:5002/extract-text",
        imageBuffer,
        {
          headers: { "Content-Type": "application/octet-stream" },
          responseType: "json",
        }
      );

      const extracted =
        ocrResp.data?.extracted_text ||
        ocrResp.data?.text ||
        ocrResp.data?.data ||
        "";

      return res.json({ extracted_text: extracted });
    } catch (err) {
      console.error(
        "Error in OCR extraction:",
        err?.response?.data || err.message
      );
      return res.status(500).json({ error: "Failed to extract text" });
    }
  }
);

// ------------------------------
app.get("/social-sentiment-summary");
app.get("/platform-sentiment-breakdown");

// ------------------------------
app.get("/stock-price-history/:entitySymbol", async (req, res) => {
  console.log("Request for stock price history.");
  const symbol = req.params.entitySymbol.toUpperCase();

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=365&apikey=${TWELVE_API_KEY}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (e) {
    console.log("Error fetching stock history:", e.message);
    res.status(500).json({ error: "Error fetching stock history" });
  }
});

// ------------------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
