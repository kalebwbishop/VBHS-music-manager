import React from "react";
import PropTypes from "prop-types";

function ModifyStudentComponent({ data, closeSidebar, selectedRowId, setRefresh, accessToken }) {
  if (!data || data.length === 0) {
    return <p>No student data available.</p>;
  }

  // Get header row without underscore-prefixed keys
  const headerRow = data.columns.filter((cell) => !cell.startsWith("_"));

  // Extract student data (adjusting for header row)
  const studentData = data.rows.find((row) => row._id === selectedRowId);
  if (!studentData) return <p>Invalid student selection.</p>;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedStudent = {};

    for (const [key, value] of formData.entries()) {
      updatedStudent[key] = value;
    }

    headerRow.forEach((header) => {
      updatedStudent[header] = formData.get(header);
    });

    try {
      const response = await fetch(
        `${window.env.REACT_APP_BACKEND_URL}/api/sheet/sheetRow/${studentData._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedStudent),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update student data");
      }

      alert("Student updated successfully!");
      closeSidebar();
       // Trigger a refresh to update the data
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update student.");
    }
  };

  return (
    <div style={{ paddingBottom: "50px" }}>
      <p>Here you can modify students.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {headerRow.map((header, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column" }}>
            <label>{header}</label>
            <input
              type="text"
              name={header}
              defaultValue={studentData[header] || ""}
              style={{ width: "250px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
          </div>
        ))}
        <button type="submit" style={{ width: "250px", padding: "8px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Update Student
        </button>
      </form>
    </div>
  );
}

ModifyStudentComponent.propTypes = {
  data: PropTypes.array.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  selectedRowId: PropTypes.string.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default ModifyStudentComponent;
