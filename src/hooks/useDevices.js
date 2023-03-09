import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeviceAction } from "../store/devicesReducer";

class OptionsType {
  constructor() {
    this.devicesOptions = [];
    this.setDevicesOptions = () => {};
  }
}

const useDevices = (/**@type  OptionsType */ options) => {
  const devices = useSelector((state) => state.devices.devices);
  const [fetchingDevices, setFetchingDevices] = useState(false);
  const dispatch = useDispatch();

  const handleFetchDevices = () => {
    if (!devices && !fetchingDevices) {
      dispatch(getDeviceAction());
      setFetchingDevices(true);
    }
  };

  handleFetchDevices();

  useEffect(() => {
    if (!options?.devicesOptions)
      options?.setDevicesOptions(
        devices
          ?.filter((device) => device?.UserID === null)
          ?.map((device) => ({
            key: device?.IMEI_Number,
            value: device?.IMEI_Number,
            text: device?.IMEI_Number,
          }))
      );
  }, [devices]);

  return devices;
};
export default useDevices;
