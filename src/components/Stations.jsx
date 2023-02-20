import { useAnimation, motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Button,
  Form,
  Icon,
  Input,
  Message,
  Table,
  Checkbox,
  Select,
} from "semantic-ui-react";
import css from "../styles/stations/Stations.module.scss";
import data from "../data.json";
import Map from "./Map";
import { Marker } from "@react-google-maps/api";
import Main from "./Main";
import { SelectClass, clearSimilarArrayObjects } from "../utils";
import { useForm, useInput } from "use-manage-form";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "./FileUpload";
import * as XLSX from "xlsx";

export const StationCard = ({ station, onView = () => {}, index }) => {
  const [ref, inView] = useInView();
  const control = useAnimation();
  const navigate = useNavigate();
  const variants = {
    far: { opacity: 0, x: "-100px" },
    current: { opacity: 1, x: "0px" },
  };

  const edit = () => {
    navigate(`/home/stations/edit/${station?._id}`);
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
      className={css["station-card"]}
      ref={ref}
    >
      <div className={css.details}>
        <em>
          <b>ID: </b>
          {station?._id?.substring(0, 5)}...
          {station?._id?.substring(station?._id?.length, 21)}
        </em>
        <em>
          <b>Name:</b> {station?.name}
        </em>
        <em>
          <b>State:</b> {station?.state}
        </em>
        <em>
          <b>Address:</b> {station?.address}
        </em>
        <em>
          <b>Date added:</b> {station?.dateAdded}
        </em>
      </div>
      <div className={`actions ${css.actions}`}>
        <Button
          onClick={() => {
            onView(station?.location);
          }}
        >
          View on map
        </Button>
        <Button onClick={edit}>Edit</Button>
      </div>
    </motion.div>
  );
};

const mapCenter = { lat: 9.082, lng: 8.6753 };

export const Stations = () => {
  const [stations, setStations] = useState(
    /**@type data.stations */ data.stations
  );
  const [currentState, setCurrentState] = useState("");
  const [circle, setCircle] = useState({});
  const map = useRef();
  const states = [
    {
      key: 0,
      value: "",
      text: "All",
    },
    ...data.stations.map((eachStation) => ({
      key: eachStation._id,
      value: eachStation.state,
      text: eachStation.state,
    })),
  ];
  const onStateFilter = (e, { value }) => {
    setCurrentState(value);
    const filtered = data.stations.filter((station) =>
      station.state.toLowerCase().includes(value.toLowerCase())
    );
    setStations(filtered);
  };

  const onSearch = (value) => {
    const filteredState = data.stations.filter((station) =>
      station.state.toLowerCase().includes(currentState.toLowerCase())
    );

    const filtered = filteredState.filter((station) =>
      station.name.toLowerCase().includes(value.toLowerCase())
    );

    setStations(filtered);
  };

  const onViewClick = (position) => {
    map.current?.panTo(position);
    map.current?.setZoom(10);
    setCircle({ location: position, radius: 15000 });
  };

  return (
    <section className={css.stations}>
      <div className={css.left}>
        <div className={css["filter-container"]}>
          <Select
            placeholder="Select state"
            options={states}
            onChange={onStateFilter}
          />
          <Input
            placeholder="Search stations..."
            label="Search"
            onChange={({ target: { value } }) => onSearch(value)}
          />
        </div>
        <div className={css["stations-list-container"]}>
          <h3>Stations</h3>
          <div className={css["stations-list"]}>
            {stations.map((eachStation, i) => (
              <StationCard station={eachStation} key={i} onView={onViewClick} />
            ))}
          </div>
        </div>
      </div>
      <div className={css.right}>
        {stations && (
          <Map
            newCenter={mapCenter}
            zoom={5}
            reference={map}
            circles={[circle]}
          >
            {stations.map((station) => (
              <Marker position={station.location} />
            ))}
          </Map>
        )}
      </div>
    </section>
  );
};

const AddEditStationSection = () => {
  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: address,
    isValid: addressIsValid,
    inputIsInValid: addressInputIsInValid,
    onChange: onAddressChange,
    onBlur: onAddressBlur,
    reset: resetAddress,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: state,
    isValid: stateIsValid,
    inputIsInValid: stateInputIsInValid,
    onChange: onStateChange,
    onBlur: onStateBlur,
    reset: resetState,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: LGA,
    isValid: LGAIsValid,
    inputIsInValid: LGAInputIsInValid,
    onChange: onLGAChange,
    onBlur: onLGABlur,
    reset: resetLGA,
  } = useInput((value) => value?.trim() !== "");

  const states = data.states.map(
    (eachState) =>
      new SelectClass(eachState.code, eachState.name, eachState.name)
  );

  const lgas = data.states
    .find((eachState) => eachState.name === state)
    ?.lgas?.map((eachLga, i) => new SelectClass(i, eachLga, eachLga));

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onNameBlur, onAddressBlur, onStateBlur, onLGABlur],
    resetHandlers: [resetName, resetLGA, resetAddress, resetState],
    validateOptions: () =>
      nameIsValid && addressIsValid && stateIsValid && LGAIsValid,
  });

  const submitHandler = () => {
    if (!formIsValid) return executeBlurHandlers();

    console.log("SUCCESS", { name, address, state, LGA });
    reset();
  };

  return (
    <>
      <Main header={"Create station"}>
        <Form onSubmit={submitHandler}>
          <Form.Group widths={"equal"}>
            <Form.Input
              placeholder="Enter name of station"
              icon="pencil alternate"
              iconPosition="left"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={onNameBlur}
              error={
                nameInputIsInValid && {
                  content: "Input must NOT be empty",
                  pointing: "above",
                }
              }
            />
            <Form.Input
              placeholder="Enter address of station"
              icon="address book outline"
              iconPosition="left"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              onBlur={onAddressBlur}
              error={
                addressInputIsInValid && {
                  content: "Input must NOT be empty",
                  pointing: "above",
                }
              }
            />
          </Form.Group>
          <Form.Group widths={"equal"}>
            <Form.Select
              placeholder="Select state"
              options={states}
              value={state}
              onChange={(e, { value }) => onStateChange(value)}
              onBlur={onStateBlur}
              error={
                stateInputIsInValid && {
                  content: "Please select a state",
                  pointing: "above",
                }
              }
            />
            {state && (
              <Form.Select
                placeholder="Select L.G.A"
                options={lgas}
                value={LGA}
                onChange={(e, { value }) => onLGAChange(value)}
                onBlur={onLGABlur}
                error={
                  LGAInputIsInValid && {
                    content: "Please select an L.G.A",
                    pointing: "above",
                  }
                }
              />
            )}
          </Form.Group>
          <div className={`actions ${css.actions}`}>
            <Button type="submit" disabled={!formIsValid}>
              Submit
            </Button>
            <Button type="reset" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </Form>
      </Main>
    </>
  );
};

const EachTableRow = ({
  data: userData /**@type data.users[0] */,
  onCheckedHandler,
  onEdit,
  onDelete,
  approvedState,
  refreshCheckedState,
}) => {
  const [checked, setChecked] = useState(approvedState);
  const [editingRow, setEditingRow] = useState(false);

  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: address,
    isValid: addressIsValid,
    inputIsInValid: addressInputIsInValid,
    onChange: onAddressChange,
    onBlur: onAddressBlur,
    reset: resetAddress,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: state,
    isValid: stateIsValid,
    inputIsInValid: stateInputIsInValid,
    onChange: onStateChange,
    onBlur: onStateBlur,
    reset: resetState,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: LGA,
    isValid: LGAIsValid,
    inputIsInValid: LGAInputIsInValid,
    onChange: onLGAChange,
    onBlur: onLGABlur,
    reset: resetLGA,
  } = useInput((value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onNameBlur, onAddressBlur, onStateBlur, onLGABlur],
    resetHandlers: [resetName, resetAddress, resetState, resetLGA],
    validateOptions: () =>
      nameIsValid && addressIsValid && stateIsValid && LGAIsValid,
  });

  const states = data.states.map(
    (eachState) =>
      new SelectClass(eachState.code, eachState.name, eachState.name)
  );

  const lgas = data.states
    .find((eachState) => eachState.name === state)
    ?.lgas?.map((eachLga, i) => new SelectClass(i, eachLga, eachLga));

  const update = () => {
    if (!formIsValid) return executeBlurHandlers();

    const data = {
      id: userData?.id,
      Name: name,
      Address: address,
      State: state,
      LGA,
    };
    console.log("DATA", data);
    onEdit(data);
    setEditingRow(false);
  };

  useEffect(() => {
    setChecked(approvedState);
  }, [approvedState, refreshCheckedState]);

  useEffect(() => {
    onNameChange(userData?.Name);
    onAddressChange(userData?.Address);
    onStateChange(userData?.State);
    onLGAChange(userData?.LGA);
  }, [editingRow]);

  if (editingRow) {
    return (
      <Table.Row>
        <Table.Cell collapsing></Table.Cell>
        <Table.HeaderCell>
          <Input
            placeholder="Fullname..."
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            error={nameInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Input
            placeholder="Address..."
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            onBlur={onAddressBlur}
            error={addressInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Select
            label="Select a state"
            placeholder="Select a state"
            options={states}
            value={state}
            onChange={(e, { value }) => onStateChange(value)}
            onBlur={onStateBlur}
            error={stateInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Select
            label="Select an LGA"
            placeholder="Select an LGA"
            options={lgas}
            value={LGA}
            onChange={(e, { value }) => onLGAChange(value)}
            onBlur={onLGABlur}
            error={LGAInputIsInValid}
          />
        </Table.HeaderCell>
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
        <Checkbox
          slider
          checked={checked}
          onChange={(e, { checked }) => {
            onCheckedHandler(userData, checked);
            setChecked((prev) => !prev);
          }}
        />
      </Table.Cell>
      <Table.HeaderCell>{userData?.Name}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.Address}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.State}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.LGA}</Table.HeaderCell>
      <Table.Cell collapsing>
        <Button
          color="blue"
          onClick={() => {
            setEditingRow(true);
          }}
        >
          Edit
        </Button>
        <Button color="red" onClick={() => onDelete(userData)}>
          Delete
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};

const UploadBulkStationsSection = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [approvedState, setApprovedState] = useState(false);
  const [refreshCheckedState, setRefreshCheckedState] = useState(false);
  const [submitState, setSubmitState] = useState({
    uploading: false,
    success: false,
    error: false,
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

  const onSuccessUpload = () => {
    setSubmitState((prev) => ({
      ...prev,
      success: true,
      uploading: false,
    }));

    setTimeout(() => {
      setSubmitState((prev) => ({
        ...prev,
        success: false,
        uploading: false,
      }));
    }, 1000 * 10);
  };

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
    setUploadedData(clearSimilarArrayObjects(data, "id"));
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
      setUploadedData(clearSimilarArrayObjects(data, "id"));
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
      setSelectedUsers((preUsers) => ({
        ...preUsers,
        [data["id"]]: data,
      }));
    } else {
      const oldUsers = { ...selectedUsers };
      delete oldUsers[data["id"]];
      setSelectedUsers(oldUsers);
    }
  };

  const uploadStations = () => {
    setSubmitState((prev) => ({ ...prev, uploading: true }));

    const selectedArray = Object.entries(selectedUsers)?.map(
      ([key, value]) => value
    );

    if (selectedArray?.length < 1) {
      setSubmitState((prev) => ({ ...prev, uploading: false }));
      return;
    }

    const currentUsers = {};
    uploadedData.forEach((eachDevice) => {
      currentUsers[eachDevice["id"]] = eachDevice;
    });

    for (const key in selectedUsers) {
      delete currentUsers[key];
    }

    const currentUsersArray = Object.entries(currentUsers)?.map(
      ([key, value]) => value
    );

    setUploadedData(currentUsersArray);
    setSelectedUsers({});
    onSuccessUpload();
    console.log("SELECTED ARRAY", selectedArray);
  };

  const selectAllStations = () => {
    const addedDevices = {};

    for (const data of uploadedData) {
      addedDevices[data["id"]] = data;
    }

    setSelectedUsers(addedDevices);
  };

  const approveAll = () => {
    selectAllStations();
    setApprovedState(true);
  };

  const disApproveAll = () => {
    setSelectedUsers({});
    setApprovedState(false);
    setRefreshCheckedState((prev) => !prev);
  };

  const onEdit = (station) => {
    const allUsers = [...uploadedData];

    allUsers.forEach((eachStation, i, arr) => {
      if (eachStation["id"] === station["id"]) {
        arr[i] = station;
      }
    });

    setUploadedData(allUsers);
  };

  const onDelete = (station) => {
    setUploadedData((prevData) =>
      prevData?.filter((eachStation) => eachStation["id"] !== station["id"])
    );
  };

  // console.log("UPLOADED DATA", uploadedData);

  return (
    <Main header="Upload stations" className={css["bulk-upload"]}>
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
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Address</Table.HeaderCell>
                <Table.HeaderCell>State</Table.HeaderCell>
                <Table.HeaderCell>L.G.A</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {uploadedData?.map((data, i) => (
                <EachTableRow
                  data={data}
                  onCheckedHandler={onCheckedHandler}
                  key={data?.id}
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
                <Table.HeaderCell colSpan="13">
                  <Button
                    floated="right"
                    icon
                    labelPosition="left"
                    color="green"
                    size="small"
                    onClick={uploadStations}
                    disabled={
                      Object.keys(selectedUsers)?.length < 1 ? true : false
                    }
                    // disabled={submitState.uploading}
                  >
                    <Icon name="cloud upload" /> Upload stations
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
        {submitState.success && (
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
              <Message success content="Stations uploaded successfully" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Main>
  );
};

export const CreateEditStation = () => {
  return (
    <section className={css["create-station"]}>
      <AddEditStationSection />
      <UploadBulkStationsSection />
    </section>
  );
};
