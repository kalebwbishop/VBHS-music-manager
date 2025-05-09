import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function AddSheetComponent({ closeSidebar, accessToken, setDisplayData, setSelectedSheetId }) {
  const [sheetName, setSheetName] = useState("");
  const [columns, setColumns] = useState(["Student First", "Student Last"]);
  const [rowCount, setRowCount] = useState(0);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [csvData, setCsvData] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const handleColumnChange = (index, value) => {
    if (index < 2) return; // Prevent changes to first two columns
    const updatedColumns = [...columns];
    updatedColumns[index] = value;
    setColumns(updatedColumns);
  };

  const addColumn = () => {
    setColumns([...columns, ""]);
  };

  const removeColumn = (index) => {
    if (index < 2) return; // Prevent removal of first two columns
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
  };

  const toggleHeaders = () => {
    if (!csvData) return;

    const newHasHeaders = !hasHeaders;
    setHasHeaders(newHasHeaders);

    if (newHasHeaders) {
      // Convert to headers, but keep first two columns fixed
      const firstRow = csvData[0];
      setColumns([
        "Student First",
        "Student Last",
        ...firstRow.slice(2).map(header =>
          header.trim().replace(/^["']|["']$/g, '')
        ).filter(header => header.length > 0)
      ]);
      setRowCount(csvData.length - 1);
      setPreviewData(csvData.slice(1));
    } else {
      // Convert to placeholders, but keep first two columns fixed
      const numColumns = csvData[0].length;
      const placeholders = Array(numColumns - 2).fill().map((_, i) => `Placeholder ${i + 1}`);
      setColumns(["Student First", "Student Last", ...placeholders]);
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
        setPreviewData(lines);
        
        if (hasHeaders) {
          // Convert to headers, but keep first two columns fixed
          const firstRow = lines[0];
          setColumns([
            "Student First",
            "Student Last",
            ...firstRow.slice(2).map(header =>
              header.trim().replace(/^["']|["']$/g, '')
            ).filter(header => header.length > 0)
          ]);
          setRowCount(lines.length - 1);
          setPreviewData(lines.slice(1));
        } else {
          // Convert to placeholders, but keep first two columns fixed
          const numColumns = lines[0].length;
          const placeholders = Array(numColumns - 2).fill().map((_, i) => `Placeholder ${i + 1}`);
          setColumns(["Student First", "Student Last", ...placeholders]);
          setRowCount(lines.length);
          setPreviewData(lines);
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
          if (response.status === 401) {
            throw new Error("Unauthorized");
            
          }
          return response.json();
        })
        .then((data) => {
          alert("Sheet added successfully!");
          setSheetName("");
          setColumns(["Student First", "Student Last"]);
          closeSidebar();

          if (data.students.length > 0) {
            setSelectedSheetId(data.students[0].sheetId);
          }
        })
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error adding sheet rows", error);
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
            <div style={{ position: "relative", display: "inline-block" }}>
              <input
                type="text"
                value={column}
                onChange={(e) => handleColumnChange(index, e.target.value)}
                disabled={index < 2}
                title={index < 2 ? "These columns are required and cannot be modified" : ""}
                style={{ 
                  width: "200px", 
                  padding: "5px", 
                  border: "1px solid #ccc", 
                  borderRadius: "5px",
                  backgroundColor: index < 2 ? "#e9ecef" : "white",
                  color: index < 2 ? "#495057" : "black",
                  cursor: index < 2 ? "not-allowed" : "text",
                  position: "relative"
                }}
              />
              {index < 2 && (
                <div style={{
                  position: "absolute",
                  right: "-20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  fontSize: "14px"
                }}>🔒</div>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => removeColumn(index)} 
              disabled={index < 2}
              title={index < 2 ? "These columns cannot be removed" : "Remove column"}
              style={{ 
                backgroundColor: index < 2 ? "#cccccc" : "red", 
                color: "white", 
                border: "none", 
                padding: "5px", 
                cursor: index < 2 ? "not-allowed" : "pointer",
                opacity: index < 2 ? 0.5 : 1
              }}
            >X</button>
          </div>
        ))}
        <button type="button" onClick={addColumn} style={{ width: "250px", padding: "8px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add Column</button>

        <button type="submit" onClick={handleSubmit} style={{ width: "250px", padding: "8px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Create Sheet</button>
        <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
          {rowCount} rows will be imported
        </p>
        <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
          <span style={{ color: "#dc3545" }}>*</span> First two columns are required and cannot be modified
        </p>
      </form>
    </div>
  );
}

AddSheetComponent.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  setDisplayData: PropTypes.func.isRequired,
  setSelectedSheetId: PropTypes.func.isRequired,
};

export default AddSheetComponent;
