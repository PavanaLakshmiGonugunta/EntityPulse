import {CartesianGrid, LineChart, XAxis, YAxis,Line, ResponsiveContainer} from 'recharts';
import {useState, useEffect} from 'react';

export default function StockPerformance(stockData){
    const [openPrices, setOpenPrices] = useState([])
    useEffect(() => {
        if (stockData?.stockData?.values) {
            const prices = stockData.stockData.values
                .filter((el, index) => index % 30 === 0) // take every 15th day
                .map(el => ({ open: el.open, datetime: el.datetime }));

            setOpenPrices(prices);
        }
    }, [stockData]);
    return(
        <div class='component-div'>
            <h5 id="component-title">Stock Price History</h5>
            <p style={{
                color: "grey",
            }}>Historical stock performance over last 12 months</p>
            <ResponsiveContainer width={'100%'} height={500}>
                <LineChart data={openPrices}>
                    <XAxis 
                        dataKey="datetime" 
                        interval={0} // keep all points, we'll format labels
                        tickFormatter={(dateStr) => {
                            const date = new Date(dateStr);
                            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        }}
                        />
                    <YAxis/>
                    <CartesianGrid stroke='#dfdadaff' strokeDasharray="5 5"/>
                    <Line type="monotone" dataKey="open" stroke="#8884d8"></Line>
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}