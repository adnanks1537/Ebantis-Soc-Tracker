import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterModal from './FilterModal';
import { FaFilter } from 'react-icons/fa';
import './ExportData.css'; // Create this CSS file for additional styles

const ExportData = () => {
    const [packets, setPackets] = useState([]);
    const [filteredPackets, setFilteredPackets] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({ src: '', dst: '', port: '', startDate: '', endDate: '' });

    useEffect(() => {
        const fetchPackets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/packets');
                setPackets(response.data);
                setFilteredPackets(response.data); // Initialize with all packets
            } catch (error) {
                console.error("Error fetching packets", error);
            }
        };

        fetchPackets();
    }, []);

    const downloadCSV = () => {
        const csvRows = [];
        const headers = ['Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Source Port', 'Destination Port', 'Length'];
        csvRows.push(headers.join(','));

        filteredPackets.forEach(packet => {
            const row = [
                new Date(packet.timestamp * 1000).toLocaleString(),
                packet.src_ip,
                packet.dst_ip,
                packet.protocol_name,
                packet.src_port,
                packet.dst_port,
                packet.length,
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filtered_network_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const applyFilters = (filters) => {
        setCurrentFilters(filters);
        const { src, dst, port, startDate, endDate } = filters;

        const filtered = packets.filter(packet => {
            const packetDate = new Date(packet.timestamp * 1000);
            const isSrcMatch = src ? packet.src_ip.includes(src) : true;
            const isDstMatch = dst ? packet.dst_ip.includes(dst) : true;
            const isPortMatch = port ? (packet.src_port === parseInt(port) || packet.dst_port === parseInt(port)) : true;
            const isDateMatch = (!startDate && !endDate) || (packetDate >= new Date(startDate) && packetDate <= new Date(endDate));
            return isSrcMatch && isDstMatch && isPortMatch && isDateMatch;
        });

        setFilteredPackets(filtered);
        setShowFilterModal(false);
    };

    return (
        <div className="export-container">
            <h1>Export Network Data</h1>
            <button onClick={downloadCSV}>Download CSV</button>
            <button onClick={() => setShowFilterModal(true)}>
                <FaFilter /> Filter Data
            </button>

            {showFilterModal && (
                <FilterModal
                    onClose={() => setShowFilterModal(false)}
                    onApply={applyFilters}
                    currentFilters={currentFilters}
                />
            )}

            <h2>Filtered Data</h2>
            <table className="data-table">
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
                    {filteredPackets.map((packet, index) => (
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
        </div>
    );
};

export default ExportData;
