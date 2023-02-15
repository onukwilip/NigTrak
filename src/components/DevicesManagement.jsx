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
} from "semantic-ui-react";
import data from "../data.json";
import css from "../styles/devices/Devices.module.scss";
import { motion, useAnimation } from "framer-motion";
import walkieTalkieTrans from "../assets/img/walkie-talkie-trans.png";
import { SelectClass } from "../utils";
import { useForm, useInput } from "use-manage-form";
import { useNavigate, useParams } from "react-router-dom";

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
          {device?._id?.substring(0, 5)}...
          {device?._id?.substring(device?._id?.length, 21)}
        </em>
        <em>{device?.deviceHolderName}</em>
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
  const [device, setDevice] = useState(data.devices[0]);
  const [devices, setDevices] = useState(data.devices);
  const navigate = useNavigate();

  const onSearch = (/**@type String */ value) => {
    const filtered = data.devices.filter(
      (eachDevice) =>
        eachDevice._id.toLowerCase().includes(value.toLowerCase()) ||
        eachDevice.deviceHolderName.toLowerCase().includes(value.toLowerCase())
    );

    setDevices(filtered);
  };

  const editDevice = () => {
    navigate(
      `/home/devices/edit/${device?._id?.substring(1, device?._id?.length)}`
    );
  };

  return (
    <section className={css.devices}>
      <div className={css.left}>
        <div className={css["device-details"]}>
          <div className={css.details}>
            <ul>
              <li>
                <em>ID</em>: <em>{device["_id"]}</em>
              </li>
              <li>
                <em>Registered</em>: <em>{device["registered"]}</em>
              </li>{" "}
              <li>
                <em>Location</em>:{" "}
                <em>
                  {device["location"]["lat"]} {device["location"]["lng"]}
                </em>
              </li>{" "}
              <li>
                <em>State</em>: <em>{device["state"]}</em>
              </li>
              <li>
                <em>Station</em>: <em>{device["station"]}</em>
              </li>
              <li>
                <em>Militant ID</em>: <em>{device["deviceHolderId"]}</em>
              </li>
              <li>
                <em>Militant name</em>: <em>{device["deviceHolderName"]}</em>
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
        <div className={css["map-container"]}>
          {device["location"] && (
            <Map newCenter={device["location"]} zoom={10} />
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
        <DevicesList
          devices={devices}
          onViewMore={setDevice}
          className={css.users}
        />
      </div>
    </section>
  );
};

const AddDeviceSection = ({ id }) => {
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

  const models = [
    new SelectClass(0, "Samsung", "Samsung"),
    new SelectClass(0, "Huwawei", "Huwawei"),
    new SelectClass(0, "Infinix", "Infinix"),
  ];

  const addDevice = () => {
    if (!formIsValid) return executeBlurHandlers();

    console.log("NEW DEVICE", { imei: IMEI, serialNumber, deviceModel });
    reset();
  };

  const updateDevice = () => {
    if (!formIsValid) return executeBlurHandlers();

    console.log("UPDATED DEVICE", { imei: IMEI, serialNumber, deviceModel });
    reset();
  };

  return (
    <>
      <div className={css["section-main"]}>
        <div className={css.head}>
          <h3>Add device</h3>
        </div>
        <hr className={css.divider} />
        <div className={css["body"]}>
          <Form onSubmit={id ? updateDevice : addDevice}>
            <Form.Group widths="equal">
              <Form.Input
                icon="pencil"
                iconPosition="left"
                placeholder="IMEI number..."
                label="IMEI number"
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
              <Button className="send" disabled={!formIsValid}>
                {id ? "Update device" : "Add device"}
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

export const UploadBulkDevices = () => {};
