import express from "express"
import axios from "axios"
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());

// NOTE: Replace with your actual key
const FINNHUB_API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg"
const TWELVE_API_KEY = "96c92ea18dfd481495a9c4e557c1d9b8"

// --- UTILITY FUNCTIONS ---

/**
 * Helper to calculate sentiment percentages for the required time buckets.
 * NOTE: This function uses a RANDOM sentiment classification as a placeholder.
 * You must replace the random logic with your actual custom model call or Finnhub's score later.
 */
function aggregateSentiment(allNews, today) {
    const sentimentBuckets = {
        'This Week': { positive: 0, neutral: 0, negative: 0, total: 0 }, // Last 7 days (day 0 to day 6)
        'Last Week': { positive: 0, neutral: 0, negative: 0, total: 0 }, // Days 7 through 13
        'Last Month': { positive: 0, neutral: 0, negative: 0, total: 0 }, // Days 14 through 29
    };

    const msPerDay = 24 * 60 * 60 * 1000;
    const todayMs = today.getTime();

    const newsWithSentiment = allNews.map(item => {
        // Finnhub uses UNIX timestamp, convert to milliseconds
        const itemDate = new Date(item.datetime * 1000); 
        const ageInDays = Math.floor((todayMs - itemDate.getTime()) / msPerDay);
        
        // --- PLACEHOLDER FOR CUSTOM SENTIMENT MODEL ---
        // 1. In production, you would call your model here.
        // 2. For now, we use the random classification logic from your original code.
        const classification = ["Positive", "Negative", "Neutral"][Math.floor(Math.random() * 3)];
        // ---------------------------------------------

        let bucketName;
        if (ageInDays >= 0 && ageInDays <= 6) {
            bucketName = 'This Week';
        } else if (ageInDays >= 7 && ageInDays <= 13) {
            bucketName = 'Last Week';
        } else if (ageInDays >= 14 && ageInDays <= 29) { 
            bucketName = 'Last Month';
        } else {
            return null; // Ignore news older than 30 days
        }

        const bucket = sentimentBuckets[bucketName];
        if (bucket) {
            bucket.total++;
            if (classification === 'Positive') bucket.positive++;
            else if (classification === 'Negative') bucket.negative++;
            else bucket.neutral++;
        }

        return {
            ...item,
            sentiment: classification,
            ageInDays,
            bucketName
        };
    }).filter(n => n !== null);

    // Format the aggregated trend results
    const trendResults = Object.keys(sentimentBuckets).map(period => {
        const bucket = sentimentBuckets[period];
        const total = bucket.total;
        
        if (total === 0) {
            return { period, positive: 0, neutral: 0, negative: 0, mainSentiment: 'Neutral', totalArticles: 0 };
        }

        const positive = Math.round((bucket.positive / total) * 100);
        const negative = Math.round((bucket.negative / total) * 100);
        const neutral = Math.round((bucket.neutral / total) * 100);

        // Determine the overall dominant sentiment for the visualization
        let mainSentiment = 'Neutral';
        let mainSentimentPercentage = neutral / (positive+negative+neutral) * 100;
        if (positive > negative && positive > neutral){
            mainSentiment = 'Positive';
            mainSentimentPercentage = positive / (positive+negative+neutral) * 100;
        }
        else if (negative > positive && negative > neutral){
            mainSentiment = 'Negative';
            mainSentimentPercentage = negative / (positive+negative+neutral) * 100;
        }

        return {
            period,
            positive,
            neutral,
            negative,
            mainSentiment,
            mainSentimentPercentage,
            totalArticles: total,
        };
    });

    // Return the processed news for filtering the top headlines in the next step
    return {
        trendData: trendResults,
        newsWithSentiment
    };
}


// --- API ENDPOINTS ---

// end point to fetch entity details 
app.get('/get-company-details/:entityName', async(req, res) => {
    const entityName = req.params.entityName.toLowerCase();
    try {
        // Step 1: Search for the company symbol
        const searchRes = await axios.get(
            `https://finnhub.io/api/v1/search?q=${entityName}&token=${FINNHUB_API_KEY}`
        );

        const results = searchRes.data.result;
        if (!results || results.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Step 2: Choose best match
        const result = results.find(r => r.type === "Common Stock") || results[0];
        const symbol = result.symbol;

        // Step 3: Get profile
        const profileRes = await axios.get(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );

        // Step 4: Mock sentiment/confidence
        const sentimentOptions = ["positive", "neutral", "negative"];
        const randomSentiment =
        sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
        const confidence = Math.floor(Math.random() * 30) + 70;

        // Step 5: Construct response
        const company = {
            name: profileRes.data.name,
            industry: profileRes.data.finnhubIndustry,
            description: profileRes.data.description || "No description available",
            marketCap: profileRes.data.marketCapitalization,
            sentiment: randomSentiment,
            confidence: confidence,
            symbol: symbol,
        };

        // Send result to frontend
        res.json(company);
    } catch (err) {
        console.error("Error fetching company data:", err.message);
        res.status(500).json({ error: "Failed to fetch company data" });
    }
})


// end point to handle analysis when user gives text input
app.post('/get-text-data-analysis-results', async (req, res)=> {
    const text = req.body.text;
    if (!text) return res.status(400).json({ error: "Missing text" });

    try{
        const response = await axios.post("http://localhost:5001/analyze-text-ner-sentiment", {text})
        return res.json(response.data)
    }
    catch (err) {
        console.error("Error calling Python service:", err.message);
        res.status(500).json({ error: "Python service failed" });
    }
})

app.get("/get-current-price-market-cap/:entitySymbol", async (req, res)=> {
    console.log("Request for getting price and market capital made.")
    const entitySymbol = req.params.entitySymbol.toUpperCase();
    try{
        const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${entitySymbol}&token=${FINNHUB_API_KEY}`;
        const priceData = await axios.get(priceUrl);

        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${entitySymbol}&token=${FINNHUB_API_KEY}`;
        const profileData = await axios.get(profileUrl);

        const data = {
            symbol: entitySymbol,
            currentPrice: priceData.data.c,
            highPrice: priceData.data.h,
            lowPrice: priceData.data.l,
            openPrice: priceData.data.o,
            previousClose: priceData.data.pc,
            marketCap: profileData.data.marketCapitalization,
            companyName: profileData.data.name,
            industry: profileData.data.industry,
            country: profileData.data.country,
        }

        res.json(data)
    }
    catch(e){
        console.log("Error fetching stock data: ", e.message);
        res.status(500).json({error: "Error fetching current Price and market Cap"});
    }
})

// Refactored Endpoint: Fetches news once and returns both Headlines and Trend Data
app.get("/news-analysis/:entitySymbol", async (req, res) => {
    console.log("Request for combined news analysis (headlines and trend) made.");

    const symbol = req.params.entitySymbol.toUpperCase();
    const today = new Date();
    
    // Set 'from' date to 30 days ago to cover all trend buckets
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 30); 
    
    // Format dates as YYYY-MM-DD for Finnhub API
    const from = fromDate.toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);

    try {
        const newsURL = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
        const response = await axios.get(newsURL); 
        const allNews = response.data;

        // 1. Calculate Sentiment Trend
        const { trendData, newsWithSentiment } = aggregateSentiment(allNews, today);

        // 2. Extract Top 3 Recent Headlines (from the "This Week" bucket)
        const recentHeadlines = newsWithSentiment
            .filter(item => item.ageInDays >= 0 && item.ageInDays <= 6) // Filter to only "This Week"
            .slice(0, 3) // Take the top 3 (most recent)
            .map(item => ({
                headline: item.headline,
                source: item.source,
                url: item.url,
                // Use the calculated sentiment for the display
                sentiment: item.sentiment 
            }));

        const data = {
            headlines: recentHeadlines,
            trendData: trendData
        };

        res.json(data); 
        console.log("Combined news analysis fetched successfully.");
    } catch (e) {
        console.log("Error fetching news:", e.message);
        res.status(500).json({ error: "Failed to fetch news analysis." });
    }
});

// Original endpoint (now obsolete or should be deleted/redirected)
app.get("/social-sentiment-summary")
app.get("/platform-sentiment-breakdown")
app.get("/stock-price-history/:entitySymbol", async (req, res) =>{
    console.log("request for stock price has been made.");
    const symbol = req.params.entitySymbol.toUpperCase();
    try{
        const stockHistoryURL = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=365&apikey=${TWELVE_API_KEY}`
        const response = await axios.get(stockHistoryURL);
        res.json(response.data)
    }
    catch(e){
        console.log("error fetching stock price and volumes, ",e.message);
    }
})



const PORT = 5000
app.listen(PORT, ()=>{
    console.log(`Backend running at http://localhost:${PORT}`)
})
