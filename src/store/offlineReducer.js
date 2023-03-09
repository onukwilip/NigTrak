import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOffline: true,
};

const offlineSlice = createSlice({
  name: "offline",
  initialState: initialState,
  reducers: {
    toogleOffline(state, { payload }) {
      state.isOffline = payload;
    },
  },
});

export default offlineSlice;
