import {
  CoreChartOptions,
  DatasetChartOptions,
  DoughnutControllerChartOptions,
  ElementChartOptions,
  LineControllerChartOptions,
  PluginChartOptions,
  ScaleChartOptions,
} from "chart.js";
import { _DeepPartialObject } from "chart.js/dist/types/utils";

export type socketDeviceType = {
  imei: string;
  lat: number;
  lng: number;
};

export type socketDevicesType = Record<
  string,
  {
    imei: string;
    lat: number;
    lng: number;
  }
>;

export type socketDeviceState = {
  imei: string;
};

export type ranksState = {
  ranks: object | null;
};

export type deviceType = {
  Id: number;
  IMEI_Number: string;
  Serial_Number: string;
  Device_Model: string;
  UserID: string | null;
  Name: string | null;
  Email: string | null;
  Address: string | null;
  Phone: string | null;
  Station: string | null;
  Rank: string | null;
  Accessories: string | null;
  Ammunition: string | null;
  Image: string | null;
  RankName: string | null;
  RankId: string | null;
  RankImage: string | null;
};

export type rankType = {
  RankId: string;
  RankName: string;
  Image: string;
  Members: rankMemberType[];
};

export type rankMemberType = {
  UserId: string;
  Name: string;
  Email: string;
  Address: string;
  Phone: string;
  Image: string;
  Devices: string[];
};

export type selectorState = {
  socketDevices: socketDevicesType;
  devices: {
    devices: deviceType[];
  };
  ranks: {
    ranks: rankType[];
  };
  offline: {
    isOffline: boolean;
  };
};

export type forceType = "Army" | "Air force" | "Navy" | "Police";

export type positionType = {
  coords: {
    accuracy: number | null;
    altitude: string | number | null;
    altitudeAccuracy: string | number | null;
    heading: string | number | null;
    latitude: number | null;
    longitude: number | null;
    speed: any;
  };
};

export type latLngType = {
  lat: number;
  lng: number;
};

export type deviceOptionsType = {
  devicesOptions: selectType[];
  setDevicesOptions: (a: selectType[]) => {};
};

export type rankOptionsType = {
  rankOptions: selectType[];
  setRankOptions: (a: selectType[]) => {};
};

export type selectType = {
  key: string | number;
  value: string;
  text: string;
};

export type analyticsCardType = {
  icon: string;
  className?: string;
  header: string;
  value: number | string;
  delay: number;
};

export type chartJsLineOptionsType = _DeepPartialObject<
  CoreChartOptions<"line"> &
    ElementChartOptions<"line"> &
    PluginChartOptions<"line"> &
    DatasetChartOptions<"line"> &
    ScaleChartOptions<"line"> &
    LineControllerChartOptions
>;

export type chartJsDoughnutOptionsType = _DeepPartialObject<
  CoreChartOptions<"doughnut"> &
    ElementChartOptions<"doughnut"> &
    PluginChartOptions<"doughnut"> &
    DatasetChartOptions<"doughnut"> &
    ScaleChartOptions<"doughnut"> &
    DoughnutControllerChartOptions
>;

export type manageSocketDevicesParametersType = {
  ws: any;
  dispatch: any;
};

export type manageMqttEventsParametersType = {
  client: any;
  dispatch: any;
};

export type deviceCardPropsType = {
  device: deviceType;
  onViewMore: (a: any) => void;
  index: number;
};

export type deviceListPropsType = {
  devices: deviceType[];
  onViewMore: (a: any) => void;
  className: string;
};

export type mapPropsType = {
  newCenter: latLngType;
  zoom: number;
  children?: any;
  reference?: any;
  circles?: any[];
  showMarker?: boolean;
};

export type deviceModelType = {
  _id: string;
  name: string;
};

export type deviceAccessoryType = {
  _id: string;
  name: string;
};

export type deviceAmmoType = {
  _id: string;
  name: string;
};

export type eachTableRowPropsType<T> = {
  data: T;
  onCheckedHandler: Function;
  onEdit: Function;
  onDelete: Function;
  approvedState: boolean;
  refreshCheckedState: boolean;
};

export type fileUploadValidatorType = {
  e: any;
  onFileChange: (a: File) => any;
  onFileBlur: Function;
  onFileReaderSuccess: (a: any) => any;
  onReadJSONSuccess: (a: any) => any;
};

export type selectedDevicesType = Record<string, selectedDeviceType>;

export type selectedDeviceType = {
  ["IMEI number"]: string;
  ["Serial number"]: string;
  ["Device model"]: string;
};

export type uploadedDeviceFileType = selectedDeviceType[];

export type uploadedDevicesResponseDataType = {
  data: {
    uploadedDevices: Record<
      string,
      { imei: string; serialNumber: string; deviceModel: string }
    >;
    errorLogs: deviceErrorLogsType;
  };
};

export type deviceErrorLogsType = {
  imei: string;
  serialNumber: string;
  deviceModel: string;
  error: string;
}[];

export type mainPropsType = {
  children?: any;
  header?: string;
  className?: any;
};

export type fileUploadPropsType = {
  onChange: (a: any) => any;
  value?: File | string;
  label: string;
  className?: string | any;
};

export type imgUploadPropsType = {
  onChange: (a: any) => any;
  value?: string | any;
  label?: string;
  className?: string | any;
  triggerReset: boolean;
  initialImage?: string | null;
  removeInitialImage: Function;
};

export type profileContainerPropsType = {
  profilePic: string;
  name: string;
  phone: string;
  email: string;
  className?: string;
};

export type rankCardPropsType = {
  rank: rankType;
  onView: Function;
  socketDevices: socketDevicesType;
  index?: number;
};

export type onlineRankMembersType = {
  UserId: string;
  Name: string;
  Email: string;
  Address: string;
  Phone: string;
  Image: string;
  Devices: string[];
  IMEI_Number: string;
  location: {
    lat: number;
    lng: number;
  };
  rankImage?: string;
  Station?: string;
};

export type uploadedRankFileType = eachUploadedRankFileType[];

export type eachUploadedRankFileType = { id: string; name: string };

export type selectedRankType = Record<string, eachUploadedRankFileType>;

export type postBulkRanksReturnType = {
  uploadedRanks: Record<string, { name: string }>;
  errorLogs: postBulkRanksErrorType[];
};

export type postBulkRanksErrorType = { name: string; error: string };

export type stationCardPropsType = {
  station: any;
  onView: Function;
  index?: number;
};

export type uploadedStationsFileType = eachUploadedStationsFileType[];

export type eachUploadedStationsFileType = {
  Address: string;
  LGA: string;
  Name: string;
  State: string;
  id: number;
};

export type selectedStationsType = Record<string, eachUploadedStationsFileType>;

export type cardPropsType = { item: string; onCancel: Function; src?: string };

export type userCardPropsType = {
  user: userType;
  onViewMore: Function;
  index?: number;
};

export type userType = {
  Id: string | number;
  Name: string;
  UserId: string;
  Email: string;
  Address: string;
  Phone: string;
  Station: string;
  Rank: string;
  Accessories: string[];
  Ammunition: string[];
  Image: string;
  RankName: string;
  RankId: string;
  RankImage: string;
  Devices: userDeviceType[];
};

export type userDeviceType = {
  Id: string | number;
  IMEI_Number: string;
  Serial_Number: string;
  Device_Model: string;
  Accessories: string;
  Address: string;
  Ammunition: string;
  Email: string;
  Name: string;
  Phone: string;
  Rank: string;
  Station: string;
  UserId: string;
};

export type usersListType = {
  users: userType[];
  onViewMore: Function;
  className?: string;
};

export type selectInputOnChangePropsType<T> = (
  e: any,
  { value }: { value: T | string }
) => any;

export type uploadedUserFileType = eachUploadedUserFileType[];

export type selectedUsers = Record<string, eachUploadedUserFileType>;

export type eachUploadedUserFileType = {
  accessories: string;
  address: string;
  ammunition: string;
  devices: string;
  email: string;
  gender: string;
  id: string | number;
  joined: string | number;
  name: string | number;
  phoneNumber: string | number;
  rank: string;
  state: string;
  station: string;
};

export type postBulkUsersReturnType = {
  uploadUsers: {
    name: string;
    email: string;
    address: string;
    phone: string;
    rank: string;
    station: string;
    ammos: string[];
    accessories: string[];
    devices: string[];
  }[];
  errorLogs: postBulkUsersErrorType[];
};

export type postBulkUsersErrorType = { error: string; name: string };
