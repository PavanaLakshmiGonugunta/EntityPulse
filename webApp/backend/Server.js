import express from "express"
import axios from "axios"
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());

const FINNHUB_API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg"

app.get("/get-current-price-market-cap/:entitySymbol", async (req, res)=> {
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
app.get("/social-sentiment-summary")
app.get("/news-headline-and-sentiment")
app.get("/platform-sentiment-breakdown")
app.get("/stock-price-history")

const PORT = 5000
app.listen(PORT, ()=>{
    console.log(`Backend running at http://localhost:${PORT}`)
})
