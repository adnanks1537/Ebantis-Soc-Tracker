// src/components/Visualizer.js

import React, { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, MeshDistortMaterial, Line } from '@react-three/drei';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import * as THREE from 'three';
import './Visualizer.css';

const Packet = ({ start, end, color }) => {
    const [position, setPosition] = useState(start);
    const [isMoving, setIsMoving] = useState(true);

    // Animate the packet movement from start to end
    useFrame(() => {
        if (isMoving) {
            const newPosition = [
                position[0] + (end[0] - start[0]) * 0.01,
                position[1] + (end[1] - start[1]) * 0.01,
                0
            ];
            setPosition(newPosition);

            // Stop moving when close to the end position
            if (Math.abs(newPosition[0] - end[0]) < 0.01 && Math.abs(newPosition[1] - end[1]) < 0.01) {
                setIsMoving(false);
            }
        }
    });

    return (
        <mesh position={position}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

const Visualizer = () => {
    const [markers, setMarkers] = useState([]);
    const [packets, setPackets] = useState([]);

    // Fetch packets data from your API
    useEffect(() => {
        const fetchPackets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/packets');
                const newMarkers = response.data.map(packet => ({
                    src: packet.src_ip,
                    dst: packet.dst_ip,
                    position: [Math.random() * 360 - 180, Math.random() * 180 - 90], // Random positions for demo
                    start: [Math.random() * 360 - 180, Math.random() * 180 - 90],
                    end: [Math.random() * 360 - 180, Math.random() * 180 - 90],
                    color: `hsl(${Math.random() * 360}, 100%, 50%)` // Random color for packets
                }));
                setMarkers(newMarkers);
                setPackets(newMarkers.map(marker => ({ start: marker.start, end: marker.end, color: marker.color })));
            } catch (error) {
                console.error("Error fetching packets", error);
            }
        };

        fetchPackets();
        const intervalId = setInterval(fetchPackets, 5000); // Fetch new packets every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="visualizer-container">
            <h1>Packet Visualizer</h1>
            <div className="map-container">
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} style={{ height: '400px' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {markers.map((marker, index) => (
                        <Marker key={index} position={marker.position}>
                            <Popup>
                                <strong>Source:</strong> {marker.src}<br />
                                <strong>Destination:</strong> {marker.dst}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <Canvas style={{ height: '400px', marginTop: '20px' }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls enableZoom={true} />

                {/* Neon Globe Effect */}
                <mesh>
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshDistortMaterial
                        color="cyan"
                        attach="material"
                        distort={0.5}
                        speed={1.5}
                    />
                </mesh>

                {/* Render packets and lines */}
                {packets.map((packet, index) => (
                    <React.Fragment key={index}>
                        {/* Draw a line from start to end */}
                        <Line
                            points={[packet.start, packet.end]}
                            color="white"
                            lineWidth={3}
                            dashed={true}
                        />
                        {/* Render the packet */}
                        <Packet key={index} start={packet.start} end={packet.end} color={packet.color} />
                    </React.Fragment>
                ))}
            </Canvas>
        </div>
    );
};

export default Visualizer;
