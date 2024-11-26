import { createSlice } from "@reduxjs/toolkit";
import { getJSONCookie } from "../../utils/cookieUtils";

const initialState =
  getJSONCookie("settings") ||
  {
    value: {}
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
