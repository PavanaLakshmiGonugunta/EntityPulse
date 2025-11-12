// src/utils/fetchCompanyData.js
import axios from "axios";

const API_KEY = "d3hm9q1r01qi2vu1icn0d3hm9q1r01qi2vu1icng";

// this function takes entity name and returns company Data
export const fetchCompanyData = async (name) => {
  try {
    // Step 1: Search for the company symbol
    const searchRes = await axios.get(
      `https://finnhub.io/api/v1/search?q=${name}&token=${API_KEY}`
    );

    const results = searchRes.data.result;
    if (!results || results.length === 0) {
      throw new Error("Company not found");
    }

    // Step 2: Find appropriate symbol
    const result = results.find(r => r.type === "Common Stock") || results[0];
    const symbol = result.symbol;

    // Step 3: Fetch company profile
    const profileRes = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
    );

    // Step 4: Random sentiment & confidence (placeholder)
    const sentimentOptions = ["positive", "neutral", "negative"];
    const randomSentiment = sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
    const confidence = Math.floor(Math.random() * 30) + 70;

    // Step 5: Return consistent object
    const company = {
      name: profileRes.data.name,
      industry: profileRes.data.finnhubIndustry,
      description: profileRes.data.description || "No description available",
      marketCap: profileRes.data.marketCapitalization,
      sentiment: randomSentiment,
      confidence: confidence,
      symbol: symbol
    };

    // persist company data for other pages to reuse without refetching
    try {
        sessionStorage.setItem(
        'companyData',
        JSON.stringify({
            name: profileRes.data.name,
            industry: profileRes.data.finnhubIndustry,
            description: profileRes.data.description || "No description available",
            marketCap: profileRes.data.marketCapitalization,
            sentiment: randomSentiment,
            confidence: confidence,
            symbol: symbol
        })
        );
    } catch (e) {
        console.warn('Could not persist companyData to sessionStorage', e);
    }
    return company;

  } catch (err) {
    console.error("Error fetching company data:", err);
    throw err;
  }
};
