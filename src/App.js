import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import Map from './components/Map';
import Alerts from './components/Alerts'; // Assuming you have this component
import Network from './components/Network'; // Assuming you have this component
import ExportData from './components/ExportData'; // Assuming you have this component
import HttpPackets from './components/HttpPackets'; // Assuming you have this component
import './App.css';
import Visualizer from './components/Visualizer'; 
import Globe from './components/Globe'; 

const App = () => {
    const [loading, setLoading] = useState(true);
    const [systemInfo, setSystemInfo] = useState({ hostname: '', internal_ip: '' });
    const [topIps, setTopIps] = useState([]);
    const [error, setError] = useState(null);
const App = () => {
    return (
        <div>
            <h1 style={{ color: 'cyan', textAlign: 'center' }}>3D Neon Globe</h1>
            <Globe />
        </div>
    );
};

    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/system_info');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSystemInfo(data);
            } catch (error) {
                setError('Failed to fetch system information.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchSystemInfo();
    }, []);

    useEffect(() => {
        const fetchTopIps = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/top_ips');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTopIps(data);
            } catch (error) {
                console.error('Error fetching top IPs:', error);
            }
        };

        fetchTopIps(); // Initial fetch
        const interval = setInterval(fetchTopIps, 3000); // Refresh every 3 seconds

        return () => clearInterval(interval);
    }, []);

    // Convert top IPs to location format for the map
    const ipLocations = topIps.map(ipInfo => ({
        ip: ipInfo.ip,
        count: ipInfo.count,
        lat: ipInfo.latitude, // Ensure your API provides latitude
        lon: ipInfo.longitude // Ensure your API provides longitude
    }));

    return (
        <Router>
            <div className="dashboard">
                <header className="dashboard-header">
                    <h1> SOC  Dashboard</h1>
                </header>
                <div className="dashboard-navbar">
                    <nav>
                        <ul>
                            <li><Link to="/">Overview</Link></li>
                            <li><Link to="/alerts">Alerts</Link></li>
                            <li><Link to="/network">Network</Link></li>
                            <li><Link to="/export">Export Data</Link></li>
                            <li><Link to="/http">HTTP</Link></li>
                            <li><Link to="/visualizer">Visualizer</Link></li>
                        </ul>
                    </nav>
                </div>
                <main className="dashboard-main">
                    <Routes>
                        <Route path="/" element={
                            <>
                                {loading ? (
                                    <LoadingSpinner />
                                ) : error ? (
                                    <div className="error-message">{error}</div>
                                ) : (
                                    <div className="system-info">
                                        <h2>System Information</h2>
                                        <p><strong>Hostname:</strong> {systemInfo.hostname}</p>
                                        <p><strong>Internal IP:</strong> {systemInfo.internal_ip}</p>
                                    </div>
                                )}
                                <div className="map-card">
                                    <h2>Top 10 IP Locations</h2>
                                    <Map locations={ipLocations} />
                                </div>
                                <div className="top-ips">
                                    <h2>Top 10 IP Addresses</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>IP Address</th>
                                                <th>Count</th>
                                                <th>City</th>
                                                <th>Region</th>
                                                <th>Country</th>
                                                <th>ISP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topIps.map((ipInfo, index) => (
                                                <tr key={index}>
                                                    <td>{ipInfo.ip}</td>
                                                    <td>{ipInfo.count}</td>
                                                    <td>{ipInfo.city}</td>
                                                    <td>{ipInfo.region}</td>
                                                    <td>{ipInfo.country}</td>
                                                    <td>{ipInfo.isp}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        } />
                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/network" element={<Network />} />
                        <Route path="/export" element={<ExportData />} />
                        <Route path="/http" element={<HttpPackets />} />
                        <Route path="/visualizer" element={<Visualizer />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
