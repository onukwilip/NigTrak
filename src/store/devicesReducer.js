import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { clearSimilarArrayObjects } from "../utils";
import { deviceActions } from "./store";

const initialState = {
  devices: [],
};

const deviceSlice = createSlice({
  name: "device",
  initialState: initialState,
  reducers: {
    addDevice(state, { payload }) {
      const newDevicesObject = clearSimilarArrayObjects(payload, "IMEI_Number");
      const oldDevicesObject = clearSimilarArrayObjects(
        state.devices,
        "IMEI_Number"
      );
      const combinedDevices = { ...oldDevicesObject, ...newDevicesObject };
      const devicesToArray = [
        ...Object.entries(combinedDevices).map(([key, device]) => device),
      ];
      state.devices = [...devicesToArray];
      console.log("DEVICE", state.devices);
    },
  },
});

export const getDeviceAction = () => {
  return async (dispatch) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_DOMAIN}/api/device`
    );

    dispatch(deviceActions.addDevice(response?.data));
  };
};

export default deviceSlice;
