import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './Network.css';

const Network = () => {
    const [packets, setPackets] = useState([]);
    const [stats, setStats] = useState([]);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchPackets = async () => {
            try {
                setUpdating(true); // Show updating pop-up
                const response = await axios.get('http://localhost:5000/api/packets');
                setPackets(response.data);
            } catch (error) {
                console.error("Error fetching packets", error);
            } finally {
                setUpdating(false); // Hide updating pop-up
            }
        };

        const fetchStats = async () => {
            try {
                setUpdating(true); // Show updating pop-up
                const response = await axios.get('http://localhost:5000/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching packet stats", error);
            } finally {
                setUpdating(false); // Hide updating pop-up
            }
        };

        // Fetch data every 5 seconds
        const intervalId = setInterval(() => {
            fetchPackets();
            fetchStats();
        }, 5000);

        // Initial data fetch
        fetchPackets();
        fetchStats();

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF3333'];

    return (
        <div className="App">
            <header className="App-header">
                <h1>Network Packet Dashboard</h1>
            </header>
            <main>
                <h2>Captured Packets</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Source IP</th>
                            <th>Destination IP</th>
                            <th>Protocol</th>
                            <th>Source Port</th>
                            <th>Destination Port</th>
                            <th>Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packets.map((packet, index) => (
                            <tr key={index}>
                                <td>{new Date(packet.timestamp * 1000).toLocaleString()}</td>
                                <td>{packet.src_ip}</td>
                                <td>{packet.dst_ip}</td>
                                <td>{packet.protocol_name}</td>
                                <td>{packet.src_port}</td>
                                <td>{packet.dst_port}</td>
                                <td>{packet.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2>Packet Statistics</h2>
                <PieChart width={400} height={400}>
                    <Pie
                        data={stats}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                    >
                        {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>

                {/* Updating pop-up */}
                {updating && (
                    <div className="updating-popup">
                        <h3>Updating...</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Network;
