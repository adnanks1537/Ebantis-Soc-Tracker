import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Alerts.css';

const Alerts = () => {
    const [uniqueIPs, setUniqueIPs] = useState([]);
    const [sslInfo, setSslInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const CENSYS_API_ID = "dad40e9c-cdc3-4789-b302-8032e390af6b"; // Replace with your Censys API ID
    const CENSYS_API_SECRET = "B5WBCWHdH0rr2O84Vsrxc4ufAEXqXBVP"; // Replace with your Censys API Secret

    useEffect(() => {
        const fetchUniqueIPs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/packets');
                const srcIpSet = new Set(response.data.map(packet => packet.src_ip)); // Get unique source IPs
                const dstIpSet = new Set(response.data.map(packet => packet.dst_ip)); // Get unique destination IPs
                setUniqueIPs([...srcIpSet, ...dstIpSet]); // Combine both sets
            } catch (error) {
                console.error("Error fetching packets", error);
            }
        };

        fetchUniqueIPs();
    }, []);

    useEffect(() => {
        const fetchSslAndPortInfo = async () => {
            setLoading(true);
            const sslData = [];

            for (const ip of uniqueIPs) {
                try {
                    const censysResponse = await axios.get(`https://search.censys.io/api/v2/hosts/${ip}`, {
                        auth: {
                            username: CENSYS_API_ID,
                            password: CENSYS_API_SECRET,
                        },
                    });

                    sslData.push({
                        ip,
                        censysData: censysResponse.data,
                    });
                } catch (error) {
                    console.error(`Error fetching SSL info for IP ${ip}`, error);
                }
            }

            setSslInfo(sslData);
            setLoading(false);
        };

        if (uniqueIPs.length > 0) {
            fetchSslAndPortInfo();
        }
    }, [uniqueIPs]);

    return (
        <div className="alerts-container">
            <h1>SSL Information Alerts</h1>
            {loading ? (
                <p>Loading SSL information...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>IP Address</th>
                            <th>Censys SSL Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sslInfo.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ip}</td>
                                <td>
                                    <pre>{JSON.stringify(item.censysData, null, 2)}</pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Alerts;
