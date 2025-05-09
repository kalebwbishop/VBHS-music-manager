import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function SortComponent({ data, setSortedData }) {
  const [sortConfig, setSortConfig] = useState([
    { column: "", direction: "asc" },
    { column: "", direction: "asc" },
    { column: "", direction: "asc" },
  ]);

  const headers = data.columns || [];

  const activeHeaders = headers.filter(
    (header) => header === "Grade" || 
                header === "Student First" || 
                header === "Student Last" ||
                header === "Student Name" ||
                header === "Instrument" ||
                header === "Part" ||
                header === "Ensemble"
  );

  const applySorting = () => {
    const sortedData = {
      columns: data.columns,
    }

    sortedData.rows = data.rows.sort((a, b) => {
      for (const config of sortConfig) {
        if (!config.column) continue; // Skip empty column selections
        
        const direction = config.direction === "asc" ? 1 : -1;

        const parseValue = (val) => {
          const num = parseFloat(val);
          return isNaN(num) ? val : num;
        };

        const aValue = parseValue(a[config.column]);
        const bValue = parseValue(b[config.column]);

        if (aValue < bValue) {
          return -1 * direction;
        }

        if (aValue > bValue) {
          return 1 * direction;
        }
      }

      return 0;
    });

    setSortedData(sortedData);
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
  data: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  setSortedData: PropTypes.func.isRequired,
};

export default SortComponent;
