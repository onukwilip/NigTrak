import axios from "axios";
import { useDispatch } from "react-redux";
import {} from "redux";
import { deviceActions, sockeDeviceActions } from "./store/store";

export class SelectClass {
  constructor(key, value, text) {
    this.key = key;
    this.value = value;
    this.text = text;
  }
}

export const clearSimilarArrayObjects = (
  /**@type Array */ arr,
  /**@type String */ key
) => {
  const currentData = {};
  arr.forEach((eachData) => {
    currentData[eachData[key]] = eachData;
  });

  const currentDataArray = Object.entries(currentData)?.map(
    ([key, value]) => value
  );

  return currentDataArray;
};

export const manageSocketDevicesConnection = ({ ws, dispatch }) => {
  ws.onopen = (e) => {
    console.log("Websocket open", e);
  };

  ws.onmessage = (e) => {
    const message = JSON.parse(e?.data);
    const { data, type } = message;
    if (type === "device") {
      dispatch(sockeDeviceActions.putDevice(data));
    } else if (type === "disconnect") {
      dispatch(sockeDeviceActions.deleteDevice(data));
    }

    console.log("TYPE", type);

    console.log("Websocket message", message);
  };

  ws.onclose = (e) => {
    console.log("Websocket closed", e);
    dispatch(sockeDeviceActions.deleteAll());
  };

  ws.onerror = (e) => {
    console.log("ERROR", e);
  };
};

export const mapCenter = { lat: 9.082, lng: 8.6753 };
