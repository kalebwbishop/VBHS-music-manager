import React, { useState } from "react";
import PropTypes from "prop-types";

function EditSheetComponent({ closeSidebar, accessToken, sheetName, sheetId, displayData, setSelectedSheetId }) {
  const [sheetNameDisp, setSheetName] = useState(sheetName);
  const [columns, setColumns] = useState([
    "Student First",
    "Student Last",
    ...displayData.columns.filter((cell) => cell.charAt(0) !== "_").slice(2)
  ]);

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
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!sheetNameDisp.trim() || columns.some(col => !col.trim())) {
      alert("Sheet name and all columns must be filled out.");
      return;
    }
    
    const newSheet = { name: sheetNameDisp, columns };
    
    fetch(`${window.env.REACT_APP_BACKEND_URL}/api/sheet/${sheetId}`, {
      method: "PATCH",
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
        alert("Sheet edited successfully!");
        setSheetName("");
        setColumns([""]);
        closeSidebar();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleDelete = (event) => {
    event.preventDefault();
    if (!sheetId) {
      alert("Sheet ID is required for deletion.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this sheet? This action cannot be undone.")) {
      fetch(`${window.env.REACT_APP_BACKEND_URL}/api/sheet/${sheetId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete sheet");
          }
          return response.json();
        })
        .then((data) => {
          alert("Sheet deleted successfully!");
          closeSidebar();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error deleting sheet", error);
        });
    }
  }

  return (
    <div style={{ paddingBottom: "50px" }}>
      <p>Edit sheet settings.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>Sheet Name</label>
        <input
          type="text"
          value={sheetNameDisp}
          onChange={(e) => setSheetName(e.target.value)}
          style={{ width: "250px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
        />

        <label>Columns</label>
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
            >×</button>
          </div>
        ))}
        <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
          <span style={{ color: "#dc3545" }}>*</span> First two columns are required and cannot be modified
        </p>
        <button type="button" onClick={addColumn} style={{ width: "250px", padding: "8px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add Column</button>
        
        <button type="submit" onClick={handleSubmit} style={{ width: "250px", padding: "8px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Edit Sheet</button>
        <button type="button" onClick={handleDelete} style={{ width: "250px", padding: "8px", backgroundColor: "#FF0B00", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Delete Sheet</button>
      </form>
    </div>
  );
}

EditSheetComponent.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  sheetName: PropTypes.string,
  sheetId: PropTypes.string,
  displayData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  setSelectedSheetId: PropTypes.func.isRequired,
};

export default EditSheetComponent;
