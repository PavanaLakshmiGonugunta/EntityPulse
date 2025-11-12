import { CartesianGrid, BarChart, XAxis, YAxis, Bar, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function TradingVolumeTrends({ volumeData }) {
    const [rawVolume, setRawVolume] = useState([]);
    const [monthlyVolumeData, setMonthlyVolumeData] = useState([]);

    useEffect(() => {
        const values = volumeData?.values;

        if (!values || values.length===0) {
            console.warn("No volume data available yet");
            return;
        }

        const data = values.map(el => ({
            volume: el.volume,
            datetime: el.datetime,
        }));
        setRawVolume(data);
    }, [volumeData]);


    useEffect(() => {
        if (rawVolume.length === 0) return;

        const monthlyTotals = new Map();

        for (const entry of rawVolume) {
        // extract 'YYYY-MM' from datetime
        const monthKey = entry.datetime.substring(0, 7);

        if (monthlyTotals.has(monthKey)) {
            monthlyTotals.set(monthKey, monthlyTotals.get(monthKey) +Number(entry.volume));
        } else {
            monthlyTotals.set(monthKey, Number(entry.volume));
        }
        }

        const grouped = Array.from(monthlyTotals, ([datetime, totalVolume]) => ({
            datetime,
            totalVolume,
        }));

        //Filter to show only the last 12 months (1 year)
        const lastTwelveMonths = grouped.slice(-12);
        setMonthlyVolumeData(lastTwelveMonths);
    }, [rawVolume]);

    const IMAGE_BAR_COLOR = "#8884d8";
    const CHART_HEIGHT = 300;

    const volumeTickFormatter = (value) => {
        if (value >= 1000000) {
            // Divide by 1,000,000 and append 'M' for millions
            return (value / 1000000).toFixed(0) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value;
    };
    return (
        <div className="component-div">
        <h5 id="component-title">Trading Volume</h5>
        <p style={{ color: 'grey' }}>Monthly Trading Volume Trends</p>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={monthlyVolumeData}>
            <XAxis 
                dataKey="datetime" 
                interval={0} 
                tick={{ fontSize: 12 }}
            />
            <YAxis
                tickFormatter={volumeTickFormatter}
                padding={{ top: 20, bottom: 0 }}
            />
            <CartesianGrid stroke="#dfdadaff" strokeDasharray="5 5" vertical={false} />
            {/* Bar: Change dataKey to 'totalVolume' and fill color to the green shade */}
            <Bar dataKey="totalVolume" fill={IMAGE_BAR_COLOR} />
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
}