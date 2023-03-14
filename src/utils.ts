import { offlineActions, sockeDeviceActions } from "./store/store";
import {
  fileUploadValidatorType,
  manageMqttEventsParametersType,
  manageSocketDevicesParametersType,
} from "./types/types";
import * as XLSX from "xlsx";

export class SelectClass {
  constructor(public key: string, public value: string, public text: string) {}
}

export const clearSimilarArrayObjects = <T extends object>(
  arr: T[],
  key: string
) => {
  const currentData: Record<string, T> = {};
  arr.forEach((eachData: Record<any, any>) => {
    currentData[eachData[key]] = eachData;
  });

  const currentDataArray = Object.entries(currentData)?.map(
    ([key, value]) => value
  );

  return currentDataArray;
};

export const manageSocketDevicesConnection = ({
  ws,
  dispatch,
}: manageSocketDevicesParametersType) => {
  ws.onopen = (e: any) => {
    console.log("Websocket open", e);
  };

  ws.onmessage = (e: any) => {
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

  ws.onclose = (e: any) => {
    console.log("Websocket closed", e);
    dispatch(sockeDeviceActions.deleteAll());
  };

  ws.onerror = (e: any) => {
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

export const manageMqttEvents = ({
  client,
  dispatch,
}: manageMqttEventsParametersType) => {
  client?.subscribe("nigtrak/devices", { qos: 1 });

  client?.on("connect", () => {
    console.log("connected to broker successfully");
    dispatch(offlineActions.toogleOffline(false));
  });

  client?.on("offline", () => {
    console.log("You are offline");
    dispatch(sockeDeviceActions.deleteAll());
    dispatch(offlineActions.toogleOffline(true));
  });

  client?.on("message", (topic: any, message: any) => {
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

export const getExention = (string: string) => {
  const arr = string?.split(".");
  if (Array.isArray(arr)) return arr[arr?.length - 1];

  return "";
};

const onFileReaderLoad = (e: any, resolve: any) => {
  const bufferArray = e.target.result;

  const wb = XLSX.read(bufferArray, { type: "buffer" });

  const wsname = wb.SheetNames[0];

  const ws = wb.Sheets[wsname];

  const data = XLSX.utils.sheet_to_json(ws);

  resolve(data);
};

const onFileReaderError = (error: any, reject: any) => {
  reject(error);
};

const readExcel = (file: File, onFileReaderSuccess: (a: any) => any) => {
  const promise = new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e) => onFileReaderLoad(e, resolve);

    fileReader.onerror = (error) => onFileReaderError(error, reject);
  });

  promise.then(onFileReaderSuccess);
};

const readJSON = (file: File, onReadJSONSuccess: Function) => {
  const fileReader = new FileReader();
  fileReader.readAsText(file, "UTF-8");
  fileReader.onload = (e: any) => {
    const data = JSON.parse(e.target.result);
    onReadJSONSuccess(data);
  };
};

export const fileUploadValidator = ({
  e,
  onFileChange,
  onFileBlur,
  onFileReaderSuccess,
  onReadJSONSuccess,
}: fileUploadValidatorType) => {
  const file = e.target.files[0];

  const ext = getExention(file?.name);

  if (ext === "xlsx") {
    readExcel(file, onFileReaderSuccess);
  } else if (ext === "json") {
    readJSON(file, onReadJSONSuccess);
  }
  onFileChange(file);
  onFileBlur();
};
