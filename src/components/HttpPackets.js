import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HttpPackets.css';

const HttpPackets = () => {
    const [httpPackets, setHttpPackets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHttpPackets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/http_packets');
                setHttpPackets(response.data);
            } catch (error) {
                console.error("Error fetching HTTP packets", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHttpPackets();
        
        // Fetch HTTP packets every 5 seconds
        const intervalId = setInterval(() => {
            fetchHttpPackets();
        }, 5000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return (
        <div className="http-packets-container">
            <h1>HTTP Packets</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Source IP</th>
                            <th>Destination IP</th>
                            <th>Source Port</th>
                            <th>Destination Port</th>
                            <th>Raw Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {httpPackets.map((packet, index) => (
                            <tr key={index}>
                                <td>{new Date(packet.timestamp * 1000).toLocaleString()}</td>
                                <td>{packet.src_ip}</td>
                                <td>{packet.dst_ip}</td>
                                <td>{packet.src_port}</td>
                                <td>{packet.dst_port}</td>
                                <td>
                                    {packet.raw_data ? (
                                        <pre>{packet.raw_data}</pre> // Display raw data
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HttpPackets;
