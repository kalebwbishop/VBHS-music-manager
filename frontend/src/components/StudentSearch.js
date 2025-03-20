import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

function StudentSearch({ data, setDisplayData, sidebarContentIndex }) {
  const [searchValue, setSearchValue] = useState("");

  const mergedData = data

  const applyFilter = () => {
    if (!mergedData || mergedData.length === 0) {
      return;
    }

    const headerRow = mergedData[0];
    const dataRows = mergedData.slice(1);

    const firstNameColumn = "Student First";
    const lastNameColumn = "Student Last";

    let firstNameIndex = headerRow.indexOf(firstNameColumn);
    let lastNameIndex = headerRow.indexOf(lastNameColumn);

    if (firstNameIndex === -1) {
      firstNameIndex = 0;
    }

    if (lastNameIndex === -1) {
      lastNameIndex = 1;
    }

    const filteredDataRows = dataRows.filter((dataRow) => {
      if (searchValue === "") {
        return true;
      }

      if (firstNameIndex >= headerRow.length || lastNameIndex >= headerRow.length) {
        return false;
      }

      // Check if the first, last, or full name contains the search value
      const firstNameData = dataRow[firstNameIndex];
      const firstName = firstNameData
        ? firstNameData.toLowerCase().includes(searchValue.toLowerCase())
        : false;

      const lastNameData = dataRow[lastNameIndex];
      const lastName = lastNameData
        ? lastNameData.toLowerCase().includes(searchValue.toLowerCase())
        : false;

      const fullNameData =
        dataRow[firstNameIndex] + " " + dataRow[lastNameIndex];
      const fullName = fullNameData
        .toLowerCase()
        .includes(searchValue.toLowerCase());

      return firstName || lastName || fullName;
    });

    const filteredData = [headerRow, ...filteredDataRows];

    setDisplayData(filteredData);
  };

  useEffect(() => {
    applyFilter();
  }, [data, searchValue]);

  return (
    <input
      onChange={(event) => {
        setSearchValue(event.target.value);
      }}
      style={{ display: sidebarContentIndex === 1 ? "none" : "block" }}
      type="text"
      placeholder="Search For Student..."
    />
  );
}

StudentSearch.propTypes = {
  data: PropTypes.array.isRequired,
  setDisplayData: PropTypes.func.isRequired,
  sidebarContentIndex: PropTypes.number.isRequired,
};

export default StudentSearch;
