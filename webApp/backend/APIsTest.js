const express = require("express")
const axios = require("axios")
const cors = require("cors")

const server = express()
server.use(cors())
server.use(express.json())

API_KEY = "d354c51r01qhorbgi6g0d354c51r01qhorbgi6gg"
const symbol = "AAPL"
const today = new Date();
const from = new Date();
from.setDate(today.getDate()-7);
console.log("from: ", from.toISOString().slice(0,10))
console.log("to: ",today.toISOString().slice(0,10))
axios.get(`
    https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from.toISOString().slice(0,10)}&to=${today.toISOString().slice(0,10)}&token=${API_KEY}
`).then((res) => {
    console.log(res)
})


server.listen(5000, ()=>{
    console.log("Server listening at 5000.")
})