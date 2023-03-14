import { deviceOptionsType } from "./../types/types";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeviceAction } from "../store/devicesReducer";
import { selectorState } from "src/types/types";
import { AnyAction } from "redux";

const useDevices = (options: deviceOptionsType) => {
  const devices = useSelector((state: selectorState) => state.devices.devices);
  const [fetchingDevices, setFetchingDevices] = useState(false);
  const dispatch = useDispatch();

  const handleFetchDevices = () => {
    if (!devices && !fetchingDevices) {
      dispatch(getDeviceAction() as unknown as AnyAction);
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
