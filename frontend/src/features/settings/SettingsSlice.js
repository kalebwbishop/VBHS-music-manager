import { createSlice } from "@reduxjs/toolkit";
import { getJSONCookie } from "../../utils/cookieUtils";

const initialState = {
  value: {
    filterColumns: {
      "Grade": { active: true },
      "Parent 1 First": { active: false },
      "Parent 1 Last": { active: false },
      "Parent 1 cell": { active: false },
      "Parent 1 email": { active: false },
      "Parent 2 First": { active: false },
      "Parent 2 Last": { active: false },
      "Parent 2 cell": { active: false },
      "Parent 2 email": { active: false },
      "Student Cell": { active: false },
      "Student Email": { active: false },
      "Student First": { active: false },
      "Student Last": { active: false },
      "Instrument": { active: true },
      "Part": { active: true },
      "Ensemble": { active: true },
    },
    sortColumns: {
      "Grade": { active: true },
      "Parent 1 First": { active: false },
      "Parent 1 Last": { active: false },
      "Parent 1 cell": { active: false },
      "Parent 1 email": { active: false },
      "Parent 2 First": { active: false },
      "Parent 2 Last": { active: false },
      "Parent 2 cell": { active: false },
      "Parent 2 email": { active: false },
      "Student Cell": { active: false },
      "Student Email": { active: false },
      "Student First": { active: true },
      "Student Last": { active: true }
    }
  }
};

// Try to load settings from cookies and merge with initial state
const savedState = getJSONCookie("settings");
// const finalInitialState = savedState ? { ...initialState, ...savedState } : initialState;
const finalInitialState = initialState;

export const SettingsSlice = createSlice({
  name: "settings",
  initialState: finalInitialState,
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { set } = SettingsSlice.actions;

export default SettingsSlice.reducer;
