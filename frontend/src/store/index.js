import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../features/settings/SettingsSlice';

const store = configureStore({
  reducer: {
    settings: settingsReducer,
  },
});

export default store;