import { createSlice } from "@reduxjs/toolkit";
import { getJSONCookie } from "../../utils/cookieUtils";

const initialState = 
// getJSONCookie("settings") || 
{
  value: {
    firstNameColumn: "Student First",
    lastNameColumn: "Studnet Last",
    filterColumns: {
      "Student First": {
        active: true,
        type: "sort",
      },
      "Student Last": {
        active: true,
        type: "sort",
      },
      "Grade": {
        active: true,
        type: "select",
      },
      "Student Email": {
        active: false,
        type: null,
      },
      "Student Cell": {
        active: false,
        type: null,
      },
      "Parent 1 First": {
        active: false,
        type: null,
      },
      "Parent 1 Last": {
        active: false,
        type: null,
      },
      "Parent 1 email": {
        active: false,
        type: null,
      },
      "Parent 1 cell": {
        active: false,
        type: null,
      },
      "Parent 2 First": {
        active: false,
        type: null,
      },
      "Parent 2 Last": {
        active: false,
        type: null,
      },
      "Parent 2 email": {
        active: false,
        type: null,
      },
      "Parent 2 cell": {
        active: false,
        type: null,
      },
    },
  },
};

export const SettingsSlice = createSlice({
  name: "settings",
  initialState: initialState,
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { set } = SettingsSlice.actions;

export default SettingsSlice.reducer;
