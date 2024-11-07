import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { set } from "./features/settings/SettingsSlice";

import { getJSONCookie, setJSONCookie } from "./utils/cookieUtils";

function SettingsComponent({ data }) {
  const headers = data[0] || [];

  let options = ["Option 1", "Option 2", "Option 3"];
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSelectChange = (event) => {
    const selectedValues = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setSelectedOptions(selectedValues);
  };

  const settings = useSelector((state) => state.settings.value);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedSettings = getJSONCookie("settings");

    if (savedSettings) {
      dispatch(set({...settings,  ...savedSettings}));
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

  return (
    <div>
      <h1>Settings</h1>
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
      <h3>Email:</h3>
      <label>
        Email Columns:
        <br />
        <select
          multiple={true}
          value={selectedOptions}
          onChange={(event) =>
            handleChange({ emailColumns: event.target.selectedOptions })
          }
        >
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </label>
      <p>Selected Options: {selectedOptions.join(", ")}</p>
    </div>
  );
}

export default SettingsComponent;
