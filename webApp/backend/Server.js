// // ------------------------------
// // ✅ Imports & Setup
// // ------------------------------
// import express from "express";
// import axios from "axios";
// import cors from "cors";
// import multer from "multer";
// import FormData from "form-data";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ storage: multer.memoryStorage() });

// // ------------------------------
// // ✅ API KEYS
// // ------------------------------
// const FINNHUB_API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg";
// const TWELVE_API_KEY = "96c92ea18dfd481495a9c4e557c1d9b8";

// // ------------------------------
// // ✅ Utility Function: Sentiment Aggregation
// // ------------------------------
// function aggregateSentiment(allNews, today) {
//   const sentimentBuckets = {
//     "This Week": { positive: 0, neutral: 0, negative: 0, total: 0 },
//     "Last Week": { positive: 0, neutral: 0, negative: 0, total: 0 },
//     "Last Month": { positive: 0, neutral: 0, negative: 0, total: 0 },
//   };

//   const msPerDay = 24 * 60 * 60 * 1000;
//   const todayMs = today.getTime();

//   const newsWithSentiment = allNews
//     .map((item) => {
//       const itemDate = new Date(item.datetime * 1000);
//       const ageInDays = Math.floor((todayMs - itemDate.getTime()) / msPerDay);

//       // Placeholder sentiment classification (replace with model output)
//       const classification = ["Positive", "Negative", "Neutral"][
//         Math.floor(Math.random() * 3)
//       ];

//       let bucketName;
//       if (ageInDays >= 0 && ageInDays <= 6) bucketName = "This Week";
//       else if (ageInDays >= 7 && ageInDays <= 13) bucketName = "Last Week";
//       else if (ageInDays >= 14 && ageInDays <= 29) bucketName = "Last Month";
//       else return null;

//       const bucket = sentimentBuckets[bucketName];
//       bucket.total++;
//       if (classification === "Positive") bucket.positive++;
//       else if (classification === "Negative") bucket.negative++;
//       else bucket.neutral++;

//       return { ...item, sentiment: classification, ageInDays, bucketName };
//     })
//     .filter((n) => n !== null);

//   const trendResults = Object.keys(sentimentBuckets).map((period) => {
//     const bucket = sentimentBuckets[period];
//     const total = bucket.total;

//     if (total === 0)
//       return {
//         period,
//         positive: 0,
//         neutral: 0,
//         negative: 0,
//         mainSentiment: "Neutral",
//         totalArticles: 0,
//       };

//     const positive = Math.round((bucket.positive / total) * 100);
//     const negative = Math.round((bucket.negative / total) * 100);
//     const neutral = Math.round((bucket.neutral / total) * 100);

//     let mainSentiment = "Neutral";
//     if (positive > negative && positive > neutral) mainSentiment = "Positive";
//     else if (negative > positive && negative > neutral)
//       mainSentiment = "Negative";

//     return {
//       period,
//       positive,
//       neutral,
//       negative,
//       mainSentiment,
//       totalArticles: total,
//     };
//   });

//   return { trendData: trendResults, newsWithSentiment };
// }

// // ------------------------------
// // ✅ OCR Endpoint (Image → Text)
// // ------------------------------
// app.post("/api/image-text", upload.single("image"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   try {
//     const response = await axios.post(
//       "http://127.0.0.1:5001/extract-text",
//       req.file.buffer,
//       {
//         headers: { "Content-Type": "application/octet-stream" },
//       }
//     );
//     console.log("Received image bytes length:", req.file.buffer.length);
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error calling Flask OCR service:", error.message);
//     res.status(500).json({ error: "OCR failed" });
//   }
// });

// // ------------------------------
// // ✅ Voice → Text Endpoint
// // ------------------------------
// app.post("/api/voice-to-text", upload.single("audio"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

//   try {
//     const formData = new FormData();
//     formData.append("audio", req.file.buffer, {
//       filename: "recording.wav",
//       contentType: "audio/wav",
//     });

//     const response = await axios.post(
//       "http://127.0.0.1:5002/voice-to-text",
//       formData,
//       { headers: formData.getHeaders() }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error("Error calling Flask voice service:", error.message);
//     res.status(500).json({ error: "Voice to text conversion failed" });
//   }
// });

// // ------------------------------
// // ✅ Text Input → Entity & Sentiment Analysis
// // ------------------------------
// app.post("/get-text-data-analysis-results", async (req, res) => {
//   const text = req.body.text;
//   if (!text) return res.status(400).json({ error: "Missing text" });

//   try {
//     const response = await axios.post(
//       "http://localhost:5001/analyze-text-ner-sentiment",
//       { text }
//     );
//     res.json(response.data);
//   } catch (err) {
//     console.error("Error calling Python service:", err.message);
//     res.status(500).json({ error: "Python service failed" });
//   }
// });

// // ------------------------------
// // ✅ Get Company Details by Name
// // ------------------------------
// app.get("/get-company-details/:entityName", async (req, res) => {
//   const entityName = req.params.entityName.toLowerCase();
//   try {
//     const searchRes = await axios.get(
//       `https://finnhub.io/api/v1/search?q=${entityName}&token=${FINNHUB_API_KEY}`
//     );
//     const results = searchRes.data.result;
//     if (!results || results.length === 0)
//       return res.status(404).json({ error: "Company not found" });

//     const result =
//       results.find((r) => r.type === "Common Stock") || results[0];
//     const symbol = result.symbol;

//     const profileRes = await axios.get(
//       `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
//     );

//     const sentimentOptions = ["positive", "neutral", "negative"];
//     const randomSentiment =
//       sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
//     const confidence = Math.floor(Math.random() * 30) + 70;

//     res.json({
//       name: profileRes.data.name,
//       industry: profileRes.data.finnhubIndustry,
//       description: profileRes.data.description || "No description available",
//       marketCap: profileRes.data.marketCapitalization,
//       sentiment: randomSentiment,
//       confidence,
//       symbol,
//     });
//   } catch (err) {
//     console.error("Error fetching company data:", err.message);
//     res.status(500).json({ error: "Failed to fetch company data" });
//   }
// });

// // ------------------------------
// // ✅ Get Current Price and Market Cap
// // ------------------------------
// app.get("/get-current-price-market-cap/:entitySymbol", async (req, res) => {
//   const entitySymbol = req.params.entitySymbol.toUpperCase();
//   try {
//     const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${entitySymbol}&token=${FINNHUB_API_KEY}`;
//     const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${entitySymbol}&token=${FINNHUB_API_KEY}`;

//     const [priceData, profileData] = await Promise.all([
//       axios.get(priceUrl),
//       axios.get(profileUrl),
//     ]);

//     res.json({
//       symbol: entitySymbol,
//       currentPrice: priceData.data.c,
//       highPrice: priceData.data.h,
//       lowPrice: priceData.data.l,
//       openPrice: priceData.data.o,
//       previousClose: priceData.data.pc,
//       marketCap: profileData.data.marketCapitalization,
//       companyName: profileData.data.name,
//       industry: profileData.data.industry,
//       country: profileData.data.country,
//     });
//   } catch (e) {
//     console.error("Error fetching stock data:", e.message);
//     res.status(500).json({ error: "Error fetching current Price and Market Cap" });
//   }
// });

// // ------------------------------
// // ✅ Combined News Analysis (Headlines + Sentiment Trend)
// // ------------------------------
// app.get("/news-analysis/:entitySymbol", async (req, res) => {
//   const symbol = req.params.entitySymbol.toUpperCase();
//   const today = new Date();
//   const fromDate = new Date();
//   fromDate.setDate(today.getDate() - 30);

//   const from = fromDate.toISOString().slice(0, 10);
//   const to = today.toISOString().slice(0, 10);

//   try {
//     const newsURL = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
//     const response = await axios.get(newsURL);
//     const allNews = response.data;

//     const { trendData, newsWithSentiment } = aggregateSentiment(allNews, today);

//     const recentHeadlines = newsWithSentiment
//       .filter((item) => item.ageInDays >= 0 && item.ageInDays <= 6)
//       .slice(0, 3)
//       .map((item) => ({
//         headline: item.headline,
//         source: item.source,
//         url: item.url,
//         sentiment: item.sentiment,
//       }));

//     res.json({ headlines: recentHeadlines, trendData });
//   } catch (e) {
//     console.error("Error fetching news:", e.message);
//     res.status(500).json({ error: "Failed to fetch news analysis" });
//   }
// });

// // ------------------------------
// // ✅ Stock Price History
// // ------------------------------
// app.get("/stock-price-history/:entitySymbol", async (req, res) => {
//   const symbol = req.params.entitySymbol.toUpperCase();
//   try {
//     const stockHistoryURL = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=365&apikey=${TWELVE_API_KEY}`;
//     const response = await axios.get(stockHistoryURL);
//     res.json(response.data);
//   } catch (e) {
//     console.error("Error fetching stock price history:", e.message);
//     res.status(500).json({ error: "Failed to fetch stock history" });
//   }
// });

// // ------------------------------
// // ✅ Server Start
// // ------------------------------
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Backend running at http://localhost:${PORT}`);
// });


// ------------------------------
// ✅ Imports & Setup
// ------------------------------
import express from "express";
import axios from "axios";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import mongoose from "mongoose"; // 🧩 Added MongoDB
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ------------------------------
// ✅ API KEYS
// ------------------------------
const FINNHUB_API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg";
const TWELVE_API_KEY = "96c92ea18dfd481495a9c4e557c1d9b8";

// ------------------------------
// ✅ MongoDB Connection
// ------------------------------
const MONGO_URI =
  "mongodb+srv://sravanijanak_db_user:entity_pulse@cluster0.gil0gna.mongodb.net/?appName=Cluster0";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------------------
// ✅ User Schema
// ------------------------------
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// ------------------------------
// ✅ Utility Function: Sentiment Aggregation
// ------------------------------
function aggregateSentiment(allNews, today) {
  const sentimentBuckets = {
    "This Week": { positive: 0, neutral: 0, negative: 0, total: 0 },
    "Last Week": { positive: 0, neutral: 0, negative: 0, total: 0 },
    "Last Month": { positive: 0, neutral: 0, negative: 0, total: 0 },
  };

  const msPerDay = 24 * 60 * 60 * 1000;
  const todayMs = today.getTime();

  const newsWithSentiment = allNews
    .map((item) => {
      const itemDate = new Date(item.datetime * 1000);
      const ageInDays = Math.floor((todayMs - itemDate.getTime()) / msPerDay);

      const classification = ["Positive", "Negative", "Neutral"][
        Math.floor(Math.random() * 3)
      ];

      let bucketName;
      if (ageInDays >= 0 && ageInDays <= 6) bucketName = "This Week";
      else if (ageInDays >= 7 && ageInDays <= 13) bucketName = "Last Week";
      else if (ageInDays >= 14 && ageInDays <= 29) bucketName = "Last Month";
      else return null;

      const bucket = sentimentBuckets[bucketName];
      bucket.total++;
      if (classification === "Positive") bucket.positive++;
      else if (classification === "Negative") bucket.negative++;
      else bucket.neutral++;

      return { ...item, sentiment: classification, ageInDays, bucketName };
    })
    .filter((n) => n !== null);

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

// ------------------------------
// ✅ OCR Endpoint (Image → Text)
// ------------------------------
app.post("/api/image-text", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const response = await axios.post(
      "http://127.0.0.1:5001/extract-text",
      req.file.buffer,
      {
        headers: { "Content-Type": "application/octet-stream" },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask OCR service:", error.message);
    res.status(500).json({ error: "OCR failed" });
  }
});

// ------------------------------
// ✅ Voice → Text Endpoint
// ------------------------------
app.post("/api/voice-to-text", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

  try {
    const formData = new FormData();
    formData.append("audio", req.file.buffer, {
      filename: "recording.wav",
      contentType: "audio/wav",
    });

    const response = await axios.post(
      "http://127.0.0.1:5002/voice-to-text",
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask voice service:", error.message);
    res.status(500).json({ error: "Voice to text conversion failed" });
  }
});

// ------------------------------
// ✅ Text Input → Entity & Sentiment Analysis
// ------------------------------
app.post("/get-text-data-analysis-results", async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const response = await axios.post(
      "http://localhost:5001/analyze-text-ner-sentiment",
      { text }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error calling Python service:", err.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

// ------------------------------
// ✅ Get Company Details
// ------------------------------
app.get("/get-company-details/:entityName", async (req, res) => {
  const entityName = req.params.entityName.toLowerCase();
  try {
    const searchRes = await axios.get(
      `https://finnhub.io/api/v1/search?q=${entityName}&token=${FINNHUB_API_KEY}`
    );
    const results = searchRes.data.result;
    if (!results || results.length === 0)
      return res.status(404).json({ error: "Company not found" });

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

    res.json({
      name: profileRes.data.name,
      industry: profileRes.data.finnhubIndustry,
      description: profileRes.data.description || "No description available",
      marketCap: profileRes.data.marketCapitalization,
      sentiment: randomSentiment,
      confidence,
      symbol,
    });
  } catch (err) {
    console.error("Error fetching company data:", err.message);
    res.status(500).json({ error: "Failed to fetch company data" });
  }
});

// ------------------------------
// ✅ Login and Signup Routes
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
    if (!user)
      return res.status(400).json({ message: "User not found!" });
    if (user.password !== password)
      return res.status(400).json({ message: "Incorrect password!" });

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// ✅ News Analysis
// ------------------------------
app.get("/news-analysis/:entitySymbol", async (req, res) => {
  const symbol = req.params.entitySymbol.toUpperCase();
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 30);

  const from = fromDate.toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);

  try {
    const newsURL = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    const response = await axios.get(newsURL);
    const allNews = response.data;
    const { trendData, newsWithSentiment } = aggregateSentiment(allNews, today);

    const recentHeadlines = newsWithSentiment
      .filter((item) => item.ageInDays >= 0 && item.ageInDays <= 6)
      .slice(0, 3)
      .map((item) => ({
        headline: item.headline,
        source: item.source,
        url: item.url,
        sentiment: item.sentiment,
      }));

    res.json({ headlines: recentHeadlines, trendData });
  } catch (e) {
    console.error("Error fetching news:", e.message);
    res.status(500).json({ error: "Failed to fetch news analysis" });
  }
});

// ------------------------------
// ✅ Stock Price History
// ------------------------------
app.get("/stock-price-history/:entitySymbol", async (req, res) => {
  const symbol = req.params.entitySymbol.toUpperCase();
  try {
    const stockHistoryURL = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=365&apikey=${TWELVE_API_KEY}`;
    const response = await axios.get(stockHistoryURL);
    res.json(response.data);
  } catch (e) {
    console.error("Error fetching stock price history:", e.message);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
});

// ------------------------------
// ✅ Server Start
// ------------------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
