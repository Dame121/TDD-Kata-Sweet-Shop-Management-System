import { configureStore } from '@reduxjs/toolkit';
import { userReducer, themeReducer } from './slices';

/**
 * Redux store configuration
 * Configured with user and theme slices
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
