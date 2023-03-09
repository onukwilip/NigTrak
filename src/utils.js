import axios from "axios";
import { useDispatch } from "react-redux";
import {} from "redux";
import {
  deviceActions,
  offlineActions,
  sockeDeviceActions,
} from "./store/store";

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

export const mqttConfig = {
  protocol: "ws",
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: "",
  password: "",
  reconnectPeriod: 1000,
  keepalive: 10,
  will: {
    topic: "nigtrak/devices",
    payload: `Subscriber disconnected`,
    qos: 1,
  },
};

export const manageMqttEvents = ({ client, dispatch }) => {
  client?.subscribe("nigtrak/devices", { qos: 1 });

  client?.on("connect", (e) => {
    console.log("connected to broker successfully");
    dispatch(offlineActions.toogleOffline(false));
  });

  client?.on("offline", () => {
    console.log("You are offline");
    dispatch(sockeDeviceActions.deleteAll());
    dispatch(offlineActions.toogleOffline(true));
  });

  client?.on("message", (topic, message) => {
    {
      const parsedMessage = JSON.parse(message);
      const { data, type } = parsedMessage;
      if (type === "device") {
        dispatch(sockeDeviceActions.putDevice(data));
      } else if (type === "disconnect") {
        dispatch(sockeDeviceActions.deleteDevice(data));
      }

      console.log("TYPE", type);

      console.log("MQTT message", data);
    }
  });
};

export const mapCenter = { lat: 9.082, lng: 8.6753 };
