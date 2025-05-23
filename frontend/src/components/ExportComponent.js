import React, { useState, useEffect } from "react";

function ExportComponent({ data }) {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [fileType, setFileType] = useState('csv');
  const [delimiter, setDelimiter] = useState(',');

  useEffect(() => {
    // Retrieve saved selected columns from cookies on load
    const savedColumns = document.cookie
      .split("; ")
      .find((row) => row.startsWith("selectedExportColumns="))
      ?.split("=")[1];

    if (savedColumns) {
      setSelectedColumns(JSON.parse(decodeURIComponent(savedColumns)));
    }
  }, []);

  const handleCheckboxChange = (index) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = prev.includes(index)
        ? prev.filter((col) => col !== index)
        : [...prev, index];

      document.cookie = `selectedExportColumns=${encodeURIComponent(
        JSON.stringify(newSelectedColumns)
      )}; path=/; max-age=31536000`;

      return newSelectedColumns;
    });
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === data.columns.length) {
      // Deselect all columns
      setSelectedColumns([]);
      document.cookie = `selectedExportColumns=${encodeURIComponent(
        JSON.stringify([])
      )}; path=/; max-age=31536000`;
    } else {
      // Select all columns
      const allColumns = data.columns.map((_, index) => index);
      setSelectedColumns(allColumns);
      document.cookie = `selectedExportColumns=${encodeURIComponent(
        JSON.stringify(allColumns)
      )}; path=/; max-age=31536000`;
    }
  };

  const handleButtonClick = () => {
    // Filter data to include only selected columns
    const filteredData = data.rows.map((row) => {
      // Get the selected column names based on their indices
      const selectedColumnNames = selectedColumns.map(index => data.columns[index]);
      // Create a new object with only the selected columns
      return selectedColumnNames.reduce((acc, colName) => {
        acc[colName] = row[colName];
        return acc;
      }, {});
    });

    // Convert data array to CSV format
    const selectedColumnNames = selectedColumns.map(index => data.columns[index]);
    const content = [
      // Add headers as first row
      selectedColumnNames.map(header => fileType === 'csv' ? `"${header}"` : header).join(delimiter),
      // Add data rows
      ...filteredData.map(
        (row) => Object.values(row).map((item) => fileType === 'csv' ? `"${item}"` : item).join(delimiter)
      )
    ].join("\n"); // Join all rows with newlines

    // Create a Blob from the content and a URL for it
    const mimeType = fileType === 'csv' ? 'text/csv' : 'text/plain';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = url;

    const currentDate = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `report-${currentDate}.${fileType}`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h3>Export</h3>
      <p>Select the columns to include in the export:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={selectedColumns.length === data.columns.length}
            onChange={handleSelectAll}
            style={{
              width: '18px',
              height: '18px',
              marginRight: '10px',
              cursor: 'pointer',
              accentColor: '#4a90e2'
            }}
          />
          <span style={{ fontSize: '16px' }}>Select All</span>
        </label>
        {data.columns.filter((cell) => cell.charAt(0) != '_').map((header, index) => (
          <label
            key={index}
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={selectedColumns.includes(index)}
              onChange={() => handleCheckboxChange(index)}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '10px',
                cursor: 'pointer',
                accentColor: '#4a90e2'
              }}
            />
            <span style={{ fontSize: '16px' }}>{header}</span>
          </label>
        ))}
      </div>
      <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
      </p>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>File Type:</label>
          <select 
            value={fileType} 
            onChange={(e) => setFileType(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '10px' }}>Delimiter:</label>
          <select 
            value={delimiter} 
            onChange={(e) => setDelimiter(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value=" ">Space ( )</option>
          </select>
        </div>
      </div>

      <button 
        style={{ marginTop: 10 }}
        onClick={handleButtonClick}
      >
        Export
      </button>
    </div>
  );
}

export default ExportComponent;