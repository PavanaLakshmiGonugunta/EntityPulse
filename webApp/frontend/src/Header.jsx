import React from "react";
import { IoMdHome } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { FcAbout } from "react-icons/fc";
import { BsFileBarGraph } from "react-icons/bs";
import About from "./About";
const Header = ()=>{
    return(
        <>
            <div className="head">
            <header  className="title"><i><BsFileBarGraph /></i> <strong>Sentiment Scope</strong></header>
                <a><IoMdHome />Analyse</a>
                <a><CiSearch />Search</a>
                <a><FcAbout/>About</a>
                
            </div>
            
        </>
    )
}

export default Header;