import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { set } from "../features/settings/SettingsSlice";

import { getJSONCookie, setJSONCookie } from "../utils/cookieUtils";
import combineSheets from "../utils/combineSheets";

function SettingsComponent({ data }) {
  const headerRow = combineSheets(data)[0].filter((cell) => cell.charAt(0) != '_');

  const settings = useSelector((state) => state.settings.value);
  const dispatch = useDispatch();

  const [filterColumns, setFilterColumns] = useState([]);
  const [sortColumns, setSortColumns] = useState([]);

  useEffect(() => {
    const savedSettings = getJSONCookie("settings");

    if (savedSettings) {
      dispatch(set({ ...settings, ...savedSettings }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (settings?.filterColumns) {
      const activeFilterColumns = Object.entries(settings.filterColumns)
        .filter(([_, value]) => value.active)
        .map(([key, _]) => key);
      setFilterColumns(activeFilterColumns);
    }

    if (settings?.sortColumns) {
      const activeSortColumns = Object.entries(settings.sortColumns)
        .filter(([_, value]) => value.active)
        .map(([key, _]) => key);
      setSortColumns(activeSortColumns);
    }
  }, [settings]);

  const handleColumnSelection = (settingsKey, selectedHeaders, setter) => {
    // Update local state
    setter(selectedHeaders);

    // Update settings object
    const updatedHeaders = headerRow.reduce((acc, header) => {
      acc[header] = { active: selectedHeaders.includes(header) };
      return acc;
    }, {});

    handleChange({ [settingsKey]: updatedHeaders });
  };

  const handleChange = (change) => {
    const newSettings = { ...settings, ...change };
    setJSONCookie("settings", newSettings);
    dispatch(set(newSettings));
  };

  return (
    <div>
      <h3>Filter:</h3>
      <label>
        Which columns should be filterable?
        <br />
        <select
          style={{ height: "150px" }}
          multiple={true}
          value={filterColumns}
          onChange={(event) => {
            const selectedValues = Array.from(event.target.selectedOptions).map(
              (option) => option.value
            );
            handleColumnSelection("filterColumns", selectedValues, setFilterColumns);
          }}
        >
          {headerRow.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </label>
      <h3>Sort:</h3>
      <label>
        Which columns should be sortable?
        <br />
        <select
          style={{ height: "150px" }}
          multiple={true}
          value={sortColumns}
          onChange={(event) => {
            const selectedValues = Array.from(event.target.selectedOptions).map(
              (option) => option.value
            );
            handleColumnSelection("sortColumns", selectedValues, setSortColumns);
          }}
        >
          {headerRow.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

SettingsComponent.propTypes = {
  data: PropTypes.array.isRequired,
};

export default SettingsComponent;