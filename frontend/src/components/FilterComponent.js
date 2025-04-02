import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getJSONCookie, setJSONCookie } from "../utils/cookieUtils";
import combineSheets from "../utils/combineSheets";

function FilterComponent({ allData, setFilteredData, sheetNames }) {
  const [selectedSheetIdxs, setSelectedSheetIdxs] = useState(
    Array.from({ length: allData.length }, (_, i) => i)
  );
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState([]);

  // Retrieve saved selected columns from cookies on load
  useEffect(() => {
    const savedSelectedSheets = getJSONCookie("selectedFilterSheets") || [];
    setSelectedSheetIdxs(savedSelectedSheets);

    const savedFilters = getJSONCookie("selectedFilters") || [];
    setFilters(savedFilters);
  }, []);

  const handleFilterChange = (filterIdx, field, value) => {
    let updatedFilters = [...filters, {}].map((filter, idx) => {
      if (idx !== filterIdx) {
        return filter;
      }

      if (field === "header") {
        if (value === "") {
          return undefined;
        }
        return { header: value };
      }
      if (field === "values") {
        return {
          ...filter,
          values: Array.from(value).map((option) => option.value),
        };
      }
    });

    updatedFilters = updatedFilters.filter(
      (filter) => filter !== undefined && filter.header !== undefined
    );

    if (
      updatedFilters.length > 0 &&
      Object.keys(updatedFilters[updatedFilters.length - 1]).length === 0
    ) {
      updatedFilters = updatedFilters.slice(0, -1);
    }

    setFilters(updatedFilters);
    setJSONCookie("selectedFilters", updatedFilters);
  };

  const deleteFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
  };

  const applyFilters = (filters) => {
    let filteredData = data;

    filters.forEach((filter) => {
      if (!filter.values) return;
      if (filter.values.length === 0) return;
      if (!filter.header) return;
      if (filter.header === "") return;
      if (headers.indexOf(filter.header) === -1) return;

      const filterHeaderIdx = headers.indexOf(filter.header);
      filteredData = filteredData.filter((row) =>
        filter.values.map(v => v.toLowerCase()).includes(String(row[filterHeaderIdx]).toLowerCase())
      );
    });

    setFilteredData([headers, ...filteredData]);
  };

  useEffect(() => {
    applyFilters(filters);
  }, [data, filters]);

  const handleSelectAllSheets = () => {
    setSelectedSheetIdxs(Array.from({ length: allData.length }, (_, i) => i));
  };

  const handleDeselectAllSheets = () => {
    setSelectedSheetIdxs([]);
  };

  useEffect(() => {
    const selectedSheets = selectedSheetIdxs.map((idx) => allData[idx]);
    const combinedData = combineSheets(selectedSheets, true);

    setHeaders(combinedData[0]);
    setData(combinedData.slice(1));

    setJSONCookie("selectedFilterSheets", selectedSheetIdxs);
  }, [selectedSheetIdxs]);

  return (
    <div>
      <h3>Filter</h3>

      {/* Select Sheets to use */}
      <p>Select Sheets:</p>
      <select
        multiple
        value={Array.from(selectedSheetIdxs.map((idx) => sheetNames[idx]))}
        onChange={(e) => {
          const selectedValues = Array.from(e.target.selectedOptions).map(
            (option) => sheetNames.indexOf(option.value)
          );
          setSelectedSheetIdxs(selectedValues);
        }}
        style={{ width: "100%" }}
      >
        {sheetNames.map((sheetName) => (
          <option key={sheetName} value={sheetName}>
            {sheetName}
          </option>
        ))}
      </select>
      <br />
      {selectedSheetIdxs.length === 0 ? (
        <button onClick={handleSelectAllSheets}>Select All</button>
      ) : (
        <button onClick={handleDeselectAllSheets}>Deselect All</button>
      )}

      <br />
      <br />

      <p>Filter by:</p>

      {[...filters, {}].map((filter, index) => (
        <div
          key={filter.column + "-" + index}
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
            {/* Dropdown for selecting the column header */}
            <HeaderSelection
              headers={headers}
              selectedHeader={filter.header}
              handleOnChange={(selectedHeaderIdx) => {
                handleFilterChange(index, "header", headers[selectedHeaderIdx]);
              }}
            />

            {index !== filters.length && (
              <>
                {/* Delete filter button */}
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
            // Dropdown for selecting the filter values
            <MultiSelectOptions
              headers={headers}
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
  allData: PropTypes.array.isRequired,
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

  const selectValue = selectedHeader
    ? activeHeaders.indexOf(selectedHeader)
    : -2;

  return (
    <select
      value={selectValue}
      onChange={(e) => {
        handleOnChange(headers.indexOf(activeHeaders[e.target.value]));
      }}
    >
      <option value={-2}>Select Column</option>
      {activeHeaders.map((header, idx) => (
        <option key={header} value={idx}>
          {header}
        </option>
      ))}
      {selectValue === -1 && (
        <option value={-1}>{`${selectedHeader} (No Values)`}</option>
      )}
    </select>
  );
}

HeaderSelection.propTypes = {
  headers: PropTypes.array.isRequired,
  selectedHeader: PropTypes.string,
  handleOnChange: PropTypes.func.isRequired,
};

function MultiSelectOptions({
  headers,
  data,
  filterHeader,
  selectedValues,
  handleOnChange,
}) {
  const filterHeaderIdx = headers.indexOf(filterHeader);

  let uniqueValues = data.map((row) => row[filterHeaderIdx]);
  if (selectedValues) {
    uniqueValues = [...uniqueValues, ...selectedValues];
  }
  uniqueValues = [...new Set(uniqueValues)];
  uniqueValues = uniqueValues.filter(
    (value) => value !== undefined && value !== "" && value !== null
  );

  if (uniqueValues.length === 0) {
    return null;
  }

  return (
    <select
      multiple={true}
      onChange={handleOnChange}
      value={selectedValues || []}
      style={{ width: "100%" }}
    >
      {uniqueValues.map((value, i) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}

MultiSelectOptions.propTypes = {
  headers: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  filterHeader: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  selectedValues: PropTypes.array,
  handleOnChange: PropTypes.func.isRequired,
};

export default FilterComponent;
