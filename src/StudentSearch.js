import React, { useEffect, useState } from "react";

function StudentSearch({ data, setFilteredData, sidebarContentIndex }) {
  const [searchValue, setSearchValue] = useState("");

  const applyFilter = () => {
    const headerRow = data[0];
    let dataRows = data.slice(1);

    let filteredDataRows = dataRows.filter((dataRow) => {
      if (searchValue === "") {
        return true;
      }

      // Check if the first, last, or full name contains the search value
      const firstName = dataRow[0]
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const lastName = dataRow[1]
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const fullName = (
        dataRow[0].toLowerCase() +
        " " +
        dataRow[1].toLowerCase()
      ).includes(searchValue.toLowerCase());

      return firstName || lastName || fullName;
    });

    const filteredData = [headerRow, ...filteredDataRows];

    setFilteredData(filteredData);
  };

  useEffect(() => {
    applyFilter();
  }, [data, searchValue, sidebarContentIndex]);

  return (
    <input
      onChange={(event) => {
        setSearchValue(event.target.value);
      }}
      style={{ display: sidebarContentIndex == 1 ? "none" : "block" }}
      type="text"
      placeholder="Search For Student..."
    />
  );
}

export default StudentSearch;
