import { socketDeviceState, socketDeviceType } from "../types/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const socketDeviceSlice = createSlice({
  name: "socketDevice",
  initialState: initialState,
  reducers: {
    putDevice(devices: any, action: any) {
      const device: socketDeviceType = action.payload;
      devices[device?.imei] = device;
    },
    deleteDevice(devices: any, action: any) {
      const device: socketDeviceState = action.payload;
      delete devices[device?.imei];
    },
    deleteAll(devices: any) {
      for (const key in devices) {
        delete devices[key];
      }
    },
  },
});

export default socketDeviceSlice;
