import React from "react";
import { IoMdHome } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { FcAbout } from "react-icons/fc";
import { BsFileBarGraph } from "react-icons/bs";
import About from "./About";
import { Link } from 'react-router-dom';

const Header = ()=>{
    return(
        <>
            <div className="head">
            <header  className="title"><i><BsFileBarGraph /></i> <strong>Sentiment Scope</strong></header>
               <Link to={"/"} className="nav"><i><IoMdHome size={20}/></i>Home</Link>
               <Link to={"/search"} className="nav"><i><CiSearch size={20}/></i>Search</Link>
               <Link to={"/about"} className="nav"><i><FcAbout size={20}/></i>About</Link>
            </div>
            
        </>
    )
}

export default Header;