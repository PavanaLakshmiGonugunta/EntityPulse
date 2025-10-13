// import React from "react";
// import Header from './Header.jsx'
// import { CiMobile2 } from "react-icons/ci";
// import { CiSearch } from "react-icons/ci";
// import { FaCarSide } from "react-icons/fa";
// import { PiMicrosoftExcelLogo } from "react-icons/pi";
// import { CiShoppingCart } from "react-icons/ci";
// import { FaGoogle } from "react-icons/fa";
// import { FaMeta } from "react-icons/fa6";
// const Search = ()=>{
//     return(
//          <>
//          <div className="header">
//             <header><Header/></header>
//             <hr className="line"></hr>
//          </div>
//         <div className="body">
//             <h1>Entity Search: </h1>
//             <p>Search for any entity to view its historical data and sentiment analysis</p>
            
//         </div>

//         <div className="search-container">
//             <h4>Search Entities</h4>
//             <p>Enter a company name, or category to find entities</p>
//             <div className="input-text">
//                 <input type="text" placeholder="Search for Apple, Tesla, Inc, etc..." ></input>
//                 <button type="submit"> <i><CiSearch/> Search</i></button>
//             </div>
//         </div>

//         <h2 className="popular-entities">Popular Entities</h2>
//         <div className="entities">
            
//             {/* <div></div> */}
//             <div className="card">
//                 <i><CiMobile2 />Apple</i>
//                 <p>Technology</p>
//                 <small>Consumer electronics and software company</small>
                
//                 <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$2.8T</p>
//                 <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;positive</p>
//                 <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;85%</p>
                
                
//                 <button type="submit" className="btn">View Analysis</button>
//             </div>

//             <div className="card">
//                 <i><FaCarSide/> Tesla</i>
//                 <p>Automotive</p>
//                 <small>Electric vehicle and clean energy company</small>
                
//                 <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$800B</p>
//                 <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;negative</p>
//                 <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;72%</p>
               
//                 <button type="submit" className="btn">View Analysis</button>
//             </div>

//             <div className="card">
//                 <i><PiMicrosoftExcelLogo />Microsoft</i>
//                 <p>Technology</p>
//                 <small>Software and cloud computing services</small>
                
//                 <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$2.9T</p>
//                 <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neutral</p>
//                 <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;68%</p>
                
               
//                 <button type="submit" className="btn">View Analysis</button>
//             </div>

//             <div className="card">
//                 <i><CiShoppingCart />Amazon</i>
//                 <p>E-commerce</p>
//                 <small>E-commerce and cloud computing company</small>
                
//                 <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1.5T</p>
//                 <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;positive</p>
//                 <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;91%</p>
                
                
//                 <button type="submit" className="btn">View Analysis</button>
//             </div>

//             <div className="card">
//                 <i><FaGoogle />Google</i>
//                 <p>Technology</p>
//                 <small>Search engine and advertising company</small>
                
//                 <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1.8T</p>
//                 <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;positive</p>
//                 <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;78%</p>
                
                
//                 <button type="submit" className="btn">View Analysis</button>
//             </div>

//             <div className="card">
//                 <i><FaMeta />Meta</i>
//                 <p>Social Media</p>
//                 <small>Social media and virtuak reality company</small>
                
//                 <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$800B</p>
//                 <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neutral</p>
//                 <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;64%</p>
               
//                 <button type="submit" className="btn">View Analysis</button>
//             </div>
//         </div>
        
    

//         </>
//     )
   
// }
// export default Search;



import React,{useState} from "react";
import Header from './Header.jsx'
import { CiMobile2 } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import { FaCarSide } from "react-icons/fa";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { CiShoppingCart } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import axios from "axios";
const icons = {
    Technology: <CiMobile2 />,
    Automotive: <FaCarSide />,
    Software: <PiMicrosoftExcelLogo />,
    ECommerce: <CiShoppingCart />,
    SearchEngine: <FaGoogle />,
    SocialMedia: <FaMeta />
}
const Search = ()=>{
    const [query, setQuery] = useState("");
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const API_KEY = "d3hm9q1r01qi2vu1icn0d3hm9q1r01qi2vu1icng";
      const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    setError("");
    setCompanyData(null);

    try {
      // Step 1: Search for the company symbol using the name
      const searchRes = await axios.get(
        `https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`
      );

      const results = searchRes.data.result;
      

      if (!results||results.length===0) {
        setError("Company not found. Try a different name.");
        setLoading(false);
        return;
      }
      const result = results.find(r=>r.type==="Common Stock")||results[0];
      const symbol = result.symbol;

      // Step 2: Fetch company profile using the symbol
      const profileRes = await axios.get(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
      );

      // Step 3: Generate random sentiment and confidence (placeholder)
      const sentimentOptions = ["positive", "neutral", "negative"];
      const randomSentiment =
        sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
      const confidence = Math.floor(Math.random() * 30) + 70;

      setCompanyData({
        name: profileRes.data.name,
        industry: profileRes.data.finnhubIndustry,
        description: profileRes.data.description || "No description available",
        marketCap: profileRes.data.marketCapitalization,
        sentiment: randomSentiment,
        confidence: confidence
      });
    } catch (err) {
      console.error(err);
      setError("Error fetching company data. Please try again.");
    }

    setLoading(false);
  };
    return(
         <>
         
         <div className="header">
            <header><Header/></header>
            <hr className="line"></hr>
         </div>
        <div className="body">
            <h1>Entity Search: </h1>
            <p>Search for any entity to view its historical data and sentiment analysis</p>
            
        </div>

        <div className="search-container">
            <h4>Search Entities</h4>
            <p>Enter a company name, or category to find entities</p>
            <div className="input-text">
                <input type="text" 
                placeholder="Search for Apple, Tesla, Inc, etc..." 
                value={query}
                onChange={(e)=>setQuery(e.target.value)}/>
                <button type="submit" onClick={handleSearch}> <i><CiSearch/> Search</i></button>
            </div>
        </div>
         {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

         {companyData && (
                <div className="card">
                  <i>{icons[companyData.industry] || <CiMobile2 />} {companyData.name}</i>
                  <p>{companyData.industry}</p>
                  <small>{companyData.description}</small>
                  <p>
                    Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$
                    {(companyData.marketCap / 1000).toLocaleString()}B
                  </p>
                  <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{companyData.sentiment}</p>
                  <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{companyData.confidence}%</p>
                  <button type="submit" className="btn">
                    View Analysis
                  </button>
                </div>
            )}

        <h2 className="popular-entities">Popular Entities</h2>
        <div className="entities">
            
            {/* <div></div> */}
            <div className="card">
                <i><CiMobile2 />Apple</i>
                <p>Technology</p>
                <small>Consumer electronics and software company</small>
                
                <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$2.8T</p>
                <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;positive</p>
                <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;85%</p>
                
                
                <button type="submit" className="btn">View Analysis</button>
            </div>

            <div className="card">
                <i><FaCarSide/> Tesla</i>
                <p>Automotive</p>
                <small>Electric vehicle and clean energy company</small>
                
                <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$800B</p>
                <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;negative</p>
                <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;72%</p>
               
                <button type="submit" className="btn">View Analysis</button>
            </div>

            <div className="card">
                <i><PiMicrosoftExcelLogo />Microsoft</i>
                <p>Technology</p>
                <small>Software and cloud computing services</small>
                
                <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$2.9T</p>
                <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neutral</p>
                <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;68%</p>
                
               
                <button type="submit" className="btn">View Analysis</button>
            </div>

            <div className="card">
                <i><CiShoppingCart />Amazon</i>
                <p>E-commerce</p>
                <small>E-commerce and cloud computing company</small>
                
                <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1.5T</p>
                <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;positive</p>
                <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;91%</p>
                
                
                <button type="submit" className="btn">View Analysis</button>
            </div>

            <div className="card">
                <i><FaGoogle />Google</i>
                <p>Technology</p>
                <small>Search engine and advertising company</small>
                
                <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1.8T</p>
                <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;positive</p>
                <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;78%</p>
                
                
                <button type="submit" className="btn">View Analysis</button>
            </div>

            <div className="card">
                <i><FaMeta />Meta</i>
                <p>Social Media</p>
                <small>Social media and virtuak reality company</small>
                
                <p>Market Cap:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$800B</p>
                <p>Sentiment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;neutral</p>
                <p>Confidence:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;64%</p>
               
                <button type="submit" className="btn">View Analysis</button>
            </div>
        </div>
        
    

        </>
    )
   
}
export default Search;




