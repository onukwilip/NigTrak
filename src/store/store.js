import { configureStore } from "@reduxjs/toolkit";
import deviceSlice from "./devicesReducer";
import socketDeviceSlice from "./socketDevicesReducer";

const store = configureStore({
  reducer: {
    socketDevices: socketDeviceSlice.reducer,
    devices: deviceSlice.reducer,
  },
});

export default store;
export const sockeDeviceActions = socketDeviceSlice.actions;
export const deviceActions = deviceSlice.actions;
