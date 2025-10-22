// import express from "express"
// import axios from "axios"
// import cors from "cors"
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require("multer");
// const Tesseract  = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());

const FINNHUB_API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg"

const upload = multer({storage:multer.memoryStorage()}); 

app.post("/api/image-text",upload.single("image"),async(req,res)=>{
    if(!req.file){
        return res.status(400).json({error:"No file uploaded"});
    }
    try{
        const response = await axios.post("http://127.0.0.1:5001/extract-text",req.file.buffer,{
            headers:{"Content-Type":"application/octet-stream"},
            
        });
        console.log("Received image bytes length: ",req.file.buffer.length);
        res.json(response.data);
    }
    catch(error){
        console.error('Error calling FLask OCR service ',error.message);
        if(error.response){
            console.error("Flask response: ",error.response.data);
        }
        res.status(500).json({error:"OCR failed"});
    }
});

const FormData  = require("form-data");
// VOICE → TEXT
app.post("/api/voice-to-text", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    const formData  = new FormData();
    formData.append("audio",req.file.buffer,{
      filename:"recording.wav",
      contentType:"audio/wav",
    });
    // Forward the audio file to Flask
    const response = await axios.post("http://127.0.0.1:5002/voice-to-text", formData, {
      headers: formData.getHeaders(),
    });

    res.json(response.data); // Send transcribed text back to frontend
  } catch (error) {
    console.error("Error calling Flask voice service:", error.message);
    if (error.response) {
      console.error("Flask response:", error.response.data);
    }
    res.status(500).json({ error: "Voice to text conversion failed" });
  }
});


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
        console.error("Error fetching stock data: ", e.message);
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
