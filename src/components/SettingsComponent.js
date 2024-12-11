import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { set } from "../features/settings/SettingsSlice";

import { getJSONCookie, setJSONCookie } from "../utils/cookieUtils";

function SettingsComponent({ data }) {
  const headers = data[0] || [];

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

  const handleChange = (change) => {
    let rejectChange = false;

    Object.entries(change).forEach(([_, value]) => {
      if (value === "") {
        rejectChange = true;
      }
    });

    if (rejectChange) {
      return;
    }

    const newSettings = { ...settings, ...change };

    setJSONCookie("settings", newSettings);
    dispatch(set(newSettings));
  };

  const handleColumnSelection = (settingsKey, selectedHeaders) => {
    let updatedHeaders = {};

    // Add all selected headers to settings
    selectedHeaders.forEach((header) => {
      updatedHeaders[header] = { active: true };
    });

    // Add all unselected headers to settings
    const unselectedHeaders = headers.filter(
      (header) => !selectedHeaders.includes(header)
    );

    unselectedHeaders.forEach((header) => {
      updatedHeaders[header] = { active: false };
    });

    handleChange({ [settingsKey]: updatedHeaders });
  }

  useEffect(() => {
    if (settings?.filterColumns) {
      setFilterColumns(
        Object.entries(settings.filterColumns)
          .filter(([_, value]) => value.active)
          .map(([key, _]) => key)
      );
    }

    if (settings?.sortColumns) {
      setSortColumns(
        Object.entries(settings.sortColumns)
          .filter(([_, value]) => value.active)
          .map(([key, _]) => key)
      );
    }
  }
  , [settings]);

  return (
    <div>
      <h3>Student Search:</h3>
      <label>
        Student First Name Column
        <select
          value={settings?.firstNameColumn ?? "Loading"}
          onChange={(event) =>
            handleChange({ firstNameColumn: event.target.value })
          }
        >
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </label>
      <br />
      <br />
      <label>
        Student Last Name Column:
        <select
          value={settings?.lastNameColumn ?? "Loading"}
          onChange={(event) =>
            handleChange({ lastNameColumn: event.target.value })
          }
        >
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </label>
      <h3>Filter:</h3>
      <label>
        Which columns should be filterable?
        <br />
        <select
          style={{ height: "150px" }}
          multiple={true}
          value={filterColumns ?? []}
          onChange={(event) => {
            const selectedValues = Array.from(event.target.selectedOptions).map(
              (option) => option.value
            );
            handleColumnSelection("filterColumns", selectedValues);
          }}
        >
          {headers.map((header) => (
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
          value={sortColumns ?? []}
          onChange={(event) => {
            const selectedValues = Array.from(event.target.selectedOptions).map(
              (option) => option.value
            );
            handleColumnSelection("sortColumns", selectedValues);
          }}
        >
          {headers.map((header) => (
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
