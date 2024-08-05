import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './PieChart.css';

const data = [
    { name: 'Malware', value: 40 },
    { name: 'Phishing', value: 30 },
    { name: 'Ransomware', value: 20 },
    { name: 'Spyware', value: 10 },
];

const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];

const CustomPieChart = ({ title }) => {
    return (
        <div className="pie-chart">
            <h3>{title}</h3>
            <PieChart width={200} height={200}>
                <Pie
                    data={data}
                    cx={100}
                    cy={100}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default CustomPieChart;
