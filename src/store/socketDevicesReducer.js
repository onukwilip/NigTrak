import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const socketDeviceSlice = createSlice({
  name: "socketDevice",
  initialState: initialState,
  reducers: {
    putDevice(devices, action) {
      const device = action.payload;
      devices[device?.imei] = device;
    },
    deleteDevice(devices, action) {
      const { payload: device } = action;
      delete devices[device?.imei];
    },
  },
});

export default socketDeviceSlice;
