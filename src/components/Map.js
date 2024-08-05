// src/components/Map.js

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

const Map = ({ locations }) => {
    const mapRef = useRef(null); // Reference for the map container
    const mapInstance = useRef(null); // Reference to the map instance

    useEffect(() => {
        if (!mapInstance.current) {
            // Initialize the map only once
            mapInstance.current = L.map(mapRef.current, {
                center: [20, 0],
                zoom: 2,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);
        }

        // Clear previous markers before adding new ones
        mapInstance.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstance.current.removeLayer(layer);
            }
        });

        // Add markers for valid locations only
        locations.forEach(location => {
            if (location.lat && location.lon) { // Ensure lat and lon are defined
                L.marker([location.lat, location.lon]).addTo(mapInstance.current)
                    .bindPopup(`<b>IP:</b> ${location.ip}<br><b>Count:</b> ${location.count}`);
            } else {
                console.error(`Invalid location data: ${JSON.stringify(location)}`);
            }
        });

        // Adjust the map view based on valid markers
        const validLocations = locations.filter(loc => loc.lat && loc.lon);
        if (validLocations.length > 0) {
            const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lon]));
            mapInstance.current.fitBounds(bounds);
        }

        return () => {
            mapInstance.current.remove(); // Clean up the map instance
            mapInstance.current = null;
        };
    }, [locations]);

    return <div id="map" className="map" ref={mapRef} />;
};

export default Map;
