import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getJSONCookie, setJSONCookie } from "../utils/cookieUtils";
import { set } from "../features/settings/SettingsSlice";
import combineSheets from "../utils/combineSheets";

function FilterComponent({ allData, setFilteredData, sheetNames }) {
  const [filters, setFilters] = useState([]);
  const [selectedSheetIdxs, setSelectedSheetIdxs] = useState([]);
  const [data, setData] = useState(allData[0] || []);
  const [headers, setHeaders] = useState(allData[0][0] || []);

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

    const filtersToApply = filters.filter(
      (filter) => filter.column !== "" && filter.values.length > 0
    );

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

    // Update the filtered data state
    setFilteredData([headerRow, ...filteredDataRows]);
  };

  useEffect(() => {
    applyFilters(filters);
  }, [data, filters]);

  useEffect(() => {
    if (selectedSheetIdxs.length > 0) {
      const selectedSheets = selectedSheetIdxs.map((idx) => allData[idx]);
      const alignedData = combineSheets(selectedSheets);

      setHeaders(alignedData[0]);
      setData(alignedData);
    }
  }, [selectedSheetIdxs]);

  return (
    <div>
      <h3>Filter</h3>

      {/* Select Sheets to use */}
      <p>Select Sheets:</p>
      <select
        multiple
        onChange={(e) => {
          const selectedValues = Array.from(e.target.selectedOptions).map(
            (option) => sheetNames.indexOf(option.value)
          );
          setSelectedSheetIdxs(selectedValues);
          console.log(selectedValues);
        }}
      >
        {sheetNames.map((sheetName) => (
          <option key={sheetName} value={sheetName}>
            {sheetName}
          </option>
        ))}
      </select>

      <br />
      <br />

      <p>Filter by:</p>

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
            handleOnChange={(selectedColumnIndex) => {
              handleFilterChange(index, "column", selectedColumnIndex);
              console.log(selectedColumnIndex);
            }}
          />

          {/* Dropdown for selecting the filter value */}
          <MultiSelectOptions
            data={data}
            headerIndex={filter.column}
            selectedValues={filter.values} // Pass the current values here
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
  sheetNames: PropTypes.array.isRequired,
};

function HeaderSelection({ headers, selectedHeader, handleOnChange }) {
  const settings = useSelector((state) => state.settings.value);
  let activeHeaders = headers;

  if (settings?.filterColumns) {
    activeHeaders = headers.filter((header) => {
      const headerSettings = settings?.filterColumns[header];
      return headerSettings?.active || headerSettings === undefined;
    });
  }

  return (
    <select
      value={selectedHeader}
      onChange={(event) => {
        const selectedColumnIndex = headers.indexOf(
          activeHeaders[event.target.value]
        );
        handleOnChange(selectedColumnIndex);
      }}
    >
      <option value="">Select Column</option>
      {activeHeaders.map((header, idx) => (
        <option key={header} value={idx}>
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

function MultiSelectOptions({
  data,
  headerIndex,
  selectedValues,
  handleOnChange,
}) {
  if (headerIndex !== "") {
    const uniqueValues = [
      ...new Set(data.slice(1).map((row) => row[headerIndex])),
    ];

    return (
      <select
        multiple={true}
        onChange={handleOnChange}
        value={selectedValues || []}
      >
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
  selectedValues: PropTypes.array,
  handleOnChange: PropTypes.func.isRequired,
};

export default FilterComponent;
