import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function AddSheetComponent({ closeSidebar, setRefresh, accessToken, setDisplayData, setSelectedSheetId }) {
  const [sheetName, setSheetName] = useState("");
  const [columns, setColumns] = useState([""]);
  const [rowCount, setRowCount] = useState(0);
  const [hasHeaders, setHasHeaders] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const handleColumnChange = (index, value) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = value;
    setColumns(updatedColumns);
  };

  const addColumn = () => {
    setColumns([...columns, ""]);
  };

  const removeColumn = (index) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
  };

  const toggleHeaders = () => {
    if (!csvData) return;

    const newHasHeaders = !hasHeaders;
    setHasHeaders(newHasHeaders);

    if (newHasHeaders) {
      // Convert to headers
      const firstRow = csvData[0];
      setColumns(firstRow.map(header =>
        header.trim().replace(/^["']|["']$/g, '')
      ).filter(header => header.length > 0));
      setRowCount(csvData.length - 1);
      setPreviewData(csvData.slice(1));
    } else {
      // Convert to placeholders
      const numColumns = csvData[0].length;
      const placeholders = Array(numColumns).fill().map((_, i) => `Placeholder ${i + 1}`);
      setColumns(placeholders);
      setRowCount(csvData.length);
      setPreviewData(csvData);
    }
  };

  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Set sheet name to the file name without extension
    const fileName = file.name.replace('.csv', '');
    setSheetName(fileName);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, '')));

      if (lines.length > 0) {
        setCsvData(lines);

        // Set preview data
        console.log("Testing", lines)
        setPreviewData(lines);
        
        if (hasHeaders) {
          // Get headers from first line and clean them
          const headers = lines[0].filter(header => header.length > 0);
          setColumns(headers);
          setRowCount(lines.length - 1);
        } else {
          // If no headers, use the first row to determine number of columns
          const placeholderColumns = lines[0].map((_, index) => `Placeholder ${index + 1}`);
          setColumns(placeholderColumns);
          setRowCount(lines.length);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!sheetName.trim() || columns.some(col => !col.trim())) {
      alert("Sheet name and all columns must be filled out.");
      return;
    }

    const newSheet = { name: sheetName, columns };

    fetch(`${window.env.REACT_APP_BACKEND_URL}/api/sheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(newSheet),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create sheet");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sheet created successfully:", data);
        fetch(`${window.env.REACT_APP_BACKEND_URL}/api/sheet/${data.data.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(previewData.map(row => {
            const rowData = {};
            columns.forEach((col, idx) => {
              rowData[col] = row[idx];
            });
            return rowData;
          })),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to create sheet rows");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Sheet rows created successfully:", data);
          alert("Sheet added successfully!");
          setSheetName("");
          setColumns([""]);
          closeSidebar();
          setRefresh((prev) => !prev);

          if (data.students.length > 0) {
            setSelectedSheetId(data.students[0].sheetId);
          }
        })
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    const tempDisplayData = {
      columns: columns,
      rows: previewData.map(row => {
        const rowData = {};
        columns.forEach((col, idx) => {
          rowData[col] = row[idx];
        });
        return rowData;
      })
    }
    setDisplayData(tempDisplayData);

  }, [previewData, columns, setDisplayData]);

  return (
    <div style={{ paddingBottom: "50px" }}>
      <p>Create a new sheet.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>Sheet Name</label>
        <input
          type="text"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          style={{ width: "250px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
        />

        <div style={{ marginTop: "10px" }}>
          <label>Import CSV Headers</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            style={{ width: "250px", padding: "5px" }}
          />
          <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
            Upload a CSV file to automatically populate columns or manually add columns below then add data later.
          </p>
          <label>Columns</label>

          {rowCount > 0 && (
            <>
              <button
                type="button"
                onClick={toggleHeaders}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "5px"
                }}
              >
                {hasHeaders ? "Use Placeholder Headers" : "Use First Row as Headers"}
              </button>
            </>
          )}
        </div>

        {columns.map((column, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="text"
              value={column}
              onChange={(e) => handleColumnChange(index, e.target.value)}
              style={{ width: "200px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
            <button type="button" onClick={() => removeColumn(index)} style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px", cursor: "pointer" }}>X</button>
          </div>
        ))}
        <button type="button" onClick={addColumn} style={{ width: "250px", padding: "8px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add Column</button>

        <button type="submit" style={{ width: "250px", padding: "8px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Create Sheet</button>
        <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
          {rowCount} rows will be imported
        </p>
      </form>
    </div>
  );
}

AddSheetComponent.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  setDisplayData: PropTypes.func.isRequired,
  setSelectedSheetId: PropTypes.func.isRequired,
};

export default AddSheetComponent;
