import React from 'react'
import './SearchBar.css'
import {useState, useEffect} from 'react'


function SearchBar(){
    const [inputText, setInputText] = useState("")
    return(
        <>
            <textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            >Enter text</textarea>
            <br/>
            <button id="text-submit-button" onClick={(e) =>{
                console.log(inputText);
            }}>Get Entities</button>
        </>
    )
}

export default SearchBar;