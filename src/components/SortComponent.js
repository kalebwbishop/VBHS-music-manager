import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

function SortComponent({ data, setSortedData }) {
    const settings = useSelector((state) => state.settings.value);

    const [sortConfig, setSortConfig] = useState([
        { column: "", direction: "asc" },
        { column: "", direction: "asc" },
        { column: "", direction: "asc" },
    ]);
    
    const headers = data[0] || [];

    const activeHeaders = headers.filter((header) => settings.sortColumns[header]?.active);

    const applySorting = () => {
        const headerRow = data[0];
        const dataRows = data.slice(1);
    
        const sortedData = [...dataRows].sort((a, b) => {
            for (const config of sortConfig) {
                const column = headerRow.indexOf(config.column);
                const direction = config.direction === "asc" ? 1 : -1;
    
                const parseValue = (val) => {
                    const num = parseFloat(val);
                    return isNaN(num) ? val : num;
                };
    
                const aValue = parseValue(a[column]);
                const bValue = parseValue(b[column]);
    
                if (aValue < bValue) {
                    return -1 * direction;
                }
    
                if (aValue > bValue) {
                    return 1 * direction;
                }
            }
    
            return 0;
        });
    
        setSortedData([headerRow, ...sortedData]);
    };
    

    const handleSortChange = (idx, field, value) => {
        const updatedSortConfig = sortConfig.map((config, i) => {
            if (i !== idx) {
                return config;
            }

            return { ...config, [field]: value };
        });

        setSortConfig(updatedSortConfig);
    };

    const addSortLevel = () => {
        if (sortConfig.length < 3) {
            setSortConfig([...sortConfig, { column: "", direction: "asc" }]);
        }
    };

    const removeSortLevel = (idx) => {
        const updatedSortConfig = sortConfig.filter((_, i) => i !== idx);
        setSortConfig(updatedSortConfig);
    };

    useEffect(() => {
        applySorting();
    }, [data, sortConfig]);

    return (
        <div>
            <h3>Sort</h3>
            {sortConfig.map((config, idx) => (
                <div key={idx} style={{ marginBottom: "10px" }}>
                    <select
                        value={config.column}
                        onChange={(e) => handleSortChange(idx, "column", e.target.value)}
                    >
                        <option value="">Select Column</option>
                        {activeHeaders.map((header, i) => (
                            <option key={i} value={header}>
                                {header}
                            </option>
                        ))}
                    </select>
                    <select
                        value={config.direction}
                        onChange={(e) => handleSortChange(idx, "direction", e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            ))}
        </div>
    );
}

SortComponent.propTypes = {
    data: PropTypes.array.isRequired,
    setSortedData: PropTypes.func.isRequired,
};

export default SortComponent;
