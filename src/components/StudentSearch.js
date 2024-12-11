import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

function StudentSearch({ data, setDisplayData, sidebarContentIndex }) {
  const settings = useSelector((state) => state.settings.value);

  const [searchValue, setSearchValue] = useState("");

  const applyFilter = () => {
    if (!data || data.length === 0) {
      return;
    }

    const headerRow = data[0];
    let dataRows = data.slice(1);

    let filteredDataRows = dataRows.filter((dataRow) => {
      if (searchValue === "") {
        return true;
      }

      const firstNameColumn = settings?.firstNameColumn || "Student First";
      const lastNameColumn = settings?.lastNameColumn || "Student Last";

      let firstNameIndex = headerRow.indexOf(firstNameColumn);
      let lastNameIndex = headerRow.indexOf(lastNameColumn);

      if (firstNameIndex === -1) {
        firstNameIndex = 0;
      }

      if (lastNameIndex === -1) {
        lastNameIndex = 1;
      }

      if (firstNameIndex >= dataRow.length || lastNameIndex >= dataRow.length) {
        return false;
      }

      // Check if the first, last, or full name contains the search value
      const firstName = dataRow[firstNameIndex]
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const lastName = dataRow[lastNameIndex]
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const fullName = (
        dataRow[firstNameIndex].toLowerCase() +
        " " +
        dataRow[lastNameIndex].toLowerCase()
      ).includes(searchValue.toLowerCase());

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
  setFilteredData: PropTypes.func.isRequired,
  sidebarContentIndex: PropTypes.number.isRequired,
};

export default StudentSearch;
