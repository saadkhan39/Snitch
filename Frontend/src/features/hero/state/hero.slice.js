import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hero: null,
  isLoading: false,
  error: null,
};

const heroSlice = createSlice({
  name: "hero",

  initialState,

  reducers: {
    // ================================
    // LOADING
    // ================================
    heroLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // ================================
    // GET / SET HERO
    // ================================
    heroSuccess: (state, action) => {
      state.isLoading = false;
      state.hero = action.payload;
      state.error = null;
    },

    // ================================
    // ERROR
    // ================================
    heroFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ================================
    // CLEAR HERO
    // ================================
    clearHero: (state) => {
      state.hero = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  heroLoading,
  heroSuccess,
  heroFailure,
  clearHero,
} = heroSlice.actions;

export default heroSlice.reducer;