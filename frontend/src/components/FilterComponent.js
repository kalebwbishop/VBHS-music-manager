import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getJSONCookie, setJSONCookie } from "../utils/cookieUtils";

function FilterComponent({ data, setFilteredData }) {
  const [selectedSheetIds, setSelectedSheetIds] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filters, setFilters] = useState([]);

  // Retrieve saved selected columns from cookies on load
  useEffect(() => {
    const savedSelectedSheetIds = getJSONCookie("filterSelectedSheetIds") || [];
    setSelectedSheetIds(savedSelectedSheetIds);

    const savedFilters = getJSONCookie("filterSelectedColumns") || [];
    setFilters(savedFilters);
  }, []);

  const handleFilterChange = (filterIdx, field, value) => {
    let updatedFilters = [...filters];

    if (filterIdx >= updatedFilters.length) {
      updatedFilters.push({});
    }

    if (field === "header") {
      if (value === "") {
        updatedFilters[filterIdx] = undefined;
      } else {
        updatedFilters[filterIdx] = { ...updatedFilters[filterIdx], header: value };
      }
    } else if (field === "values") {
      updatedFilters[filterIdx] = {
        ...updatedFilters[filterIdx],
        values: Array.from(value).map((option) => option.value),
      };
    }

    updatedFilters = updatedFilters.filter(
      (filter) => filter !== undefined && filter.header !== undefined
    );

    setFilters(updatedFilters);
    setJSONCookie("filterSelectedColumns", updatedFilters);
  };

  const deleteFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
    setJSONCookie("filterSelectedColumns", updatedFilters);
  };

  const applyFilters = () => {
    if (!data || data.length === 0) return;

    // Get selected sheets
    const selectedSheets = data.filter(sheet => selectedSheetIds.includes(sheet._id));
    
    if (selectedSheets.length === 0) {
      setFilteredData({ columns: [], rows: [] });
      return;
    }

    // Combine data from selected sheets
    let filteredData = {
      columns: [],
      rows: []
    };

    // Get all unique columns from selected sheets
    selectedSheets.forEach(sheet => {
      sheet.columns.forEach(column => {
        if (!column.startsWith('_') && !filteredData.columns.includes(column)) {
          filteredData.columns.push(column);
        }
      });
    });

    // Create a map to store unique students by first and last name
    const studentMap = new Map();

    // Process all selected sheets to combine student data
    selectedSheets.forEach(sheet => {
      sheet.rows.forEach(row => {
        const firstName = row["Student First"] || "";
        const lastName = row["Student Last"] || "";
        const studentKey = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;

        if (studentMap.has(studentKey)) {
          // Merge with existing student data
          const existingStudent = studentMap.get(studentKey);
          filteredData.columns.forEach(column => {
            if (row[column] && !existingStudent[column]) {
              existingStudent[column] = row[column];
            }
          });
        } else {
          // Add new student
          const newStudent = { ...row };
          studentMap.set(studentKey, newStudent);
        }
      });
    });

    // Convert the map values to an array for the combined rows
    filteredData.rows = Array.from(studentMap.values());

    // Apply filters
    filters.forEach((filter) => {
      if (!filter.values || filter.values.length === 0 || !filter.header) return;

      filteredData.rows = filteredData.rows.filter((row) => {
        const rowValue = String(row[filter.header]).toLowerCase();
        return filter.values.some(v => v.toLowerCase() === rowValue);
      });
    });

    setFilteredData(filteredData);
  };

  // Update columns when selected sheets change
  useEffect(() => {
    if (!data || data.length === 0) return;

    applyFilters();
  }, [selectedSheetIds, data, filters]);


  const handleSelectAllSheets = () => {
    const allSheetIds = data.map(sheet => sheet._id);
    setSelectedSheetIds(allSheetIds);
    setJSONCookie("filterSelectedSheetIds", allSheetIds);
  };

  const handleDeselectAllSheets = () => {
    setSelectedSheetIds([]);
    setJSONCookie("filterSelectedSheetIds", []);
  };

  return (
    <div>
      <h3>Filter</h3>

      {/* Select Sheets to use */}
      <p>Select Sheets:</p>
      <select
        multiple
        value={selectedSheetIds}
        onChange={(e) => {
          const selectedValues = Array.from(e.target.selectedOptions).map(
            (option) => option.value
          );
          setSelectedSheetIds(selectedValues);
          setJSONCookie("filterSelectedSheetIds", selectedValues);
        }}
        style={{ width: "100%" }}
      >
        {data.slice(1).map((sheet) => (
          <option key={sheet._id} value={sheet._id}>
            {sheet.name}
          </option>
        ))}
      </select>
      <br />
      {selectedSheetIds.length === 0 ? (
        <button onClick={handleSelectAllSheets}>Select All</button>
      ) : (
        <button onClick={handleDeselectAllSheets}>Deselect All</button>
      )}

      <br />
      <br />

      <p>Filter by:</p>

      {[...filters, {}].map((filter, index) => (
        <div
          key={filter.header + "-" + index}
          style={{
            marginTop: "10px",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ColumnSelection
              selectedColumn={filter.header}
              handleOnChange={(selectedColumn) => {
                handleFilterChange(index, "header", selectedColumn);
              }}
            />

            {index !== filters.length && (
              <>
                <button
                  onClick={() => deleteFilter(index)}
                  style={{ marginLeft: "5px", color: "red" }}
                >
                  Delete
                </button>

                <p
                  style={{
                    marginLeft: "auto",
                  }}
                >
                  {`${filter?.values?.length || 0} Selected`}
                </p>
              </>
            )}
          </div>

          {index !== filters.length && (
            <MultiSelectOptions
              data={data}
              filterHeader={filter.header}
              selectedValues={filter.values}
              handleOnChange={(e) =>
                handleFilterChange(index, "values", e.target.selectedOptions)
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

FilterComponent.propTypes = {
  data: PropTypes.array.isRequired,
  setFilteredData: PropTypes.func.isRequired,
};

function ColumnSelection({ selectedColumn, handleOnChange }) {
  const filterColumns = [
    "Grade",
    "Instrument",
    "Part",
    "Ensemble",
  ];

  return (
    <select
      value={selectedColumn || -1}
      onChange={(e) => {
        handleOnChange(e.target.value);
      }}
    >
      <option value={-1}>Select Column</option>
      {filterColumns.map((column) => (
        <option key={column} value={column}>
          {column}
        </option>
      ))}
    </select>
  );
}

ColumnSelection.propTypes = {
  selectedHeader: PropTypes.string,
  handleOnChange: PropTypes.func.isRequired,
};

function MultiSelectOptions({
  data,
  filterHeader,
  selectedValues,
  handleOnChange,
}) {
  // Get unique values from all selected sheets
  let uniqueValues = [];
  data[0].rows.forEach(row => {
    if (row[filterHeader]) {
      uniqueValues.push(row[filterHeader]);
    }
  });

  // Remove duplicates and invalid values
  uniqueValues = [...new Set(uniqueValues)]
    .filter(value => value !== undefined && value !== "" && value !== null)
    .sort((a, b) => String(a).localeCompare(String(b)));

  if (uniqueValues.length === 0) {
    return <p>No values available for this column</p>;
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <select
        multiple={true}
        onChange={handleOnChange}
        value={selectedValues || []}
        style={{ 
          width: "100%",
          minHeight: "100px",
          padding: "5px"
        }}
      >
        {uniqueValues.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        Hold Ctrl (or Cmd on Mac) to select multiple values
      </p>
    </div>
  );
}

MultiSelectOptions.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  filterHeader: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  selectedValues: PropTypes.array,
  handleOnChange: PropTypes.func.isRequired,
};

export default FilterComponent;
