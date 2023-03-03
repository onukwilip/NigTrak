import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Map from "../components/Map";
import {
  Button,
  Divider,
  Form,
  Input,
  Message,
  Table,
  Checkbox,
  Icon,
  Select,
} from "semantic-ui-react";
import data from "../data.json";
import css from "../styles/devices/Devices.module.scss";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import walkieTalkieTrans from "../assets/img/walkie-talkie-trans.png";
import {
  clearSimilarArrayObjects,
  manageSocketDevicesConnection,
  mapCenter,
  SelectClass,
} from "../utils";
import { useForm, useInput } from "use-manage-form";
import { useNavigate, useParams } from "react-router-dom";
import Main from "./Main";
import { FileUpload } from "./FileUpload";
import * as XLSX from "xlsx";
import useAjaxHook from "use-ajax-request";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import CustomLoader from "./CustomLoader";

const ws = new WebSocket(process.env.REACT_APP_WS_DOMAIN);

export const DeviceCard = ({ device, onViewMore = () => {}, index }) => {
  const [ref, inView] = useInView();
  const control = useAnimation();
  const variants = {
    far: { opacity: 0, x: "100px" },
    current: { opacity: 1, x: "0px" },
  };

  useEffect(() => {
    if (inView) {
      control.start("current");
    } else {
      control.start("far");
    }
  }, [control, inView]);

  return (
    <motion.div
      variants={variants}
      initial="far"
      animate={control}
      transition={{
        delay: index / 50,
      }}
      className={css["device-card"]}
      ref={ref}
    >
      <div className={css["img-container"]}>
        <img src={walkieTalkieTrans} alt="" />
      </div>
      <div className={css.details}>
        <em>
          {device?.IMEI_Number > 10 ? (
            <>
              {device?.IMEI_Number?.substring(0, 5)}...
              {device?.IMEI_Number?.substring(device?._id?.length, 21)}
            </>
          ) : (
            device?.IMEI_Number
          )}
        </em>
        <em>{device?.Name || "Nil"}</em>
      </div>
      <div className={css.actions}>
        <Button
          onClick={() => {
            onViewMore(device);
          }}
        >
          View more
        </Button>
      </div>
    </motion.div>
  );
};

export const DevicesList = ({ devices, onViewMore, className }) => {
  return (
    <div className={`${css["devices-list"]} ${className}`}>
      {devices.map((device, i) => (
        <DeviceCard
          device={device}
          onViewMore={onViewMore}
          key={device._id}
          index={i}
        />
      ))}
    </div>
  );
};

export const AllDevices = () => {
  const [devices, setDevices] = useState([]);
  const [device, setDevice] = useState(devices[0]);
  const socketDevices = useSelector((state) => state?.socketDevices);
  const [socketDevice, setSocketDevice] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    sendRequest: getDevices,
    error: getDevicesError,
    loading: gettingDevices,
    data: allDevice,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/device/`,
      method: "GET",
    },
  });

  manageSocketDevicesConnection({ ws, dispatch });

  const onSearch = (/**@type String */ value) => {
    const filtered = allDevice.filter(
      (eachDevice) =>
        eachDevice?.IMEI_Number.toLowerCase().includes(value.toLowerCase()) ||
        eachDevice?.deviceHolderName
          ?.toLowerCase()
          .includes(value.toLowerCase()) ||
        eachDevice?.Serial_Number.toLowerCase().includes(value.toLowerCase()) ||
        eachDevice?.Device_Model.toLowerCase().includes(value.toLowerCase())
    );

    setDevices(filtered);
  };

  const editDevice = () => {
    navigate(`/home/devices/edit/${device?.IMEI_Number}`);
  };

  const onGetDevicesSuccess = ({ data }) => {
    setDevices(data);
  };

  console.log("SOCKET DEVICE", socketDevice);

  useEffect(() => {
    getDevices(onGetDevicesSuccess);
  }, []);

  useEffect(() => {
    setDevice(devices[0]);
  }, [devices]);

  useEffect(() => {
    if (device && socketDevices)
      setSocketDevice(socketDevices[device?.IMEI_Number]);
  }, [device, socketDevices]);

  return (
    <section className={css.devices}>
      <div
        className={`${css.left} ${!socketDevice ? css["left-no-map"] : null}`}
      >
        <div className={css["device-details"]}>
          <div className={css.details}>
            <ul>
              <li>
                <em>IMEI number</em>: <em>{device?.IMEI_Number || "Nil"}</em>
              </li>
              <li>
                <em>Registered</em>:{" "}
                <em>
                  {new Date(device?.DateRegistered)?.toUTCString() || "Nil"}
                </em>
              </li>{" "}
              <li>
                <em>Serial number</em>:{" "}
                <em>{device?.Serial_Number || "Nil"}</em>
              </li>{" "}
              <li>
                <em>Device model</em>: <em>{device?.Device_Model || "Nil"}</em>
              </li>{" "}
              <li>
                <em>Status</em>:{" "}
                <em>
                  <span className={socketDevice ? "online" : "offline"}>
                    {socketDevice ? "Online" : "Offline"}
                  </span>{" "}
                </em>
              </li>{" "}
              {/* <li>
                <em>Location</em>:{" "}
                <em>
                  {device["location"]["lat"]} {device["location"]["lng"]}
                </em>
              </li>{" "} */}
              {/* <li>
                <em>State</em>: <em>{device["state"]}</em>
              </li>
              <li>
                <em>Station</em>: <em>{device["station"]}</em>
              </li> */}
              <li>
                <em>Militant ID</em>: <em>{device?.UserId || "Nil"}</em>
              </li>
              <li>
                <em>Militant name</em>: <em>{device?.Name || "Nil"}</em>
              </li>
            </ul>
            <br />
            <div className="actions">
              <Button className="my-button" onClick={editDevice}>
                Edit
              </Button>
            </div>
          </div>
        </div>
        <div
          className={
            socketDevice ? css["map-container"] : css["message-container"]
          }
        >
          {socketDevice ? (
            <Map
              newCenter={{
                lat: socketDevice?.lat || mapCenter.lat,
                lng: socketDevice?.lng || mapCenter.lng,
              }}
              zoom={10}
            />
          ) : (
            <Message content="Device is offline" warning />
          )}
        </div>
      </div>
      <div className={css.right}>
        <div className={css["search-container"]}>
          <Input
            className={css.input}
            label="Search"
            placeholder="Search devices"
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </div>
        {gettingDevices ? (
          <CustomLoader />
        ) : getDevicesError ? (
          <>
            <Message
              icon="page4"
              content="There was an error getting devices, please retry"
              warning
            />
          </>
        ) : devices?.length > 0 ? (
          <DevicesList
            devices={devices}
            onViewMore={setDevice}
            className={css.users}
          />
        ) : (
          <>
            <Message icon="page4" content="No devices are available" warning />
          </>
        )}
      </div>
    </section>
  );
};

const AddDeviceSection = ({ id }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const {
    value: IMEI,
    isValid: IMEIIsValid,
    inputIsInValid: IMEIInputIsInValid,
    onChange: onIMEIChange,
    onBlur: onIMEIBlur,
    reset: resetIMEI,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: serialNumber,
    isValid: serialNumberIsValid,
    inputIsInValid: serialNumberInputIsInValid,
    onChange: onSerialNumberChange,
    onBlur: onSerialNumberBlur,
    reset: resetSerialNumber,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: deviceModel,
    isValid: deviceModelIsValid,
    inputIsInValid: deviceModelInputIsInValid,
    onChange: onDeviceModelChange,
    onBlur: onDeviceModelBlur,
    reset: resetDeviceModel,
  } = useInput((value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onIMEIBlur, onSerialNumberBlur, onDeviceModelBlur],
    resetHandlers: [resetIMEI, resetSerialNumber, resetDeviceModel],
    validateOptions: () =>
      IMEIIsValid && serialNumberIsValid && deviceModelIsValid,
  });

  const {
    sendRequest: postDevice,
    error: postDeviceError,
    loading: postingDevice,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: id
        ? `${process.env.REACT_APP_API_DOMAIN}/api/device/${id}`
        : `${process.env.REACT_APP_API_DOMAIN}/api/device`,
      method: id ? "PUT" : "POST",
      data: {
        imei: IMEI,
        serialNumber: serialNumber,
        deviceModel: deviceModel,
      },
    },
  });

  const {
    sendRequest: getDevice,
    error: getDeviceError,
    loading: gettingDevice,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/device/${id}`,
      method: "GET",
    },
  });

  const models = [
    new SelectClass(0, "Samsung", "Samsung"),
    new SelectClass(0, "Huwawei", "Huwawei"),
    new SelectClass(0, "Infinix", "Infinix"),
  ];

  const onPostDeviceSuccess = ({ data }) => {
    setShowSuccessMessage(true);
    if (!id) reset();
    setTimeout(() => setShowSuccessMessage(false), [1000 * 10]);
  };

  const submitHandler = () => {
    if (!formIsValid) return executeBlurHandlers();

    console.log("NEW DEVICE", { imei: IMEI, serialNumber, deviceModel });
    postDevice(onPostDeviceSuccess);
  };

  const onGetDeviceSuccess = ({ data }) => {
    onIMEIChange(data?.IMEI_Number);
    onSerialNumberChange(data?.Serial_Number);
    onDeviceModelChange(data?.Device_Model);
  };
  useEffect(() => {
    if (id) getDevice(onGetDeviceSuccess);
  }, [id]);

  return (
    <>
      <div className={css["section-main"]}>
        <div className={css.head}>
          <h3>{id ? "Edit" : "Add"} device</h3>
        </div>
        <hr className={css.divider} />
        <div className={css["body"]}>
          {showSuccessMessage && (
            <>
              <Message content="Device posted successfully" success />
              <br />
            </>
          )}
          {postDeviceError && (
            <>
              <Message
                content={
                  postDeviceError?.response?.status === 400
                    ? `User with IMEI number ${IMEI} already exists`
                    : "There was an error posting the device please try again"
                }
                error
              />
              <br />
            </>
          )}
          <Form onSubmit={submitHandler}>
            <Form.Group widths="equal">
              <Form.Input
                icon="pencil"
                iconPosition="left"
                placeholder="IMEI number..."
                label="IMEI number"
                disabled={id ? true : false}
                value={IMEI}
                onChange={(e) => onIMEIChange(e.target.value)}
                onBlur={onIMEIBlur}
                error={
                  IMEIInputIsInValid && {
                    content: "Input must NOT be empty",
                    pointing: "above",
                  }
                }
              />
              <Form.Input
                icon="pencil"
                iconPosition="left"
                placeholder="Serial number..."
                label="Serial number"
                value={serialNumber}
                onChange={(e) => onSerialNumberChange(e.target.value)}
                onBlur={onSerialNumberBlur}
                error={
                  serialNumberInputIsInValid && {
                    content: "Input must NOT be empty",
                    pointing: "above",
                  }
                }
              />
              <Form.Select
                placeholder="Device model..."
                label="Device model"
                options={models}
                value={deviceModel}
                onChange={(e, { value }) => onDeviceModelChange(value)}
                onBlur={onDeviceModelBlur}
                error={
                  deviceModelInputIsInValid && {
                    content: "Input must NOT be empty",
                    pointing: "above",
                  }
                }
              />
            </Form.Group>
            <div className="actions">
              <Button className="send" disabled={!formIsValid || postingDevice}>
                {postingDevice
                  ? "Loading..."
                  : id
                  ? "Update device"
                  : "Add device"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

const AddDeviceModelSection = () => {
  const [models, setModels] = useState(data["device-models"]);
  const [editingModel, setEditingModel] = useState(false);
  const {
    value: deviceModel,
    isValid: deviceModelIsValid,
    inputIsInValid: deviceModelInputIsInValid,
    onChange: onDeviceModelChange,
    onBlur: onDeviceModelBlur,
    reset: resetDeviceModel,
  } = useInput((value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onDeviceModelBlur],
    resetHandlers: [resetDeviceModel],
    validateOptions: () => deviceModelIsValid,
  });

  const editModel = (model) => {
    setEditingModel(model);
    onDeviceModelChange(model?.name);
  };

  const updateModel = () => {
    if (!formIsValid) return executeBlurHandlers();

    const indexToUpdate = models.findIndex(
      (model) => model._id === editingModel._id
    );
    const oldModels = [...models];
    oldModels[indexToUpdate] = {
      ...oldModels[indexToUpdate],
      name: deviceModel,
    };

    setModels(oldModels);

    setEditingModel(null);
    reset();
  };

  const addModel = () => {
    if (!formIsValid) return executeBlurHandlers();

    const newModel = { id: models.length + 1, name: deviceModel };
    setModels((prev) => [...prev, newModel]);

    setEditingModel(null);
    reset();
  };

  const deleteModel = (model) => {
    setModels((prevModels) =>
      prevModels?.filter((eachModel) => eachModel?._id !== model?._id)
    );
  };

  return (
    <>
      <div className={`${css["section-main"]} ${css["add-model"]}`}>
        <div className={css.head}>
          <h3>Add device model</h3>
        </div>
        <hr className={css.divider} />
        <div className={css["body"]}>
          <div className={css["existing"]}>
            <h4>Existing models</h4>
            <Table striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Model name</Table.HeaderCell>
                  <Table.HeaderCell colspan="2">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {models.length < 1 ? (
                  <Table.Row>
                    <Table.Cell colspan="2">
                      <Message
                        content="No models available"
                        warning
                        className="my-message"
                      />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {models.map((model, i) => (
                      <>
                        <Table.Row key={i}>
                          <Table.Cell>{model.name}</Table.Cell>
                          <Table.Cell collapsing>
                            <Button
                              color="blue"
                              onClick={() => editModel(model)}
                            >
                              Edit model
                            </Button>
                          </Table.Cell>
                          <Table.Cell collapsing>
                            <Button
                              color="red"
                              onClick={() => {
                                deleteModel(model);
                              }}
                            >
                              Delete model
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      </>
                    ))}
                  </>
                )}
              </Table.Body>
            </Table>
          </div>
          <br />
          {!editingModel ? (
            // ADD MODEL
            <Form onSubmit={addModel}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="pencil"
                  iconPosition="left"
                  placeholder="Device model..."
                  label="Device model"
                  value={deviceModel}
                  onChange={(e) => onDeviceModelChange(e.target.value)}
                  onBlur={onDeviceModelBlur}
                  error={
                    deviceModelInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <div className="actions">
                <Button className="send" disabled={!formIsValid}>
                  Add model
                </Button>
              </div>
            </Form>
          ) : (
            // EDIT MODEL
            <Form onSubmit={updateModel}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="pencil"
                  iconPosition="left"
                  placeholder="Device model..."
                  label="Device model"
                  value={deviceModel}
                  onChange={(e) => onDeviceModelChange(e.target.value)}
                  onBlur={onDeviceModelBlur}
                  error={
                    deviceModelInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <div className="actions">
                <Button className="send" disabled={!formIsValid}>
                  Update model
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </>
  );
};

const AddAccessoriesSection = () => {
  const [accessories, setAccessories] = useState(data["accessories"]);
  const [editingAccessory, setEditingAccessory] = useState(false);
  const {
    value: accessory,
    isValid: accessoryIsValid,
    inputIsInValid: accessoryInputIsInValid,
    onChange: onAccessoryChange,
    onBlur: onAccessoryBlur,
    reset: resetAccessory,
  } = useInput((value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onAccessoryBlur],
    resetHandlers: [resetAccessory],
    validateOptions: () => accessoryIsValid,
  });

  const editAccessory = (accessory) => {
    setEditingAccessory(accessory);
    onAccessoryChange(accessory?.name);
  };

  const updateAccessory = () => {
    if (!formIsValid) return executeBlurHandlers();

    const indexToUpdate = accessories.findIndex(
      (accessory) => accessory._id === editingAccessory._id
    );
    const oldAccessories = [...accessories];
    oldAccessories[indexToUpdate] = {
      ...oldAccessories[indexToUpdate],
      name: accessory,
    };

    setAccessories(oldAccessories);

    setEditingAccessory(null);
    reset();
  };

  const addAccessory = () => {
    if (!formIsValid) return executeBlurHandlers();

    const newAccessory = { id: accessories.length + 1, name: accessory };
    setAccessories((prev) => [...prev, newAccessory]);

    setEditingAccessory(null);
    reset();
  };

  const deleteAccessory = (accessory) => {
    setAccessories((prevAccessories) =>
      prevAccessories?.filter(
        (eachAccessory) => eachAccessory?._id !== accessory?._id
      )
    );
  };

  return (
    <>
      <div className={`${css["section-main"]} ${css["add-accessory"]}`}>
        <div className={css.head}>
          <h3>Add Accessory</h3>
        </div>
        <hr className={css.divider} />
        <div className={css["body"]}>
          <div className={css["existing"]}>
            <h4>Existing accessories</h4>
            <Table striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Accessory name</Table.HeaderCell>
                  <Table.HeaderCell colspan="2">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {accessories.length < 1 ? (
                  <Table.Row>
                    <Table.Cell colspan="2">
                      <Message
                        content="No accessories available"
                        warning
                        className="my-message"
                      />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {accessories.map((accessory, i) => (
                      <>
                        <Table.Row key={i}>
                          <Table.Cell>{accessory.name}</Table.Cell>
                          <Table.Cell collapsing>
                            <Button
                              color="blue"
                              onClick={() => editAccessory(accessory)}
                            >
                              Edit accessory
                            </Button>
                          </Table.Cell>
                          <Table.Cell collapsing>
                            <Button
                              color="red"
                              onClick={() => {
                                deleteAccessory(accessory);
                              }}
                            >
                              Delete accessory
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      </>
                    ))}
                  </>
                )}
              </Table.Body>
            </Table>
          </div>
          <br />
          {!editingAccessory ? (
            // ADD ACCESSORY
            <Form onSubmit={addAccessory}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="pencil"
                  iconPosition="left"
                  placeholder="Accessory..."
                  label="Accessory"
                  value={accessory}
                  onChange={(e) => onAccessoryChange(e.target.value)}
                  onBlur={onAccessoryBlur}
                  error={
                    accessoryInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <div className="actions">
                <Button className="send" disabled={!formIsValid}>
                  Add accessory
                </Button>
              </div>
            </Form>
          ) : (
            // EDIT ACCESSORY
            <Form onSubmit={updateAccessory}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="pencil"
                  iconPosition="left"
                  placeholder="Accessory..."
                  label="Accessory"
                  value={accessory}
                  onChange={(e) => onAccessoryChange(e.target.value)}
                  onBlur={onAccessoryBlur}
                  error={
                    accessoryInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <div className="actions">
                <Button className="send" disabled={!formIsValid}>
                  Update accessory
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </>
  );
};

const AddAmmunitionSection = () => {
  const [ammunition, setAmmunition] = useState(data["ammunition"]);
  const [editingAmmunition, setEditingAmmunition] = useState(false);
  const {
    value: ammunitionValue,
    isValid: ammunitionIsValid,
    inputIsInValid: ammunitionInputIsInValid,
    onChange: onAmmunitionChange,
    onBlur: onAmmunitionBlur,
    reset: resetAmmunition,
  } = useInput((value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onAmmunitionBlur],
    resetHandlers: [resetAmmunition],
    validateOptions: () => ammunitionIsValid,
  });

  const editAmmunition = (ammunition) => {
    setEditingAmmunition(ammunition);
    onAmmunitionChange(ammunition?.name);
  };

  const updateAmmunition = () => {
    if (!formIsValid) return executeBlurHandlers();

    const indexToUpdate = ammunition.findIndex(
      (accessory) => accessory._id === editingAmmunition._id
    );
    const oldAmmunition = [...ammunition];
    oldAmmunition[indexToUpdate] = {
      ...oldAmmunition[indexToUpdate],
      name: ammunitionValue,
    };

    setAmmunition(oldAmmunition);

    setEditingAmmunition(null);
    reset();
  };

  const addAmmunition = () => {
    if (!formIsValid) return executeBlurHandlers();

    const newAmmunition = { id: ammunition.length + 1, name: ammunitionValue };
    setAmmunition((prev) => [...prev, newAmmunition]);

    setEditingAmmunition(null);
    reset();
  };

  const deleteAmmunition = (ammunition) => {
    setAmmunition((prevAmmunition) =>
      prevAmmunition?.filter(
        (eachAmmunition) => eachAmmunition?._id !== ammunition?._id
      )
    );
  };

  return (
    <>
      <div className={`${css["section-main"]} ${css["add-accessory"]}`}>
        <div className={css.head}>
          <h3>Add Ammunition</h3>
        </div>
        <hr className={css.divider} />
        <div className={css["body"]}>
          <div className={css["existing"]}>
            <h4>Existing ammunition</h4>
            <Table striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Ammunition name</Table.HeaderCell>
                  <Table.HeaderCell colspan="2">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ammunition.length < 1 ? (
                  <Table.Row>
                    <Table.Cell colspan="2">
                      <Message
                        content="No ammunition available"
                        warning
                        className="my-message"
                      />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {ammunition.map((ammunition, i) => (
                      <>
                        <Table.Row key={i}>
                          <Table.Cell>{ammunition.name}</Table.Cell>
                          <Table.Cell collapsing>
                            <Button
                              color="blue"
                              onClick={() => editAmmunition(ammunition)}
                            >
                              Edit ammunition
                            </Button>
                          </Table.Cell>
                          <Table.Cell collapsing>
                            <Button
                              color="red"
                              onClick={() => {
                                deleteAmmunition(ammunition);
                              }}
                            >
                              Delete ammunition
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      </>
                    ))}
                  </>
                )}
              </Table.Body>
            </Table>
          </div>
          <br />
          {!editingAmmunition ? (
            // ADD AMMUNITION
            <Form onSubmit={addAmmunition}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="pencil"
                  iconPosition="left"
                  placeholder="Ammunition..."
                  label="Ammunition"
                  value={ammunitionValue}
                  onChange={(e) => onAmmunitionChange(e.target.value)}
                  onBlur={onAmmunitionBlur}
                  error={
                    ammunitionInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <div className="actions">
                <Button className="send" disabled={!formIsValid}>
                  Add ammunition
                </Button>
              </div>
            </Form>
          ) : (
            // EDIT AMMUNITION
            <Form onSubmit={updateAmmunition}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="pencil"
                  iconPosition="left"
                  placeholder="Ammunition..."
                  label="Ammunition"
                  value={ammunitionValue}
                  onChange={(e) => onAmmunitionChange(e.target.value)}
                  onBlur={onAmmunitionBlur}
                  error={
                    ammunitionInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <div className="actions">
                <Button className="send" disabled={!formIsValid}>
                  Update ammunition
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </>
  );
};

export const CreateDevice = () => {
  const param = useParams();
  const id = param?.id;
  console.log("ID", id);
  return (
    <section className={css["create-device"]}>
      <AddDeviceSection id={id} />
      <AddDeviceModelSection />
      <AddAccessoriesSection />
      <AddAmmunitionSection />
    </section>
  );
};

const EachTableRow = ({
  data: deviceData,
  onCheckedHandler,
  onEdit,
  onDelete,
  approvedState,
  refreshCheckedState,
}) => {
  const [checked, setChecked] = useState(approvedState);
  const [editingRow, setEditingRow] = useState(false);

  const {
    value: IMEI,
    isValid: IMEIIsValid,
    inputIsInValid: IMEIInputIsInValid,
    onChange: onIMEIChange,
    onBlur: onIMEIBlur,
    reset: resetIMEI,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: serialNumber,
    isValid: serialNumberIsValid,
    inputIsInValid: serialNumberInputIsInValid,
    onChange: onSerialNumberChange,
    onBlur: onSerialNumberBlur,
    reset: resetSerialNumber,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: deviceModel,
    isValid: deviceModelIsValid,
    inputIsInValid: deviceModelInputIsInValid,
    onChange: onDeviceModelChange,
    onBlur: onDeviceModelBlur,
    reset: resetDeviceModel,
  } = useInput((value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid } = useForm({
    blurHandlers: [onIMEIBlur, onSerialNumberBlur, onDeviceModelBlur],
    validateOptions: () =>
      IMEIIsValid && serialNumberIsValid && deviceModelIsValid,
  });

  const update = () => {
    if (!formIsValid) return executeBlurHandlers();

    const data = {
      ["IMEI number"]: IMEI,
      ["Serial number"]: serialNumber,
      ["Device model"]: deviceModel,
    };
    onEdit(data);
    setEditingRow(false);
  };

  const deviceModelOptions = data["device-models"].map(
    (eachModel) =>
      new SelectClass(eachModel?._id, eachModel?.name, eachModel?.name)
  );

  useEffect(() => {
    setChecked(approvedState);
  }, [approvedState, refreshCheckedState]);

  useEffect(() => {
    onIMEIChange(deviceData["IMEI number"]);
    onSerialNumberChange(deviceData["Serial number"]);
    onDeviceModelChange(deviceData["Device model"]);
  }, [editingRow]);

  if (editingRow) {
    return (
      <Table.Row>
        <Table.Cell collapsing></Table.Cell>
        <Table.Cell>
          <Input
            placeholder="Input IMEI number"
            value={IMEI}
            onChange={(e) => onIMEIChange(e.target.value)}
            onBlur={onIMEIBlur}
            error={IMEIInputIsInValid}
          />
        </Table.Cell>
        <Table.Cell>
          <Input
            placeholder="Input serial number"
            value={serialNumber}
            onChange={(e) => onSerialNumberChange(e.target.value)}
            onBlur={onSerialNumberBlur}
            error={serialNumberInputIsInValid}
          />
        </Table.Cell>
        <Table.Cell>
          <Select
            placeholder="Select device model"
            value={deviceModel}
            onChange={(e, { value }) => onDeviceModelChange(value)}
            onBlur={onDeviceModelBlur}
            error={deviceModelInputIsInValid}
            options={deviceModelOptions}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <Button color="green" onClick={update}>
            Update
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }
  return (
    <Table.Row>
      <Table.Cell collapsing>
        {/* <div
          class="ui fitted slider checkbox"
          onClick={() => {
            setChecked((prev) => !prev);
          }}
        >
          <input
            type="checkbox"
            class="hidden"
            readOnly=""
            tabIndex="0"
            onChange={(e) => {
              onCheckedHandler(data, e?.target?.checked);
            }}
            id="device-checkbox"
            checked={checked}
          />
          <label></label>
        </div> */}
        <Checkbox
          slider
          checked={checked}
          onChange={(e, { checked }) => {
            onCheckedHandler(deviceData, checked);
            setChecked((prev) => !prev);
          }}
        />
      </Table.Cell>
      <Table.Cell>{deviceData["IMEI number"]}</Table.Cell>
      <Table.Cell>{deviceData["Serial number"]}</Table.Cell>
      <Table.Cell>{deviceData["Device model"]}</Table.Cell>
      <Table.Cell collapsing>
        <Button
          color="blue"
          onClick={() => {
            setEditingRow(true);
          }}
        >
          Edit
        </Button>
        <Button color="red" onClick={() => onDelete(deviceData)}>
          Delete
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};

export const UploadBulkDevices = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState({});
  const [approvedState, setApprovedState] = useState(false);
  const [refreshCheckedState, setRefreshCheckedState] = useState(false);
  const [noUploadedDevices, setNoUploadedDevices] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);
  const [uploadedSuccessfuly, setUploadedSuccessfuly] = useState(false);
  const {
    sendRequest: postDevices,
    error: postDevicesError,
    loading: postingDevices,
    data: postDevicesData,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/device/bulk`,
      method: "POST",
      data: Object.entries(selectedDevices)?.map(([key, eachDevice]) => ({
        imei: eachDevice["IMEI number"],
        serialNumber: eachDevice["Serial number"],
        deviceModel: eachDevice["Device model"],
      })),
    },
  });

  const getExention = (/**@type String */ string) => {
    const arr = string?.split(".");
    if (Array.isArray(arr)) return arr[arr?.length - 1];

    return "";
  };

  const {
    value: file,
    isValid: fileIsValid,
    inputIsInValid: fileInputIsInValid,
    onChange: onFileChange,
    onBlur: onFileBlur,
    reset: resetFIle,
  } = useInput(
    (/**@type File */ file) =>
      getExention(file?.name) === "xlsx" || getExention(file?.name) === "json"
  );

  const onFileReaderLoad = (e, resolve) => {
    const bufferArray = e.target.result;

    const wb = XLSX.read(bufferArray, { type: "buffer" });

    const wsname = wb.SheetNames[0];

    const ws = wb.Sheets[wsname];

    const data = XLSX.utils.sheet_to_json(ws);

    resolve(data);
  };

  const onFileReaderError = (error, reject) => {
    reject(error);
  };

  const onFileReaderSuccess = (data) => {
    setUploadedData(clearSimilarArrayObjects(data, "IMEI number"));
  };

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => onFileReaderLoad(e, resolve);

      fileReader.onerror = (error) => onFileReaderError(error, reject);
    });

    promise.then(onFileReaderSuccess);
  };

  const readJSON = (file) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setUploadedData(clearSimilarArrayObjects(data, "IMEI number"));
    };
  };

  const fileUploadValidator = (/**@type Event */ e) => {
    const file = e.target.files[0];

    const ext = getExention(file?.name);

    if (ext === "xlsx") {
      readExcel(file);
    } else if (ext === "json") {
      readJSON(file);
    }
    onFileChange(file);
    onFileBlur();
  };

  const onCheckedHandler = (data, checked) => {
    if (checked === true) {
      setSelectedDevices((preDevices) => ({
        ...preDevices,
        [data["IMEI number"]]: data,
      }));
    } else {
      const oldDevices = { ...selectedDevices };
      delete oldDevices[data["IMEI number"]];
      setSelectedDevices(oldDevices);
    }
  };

  const onNoUploadedDevices = () => {
    setNoUploadedDevices(true);

    setTimeout(() => setNoUploadedDevices(false), 1000 * 10);
  };

  const onSuccessUpload = () => {
    setUploadedSuccessfuly(true);

    setTimeout(() => {
      setUploadedSuccessfuly(false);
    }, 1000 * 10);
  };

  const onUploadSuccess = ({ data }) => {
    const { uploadedDevices, errorLogs } = data;
    console.info(data);
    const currentDevices = {};
    uploadedData.forEach((eachDevice) => {
      currentDevices[eachDevice["IMEI number"]] = eachDevice;
    });

    for (const key in uploadedDevices) {
      delete currentDevices[key];
    }

    const currentDevicesArray = Object.entries(currentDevices)?.map(
      ([key, value]) => value
    );

    setUploadedData(currentDevicesArray);
    setErrorLogs(errorLogs);
    setSelectedDevices({});
    disApproveAll();
    if (Object?.keys(uploadedDevices)?.length > 0) {
      onSuccessUpload();
    } else {
      onNoUploadedDevices();
    }
  };

  const onErrorUpload = () => setUploadedSuccessfuly(false);

  const uploadDevices = () => {
    const selectedArray = Object.entries(selectedDevices)?.map(
      ([key, value]) => value
    );

    if (selectedArray?.length < 1) {
      return;
    }

    postDevices(onUploadSuccess, onErrorUpload);
  };

  const selectAllDevices = () => {
    const addedDevices = {};

    for (const data of uploadedData) {
      addedDevices[data["IMEI number"]] = data;
    }

    setSelectedDevices(addedDevices);
  };

  const approveAll = () => {
    selectAllDevices();
    setApprovedState(true);
  };

  const disApproveAll = () => {
    setSelectedDevices({});
    setApprovedState(false);
    setRefreshCheckedState((prev) => !prev);
  };

  const onEdit = (device) => {
    const allDevice = [...uploadedData];

    allDevice.forEach((eachDevice, i, arr) => {
      if (eachDevice["IMEI number"] === device["IMEI number"]) {
        arr[i] = device;
      }
    });

    setUploadedData(allDevice);
  };

  const clearErrors = () => setErrorLogs([]);

  const onDelete = (device) => {
    setUploadedData((prevData) =>
      prevData?.filter(
        (eachDevice) => eachDevice["IMEI number"] !== device["IMEI number"]
      )
    );
  };

  return (
    <section className={css["bulk-upload"]}>
      <Main header="Upload devices">
        <div className={css["upload-container"]}>
          <FileUpload
            label={"Upload excel/json files only"}
            onChange={fileUploadValidator}
            className={css.upload}
          />
          {file && <h4>FIle name: {file?.name}</h4>}
          {fileInputIsInValid && (
            <Message
              error
              content="File must be either a .xlsx file or .json file"
            />
          )}
        </div>
        <br />
        <div className={css.table}>
          {uploadedData?.length > 0 && (
            <Table compact celled definition>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell>IMEI number</Table.HeaderCell>
                  <Table.HeaderCell>Serial number</Table.HeaderCell>
                  <Table.HeaderCell>Device model</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {uploadedData?.map((data, i) => (
                  <EachTableRow
                    data={data}
                    onCheckedHandler={onCheckedHandler}
                    key={data["IMEI number"]}
                    approvedState={approvedState}
                    refreshCheckedState={refreshCheckedState}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </Table.Body>

              <Table.Footer fullWidth>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell colSpan="4">
                    <Button
                      floated="right"
                      icon
                      labelPosition="left"
                      color="green"
                      size="small"
                      onClick={uploadDevices}
                      disabled={
                        Object.keys(selectedDevices)?.length < 1
                          ? true
                          : false || postingDevices
                      }
                    >
                      <Icon name="cloud upload" /> Upload devices
                    </Button>
                    <Button size="small" primary onClick={approveAll}>
                      Approve All
                    </Button>
                    <Button size="small" color="red" onClick={disApproveAll}>
                      Disapprove All
                    </Button>
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </Table>
          )}
        </div>
        <AnimatePresence>
          {uploadedSuccessfuly.success && (
            <>
              <br />
              <motion.div
                initial={{
                  y: -100,
                  opacity: 0,
                }}
                animate={{
                  y: -0,
                  opacity: 1,
                }}
                exit={{
                  y: -100,
                  opacity: 0,
                }}
              >
                <Message success content="Devices uploaded successfully" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {postDevicesError && (
            <>
              <br />
              <motion.div
                initial={{
                  y: -100,
                  opacity: 0,
                }}
                animate={{
                  y: -0,
                  opacity: 1,
                }}
                exit={{
                  y: -100,
                  opacity: 0,
                }}
              >
                <Message
                  error
                  content="There was an error uploading your devices, please try again"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {noUploadedDevices && (
            <>
              <br />
              <motion.div
                initial={{
                  y: -100,
                  opacity: 0,
                }}
                animate={{
                  y: -0,
                  opacity: 1,
                }}
                exit={{
                  y: -100,
                  opacity: 0,
                }}
              >
                <Message warning content="No devices were uploaded" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <br />
        <Table compact celled className={css["error-table"]}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan={2}>Error logs</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell collapsing>Device IMEI number</Table.HeaderCell>
              <Table.HeaderCell>Error message</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {errorLogs?.map((error) => (
              <>
                <Table.Row key={error?.imei}>
                  <Table.Cell>{error?.imei}</Table.Cell>
                  <Table.Cell>{error?.error}</Table.Cell>
                </Table.Row>
              </>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell
                className={`${css["actions"]}`}
                colSpan={2}
                textAlign="right"
              >
                <Button negative onClick={clearErrors}>
                  Clear all
                </Button>
              </Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Main>
    </section>
  );
};
