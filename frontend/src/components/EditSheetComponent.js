import React, { useState } from "react";
import PropTypes from "prop-types";
import { setJSONCookie, getJSONCookie } from "../utils/cookieUtils";

function EditSheetComponent({ closeSidebar, setRefresh, accessToken, sheetName, sheetId, displayData }) {
  const [sheetNameDisp, setSheetName] = useState(sheetName);
  const [columns, setColumns] = useState(displayData.columns.filter((cell) => cell.charAt(0) !== "_"));
  const [position, setPosition] = useState(() => {
    const sheetOrder = getJSONCookie("sheetOrder") || [];
    const currentIndex = sheetOrder.findIndex(order => order.id === sheetId);
    return currentIndex !== -1 ? currentIndex : sheetOrder.length;
  });

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

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!sheetNameDisp.trim() || columns.some(col => !col.trim())) {
      alert("Sheet name and all columns must be filled out.");
      return;
    }
    
    const newSheet = { name: sheetNameDisp, columns, position };
    
    // Update sheet order in cookie
    const sheetOrder = getJSONCookie("sheetOrder") || [];
    const existingIndex = sheetOrder.findIndex(order => order.id === sheetId);
    
    if (existingIndex !== -1) {
      sheetOrder[existingIndex] = { id: sheetId, position };
    } else {
      sheetOrder.push({ id: sheetId, position });
    }
    
    // Sort by position and save
    sheetOrder.sort((a, b) => a.position - b.position);
    setJSONCookie("sheetOrder", sheetOrder);
    
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
        console.log("Sheet edited successfully:", data);
        alert("Sheet edited successfully!");
        setSheetName("");
        setColumns([""]);
        closeSidebar();
        setRefresh((prev) => !prev);
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
      // Remove from sheet order
      const sheetOrder = getJSONCookie("sheetOrder") || [];
      const updatedOrder = sheetOrder.filter(order => order.id !== sheetId);
      setJSONCookie("sheetOrder", updatedOrder);
      
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
          console.log("Sheet deleted successfully:", data);
          alert("Sheet deleted successfully!");
          closeSidebar();
          setRefresh((prev) => !prev);
        })
        .catch((error) => {
          console.error("Error:", error);
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

        <label>Position (0-based index)</label>
        <input
          type="number"
          min="0"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
          style={{ width: "250px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
        />

        <label>Columns</label>
        {columns.map((column, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="text"
              value={column}
              onChange={(e) => handleColumnChange(index, e.target.value)}
              style={{ width: "200px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
            <button type="button" onClick={() => removeColumn(index)} style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px", cursor: "pointer" }}>×</button>
          </div>
        ))}
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
};

export default EditSheetComponent;
