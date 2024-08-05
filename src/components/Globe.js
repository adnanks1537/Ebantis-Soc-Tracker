// Globe.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './Globe.css'; // Adjust path if necessary


const Globe = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Create a sphere geometry for the globe
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        
        // Load Earth texture
        const earthTexture = textureLoader.load('https://threejs.org/examples/textures/earth.jpg');
        
        // Create material with neon blue effect
        const material = new THREE.MeshBasicMaterial({
            map: earthTexture,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide,
        });

        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Set camera position
        camera.position.z = 10;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            globe.rotation.y += 0.01; // Rotate globe
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Globe;
