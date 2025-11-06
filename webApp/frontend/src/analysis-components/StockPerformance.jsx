import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  LineChart,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function StockPerformance({ stockData }) {
  const [openPrices, setOpenPrices] = useState([]);

  useEffect(() => {
    if (stockData?.values) {
      const prices = stockData.values
        .filter((_, index) => index % 30 === 0) // roughly one point per month
        .map((el) => ({ open: el.open, datetime: el.datetime }));

      setOpenPrices(prices);
    }
  }, [stockData]);

  return (
    <div className="component-div">
      <h5 id="component-title">Stock Price History</h5>
      <p style={{ color: "grey" }}>
        Historical stock performance over the last 12 months
      </p>

      {openPrices.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={openPrices}>
            <XAxis
              dataKey="datetime"
              tickFormatter={(dateStr) => {
                const date = new Date(dateStr);
                return `${date.getFullYear()}-${String(
                  date.getMonth() + 1
                ).padStart(2, "0")}`;
              }}
            />
            <YAxis />
            <CartesianGrid stroke="#dfdadaff" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="open" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: "gray", textAlign: "center", marginTop: "20px" }}>
          No stock data available.
        </p>
      )}
    </div>
  );
}
