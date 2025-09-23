import React from "react";
import Header from './Header.jsx'
import { CiMobile2 } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import { FaCarSide } from "react-icons/fa";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { CiShoppingCart } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
const Search = ()=>{
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
                <input type="text" placeholder="Search for Apple, Tesla, Inc, etc..." ></input>
                <button type="submit"> <i><CiSearch/> Search</i></button>
            </div>
        </div>

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