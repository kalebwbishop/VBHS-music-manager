import { createSlice } from "@reduxjs/toolkit";
import { getJSONCookie } from "../../utils/cookieUtils";

const initialState =
  getJSONCookie("settings") ||
  {
    value: {
      filterColumns: {
        Grade: { active: true },
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
        "Student Last": { active: false }
      },
      sortColumns: {
        Grade: { active: false },
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

export const SettingsSlice = createSlice({
  name: "settings",
  initialState: initialState,
  reducers: {
    set: (state, action) => {
      console.log("SettingsSlice set action", action.payload);
      state.value = action.payload;
    },
  },
});

export const { set } = SettingsSlice.actions;

export default SettingsSlice.reducer;
