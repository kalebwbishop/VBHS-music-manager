import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getJSONCookie, setJSONCookie } from "./utils/cookieUtils";

function FilterComponent({ data, setFilteredData }) {
  const [filters, setFilters] = useState([]);

  // Extract headers from the first row of data
  const headers = data[0] || [];

  // Retrieve saved selected columns from cookies on load
  useEffect(() => {
    const savedFilters = getJSONCookie("selectedFilters") || [];
    setFilters(savedFilters);
  }, []);

  const addFilter = () => {
    setFilters([...filters, { column: "", values: [] }]);
  };

  const handleFilterChange = (index, field, value) => {
    const updatedFilters = filters.map((filter, i) => {
      if (i !== index) {
        return filter;
      }

      if (field === "column") {
        if (value === "") {
          return { column: "", values: [""] };
        }

        return { ...filter, [field]: value };
      }

      if (field === "values") {
        const valuesArray = Array.from(value).map((option) => option.value);
        return { ...filter, values: valuesArray };
      }
    });

    setJSONCookie("selectedFilters", updatedFilters);
    setFilters(updatedFilters);

    console.log(updatedFilters);
  };

  const deleteFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);

    setJSONCookie("selectedFilters", updatedFilters);
    setFilters(updatedFilters);
  };

  const applyFilters = (filters) => {
    // Separate the header row and the data rows
    const headerRow = data[0];
    const dataRows = data.slice(1);

    const filtersToApply = filters.filter((filter) => filter.column !== "" && filter.values.length > 0);

    // Apply filters only to the data rows
    const filteredDataRows = dataRows.filter((row) => {
      return filtersToApply.every((filter) => {
        const columnIndex = filter.column;

        if (columnIndex === "") {
          return true;
        }

        if (filter.values.length === 0) {
          return true;
        }

        const cellValue = row[columnIndex];
        
        // Check if the cell matches one of the values in the filter
        if (filter.values && filter.values.length > 0) {
          return filter.values.includes(cellValue);
        }
        return true;
      });
    });

    // Sort the data based on the order of filters
    const sortedDataRows = [...filteredDataRows].sort((a, b) => {
      for (const filter of filters) {
        const columnIndex = filter.column;

        const valueA = a[columnIndex];
        const valueB = b[columnIndex];

        // Attempt to transform values into integers before sorting
        const intValueA = parseInt(valueA, 10);
        const intValueB = parseInt(valueB, 10);

        if (!isNaN(intValueA) && !isNaN(intValueB)) {
          if (intValueA < intValueB) return -1;
          if (intValueA > intValueB) return 1;
        } else {
          // Fallback to string comparison if values are not integers
          if (valueA < valueB) return -1;
          if (valueA > valueB) return 1;
        }
      }
      return 0; // if all criteria match, keep original order
    });

    // Combine the header row with the sorted data rows
    const sortedData = [headerRow, ...sortedDataRows];

    setFilteredData(sortedData);
  };

  useEffect(() => {
    applyFilters(filters);
  }, [data, filters]);

  return (
    <div>
      <h3>Filter</h3>
      <button onClick={() => addFilter()}>Add Filter</button>

      {filters?.map((filter, index) => (
        <div
          key={filter.column + "-" + index}
          style={{
            marginTop: "10px",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          {/* Dropdown for selecting the column header */}
          <HeaderSelection
            headers={headers}
            selectedHeader={filter.column}
            handleOnChange={(e) =>
              handleFilterChange(index, "column", e.target.value)
            }
          />

          {/* Dropdown for selecting the filter value */}
          <MultiSelectOptions
            data={data}
            headerIndex={filter.column}
            handleOnChange={(e) =>
              handleFilterChange(index, "values", e.target.selectedOptions)
            }
          />

          {/* Delete filter button */}
          <button
            onClick={() => deleteFilter(index)}
            style={{ marginLeft: "5px", color: "red" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

FilterComponent.propTypes = {
  data: PropTypes.array.isRequired,
  setFilteredData: PropTypes.func.isRequired,
};

function HeaderSelection({ headers, selectedHeader, handleOnChange }) {
  const settings = useSelector((state) => state.settings.value);

  const activeHeaders = headers.filter((header) => {
    const headerSettings = settings?.filterColumns[header];
    return headerSettings?.active || headerSettings === undefined;
  });

  return (
    <select value={selectedHeader} onChange={handleOnChange}>
      <option value="">Select Column</option>
      {activeHeaders.map((header, i) => (
        <option key={header} value={i}>
          {header}
        </option>
      ))}
    </select>
  );
}

HeaderSelection.propTypes = {
  headers: PropTypes.array.isRequired,
  selectedHeader: PropTypes.string,
  handleOnChange: PropTypes.func.isRequired,
};

function MultiSelectOptions({ data, headerIndex, handleOnChange }) {
  const settings = useSelector((state) => state.settings.value);

  const headerSettings = settings?.filterColumns[data[0][headerIndex]];

  if (headerSettings?.type === "sort") {
    return null;
  }

  if (headerIndex !== "") {
    const uniqueValues = [
      ...new Set(data.slice(1).map((row) => row[headerIndex])),
    ];

    return (
      <select multiple={true} onChange={handleOnChange}>
        {uniqueValues.map((value, i) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    );
  }

  return null;
}

MultiSelectOptions.propTypes = {
  data: PropTypes.array.isRequired,
  headerIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  handleOnChange: PropTypes.func.isRequired,
};

export default FilterComponent;
