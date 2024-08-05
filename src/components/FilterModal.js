import React, { useState } from 'react';
import './FilterModal.css'; // Ensure you have the CSS for styling

const FilterModal = ({ onClose, onApply, currentFilters }) => {
    const [src, setSrc] = useState(currentFilters.src);
    const [dst, setDst] = useState(currentFilters.dst);
    const [port, setPort] = useState(currentFilters.port);
    const [startDate, setStartDate] = useState(currentFilters.startDate);
    const [endDate, setEndDate] = useState(currentFilters.endDate);

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply({ src, dst, port, startDate, endDate });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Apply Filters</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Source IP:</label>
                        <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} />
                    </div>
                    <div>
                        <label>Destination IP:</label>
                        <input type="text" value={dst} onChange={(e) => setDst(e.target.value)} />
                    </div>
                    <div>
                        <label>Port:</label>
                        <input type="text" value={port} onChange={(e) => setPort(e.target.value)} />
                    </div>
                    <div>
                        <label>Start Date:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label>End Date:</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button type="submit">Apply</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default FilterModal;
