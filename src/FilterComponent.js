import React, { useEffect, useState } from "react";

function FilterComponent({ data, setFilteredData }) {
  const [filters, setFilters] = useState([]);

  // Extract headers from the first row of data
  const headers = data[0] || [];

  const addFilter = () => {
    setFilters([...filters, { column: "", condition: "", values: [""] }]);
  };

  const handleFilterChange = (index, field, value, orIndex = 0) => {
    const updatedFilters = filters.map((filter, i) => {
      if (i === index) {
        if (field === "values") {
          const newValues = [...filter.values];
          newValues[orIndex] = value;
          return { ...filter, values: newValues };
        }
        return { ...filter, [field]: value };
      }
      return filter;
    });
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const addOrValue = (index) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? { ...filter, values: [...filter.values, ""] } : filter
    );
    setFilters(updatedFilters);
  };

  const deleteFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const getUniqueColumnValues = (columnIndex) => {
    // Return unique values in the selected column for the dropdown
    return [...new Set(data.slice(1).map((row) => row[columnIndex]))];
  };

  const applyFilters = (filtersToApply) => {
    // Separate the header row and the data rows
    const headerRow = data[0];
    const dataRows = data.slice(1);

    // Apply filters only to the data rows
    const filteredDataRows = dataRows.filter((row) => {
      return filtersToApply.every((filter) => {
        let filterBool = false;

        const cellValue = row[filter.column];

        filter.values.forEach((filterValue) => {
          if (filterBool) {
            return;
          }

          if (filter.column === "" || filter.condition === "") {
            filterBool = true;
          }

          switch (filter.condition) {
            case "exists":
              filterBool = cellValue !== undefined && cellValue !== "";
              break;
            case "doesNotExist":
              filterBool = cellValue === undefined || cellValue === "";
              break;
            case "is":
              filterBool = cellValue === filterValue || filterValue === "";
              break;
            case "isNot":
              filterBool = cellValue !== filterValue || filterValue !== "";
              break;
            default:
              filterBool = true;
          }
        });

        return filterBool;
      });
    });

    // Combine the header row with the filtered data rows
    const filteredData = [headerRow, ...filteredDataRows];

    setFilteredData(filteredData);
  };

  useEffect(() => {
    applyFilters(filters);
  }, [data]);

  return (
    <div>
      <h3>Filter</h3>
      <button onClick={addFilter}>Add Filter</button>

      {filters.map((filter, index) => (
        <div
          key={index}
          style={{
            marginTop: "10px",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          {/* Dropdown for selecting the column header */}
          <select
            value={filter.column}
            onChange={(e) =>
              handleFilterChange(index, "column", e.target.value)
            }
          >
            <option value="">Select Column</option>
            {headers.map((header, i) => (
              <option key={i} value={i}>
                {header}
              </option>
            ))}
          </select>

          {/* Dropdown for selecting condition */}
          <select
            value={filter.condition}
            onChange={(e) =>
              handleFilterChange(index, "condition", e.target.value)
            }
          >
            <option value="">Select Condition</option>
            <option value="exists">Exists</option>
            <option value="doesNotExist">Does Not Exist</option>
            <option value="is">Is</option>
            <option value="isNot">Is Not</option>
          </select>

          {/* Delete filter button */}
          <button
            onClick={() => deleteFilter(index)}
            style={{ marginLeft: "5px", color: "red" }}
          >
            Delete
          </button>

          {/* Dropdown for column values with 'or' option for "is" and "isNot" conditions */}
          {filter.column !== "" &&
            (filter.condition === "is" || filter.condition === "isNot") &&
            filter.values.map((val, orIndex) => (
              <div
                key={orIndex}
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="text"
                  list={`values-${index}-${orIndex}`}
                  placeholder="Search or select a value"
                  onChange={(e) =>
                    handleFilterChange(index, "values", e.target.value, orIndex)
                  }
                  value={val}
                />
                {orIndex === filter.values.length - 1 && (
                  <button
                    onClick={() => addOrValue(index)}
                    style={{ marginLeft: "5px" }}
                  >
                    Or
                  </button>
                )}

                {/* Datalist for search dropdown values */}
                {filter.column !== "" && (
                  <datalist id={`values-${index}-${orIndex}`}>
                    {getUniqueColumnValues(filter.column).map((value, i) => (
                      <option key={i} value={value}>
                        {value}
                      </option>
                    ))}
                  </datalist>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default FilterComponent;
