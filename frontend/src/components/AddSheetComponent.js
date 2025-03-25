import React, { useState } from "react";
import PropTypes from "prop-types";

function AddSheetComponent({ closeSidebar, setRefresh, accessToken }) {
  const [sheetName, setSheetName] = useState("");
  const [columns, setColumns] = useState([""]);

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
        alert("Sheet added successfully!");
        setSheetName("");
        setColumns([""]);
        closeSidebar();
        setRefresh((prev) => !prev);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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

        <label>Columns</label>
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
      </form>
    </div>
  );
}

AddSheetComponent.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default AddSheetComponent;
