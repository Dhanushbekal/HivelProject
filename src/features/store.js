import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './apiSlice'; // Ensure the path is correct

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
