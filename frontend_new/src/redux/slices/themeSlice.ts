import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeState {
  mode: Theme;
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
}

const initialState: ThemeState = {
  mode: 'light',
  accentColor: 'indigo',
  fontSize: 'md',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.mode = action.payload;
    },
    toggleTheme: (state) => {
      if (state.mode === 'light') {
        state.mode = 'dark';
      } else if (state.mode === 'dark') {
        state.mode = 'light';
      }
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    },
    setFontSize: (state, action: PayloadAction<'sm' | 'md' | 'lg'>) => {
      state.fontSize = action.payload;
    },
    resetTheme: (state) => {
      state.mode = initialState.mode;
      state.accentColor = initialState.accentColor;
      state.fontSize = initialState.fontSize;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setAccentColor,
  setFontSize,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;
