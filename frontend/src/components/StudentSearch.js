import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

function StudentSearch({ data, setDisplayData, selectedSheetId, setSearchValue, searchValue }) {
  const originalDataRef = useRef(null);

  const applyFilter = () => {
    if (!data || data.length === 0) {
      return;
    }

    const allData = data.find(sheet => sheet._id === selectedSheetId);
    if (!allData) {
      return;
    }

    // Store the original data when it changes
    originalDataRef.current = allData;

    const firstNameColumn = "Student First";
    const lastNameColumn = "Student Last";

    let firstNameIndex = allData.columns.indexOf(firstNameColumn);
    let lastNameIndex = allData.columns.indexOf(lastNameColumn);

    const filteredDataRows = allData.rows.filter((dataRow) => {
      if (searchValue === "") {
        return true;
      }

      if (firstNameIndex >= allData.columns.length || lastNameIndex >= allData.columns.length) {
        return false;
      }

      // Check if the first, last, or full name contains the search value
      const firstNameData = dataRow["Student First"] || "";
      const lastNameData = dataRow["Student Last"] || "";

      const firstName = firstNameData
        ? firstNameData.toLowerCase().includes(searchValue.toLowerCase())
        : false;

      const lastName = lastNameData
        ? lastNameData.toLowerCase().includes(searchValue.toLowerCase())
        : false;

      const fullName = (firstNameData + " " + lastNameData)
        ? (firstNameData + " " + lastNameData).toLowerCase().includes(searchValue.toLowerCase())
        : false;

      return firstName || lastName || fullName;
    });

    const filteredData = {
      columns: allData.columns,
      rows: filteredDataRows
    }

    setDisplayData(filteredData);
  };

  useEffect(() => {
    applyFilter();
  }, [searchValue, selectedSheetId]);

  return (
    <div>
      <input
        onChange={(event) => {
          setSearchValue(event.target.value);
        }}
        value={searchValue}
        type="text"
        placeholder="Search For Student..."
        style={{ paddingRight: '30px' }}
      />
      {searchValue && (
        <button
          onClick={() => setSearchValue('')}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            fontSize: '16px',
            color: '#666'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

StudentSearch.propTypes = {
  data: PropTypes.array.isRequired,
  setDisplayData: PropTypes.func.isRequired,
  selectedSheetId: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  searchValue: PropTypes.string.isRequired,
};

export default StudentSearch;
