import { useAnimation, motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInput, useForm } from "use-manage-form";
import {
  Button,
  Form,
  Icon,
  Input,
  Message,
  Table,
  Checkbox,
} from "semantic-ui-react";
import css from "../styles/ranks/Ranks.module.scss";
import data from "../data.json";
import Map from "./Map";
import { Marker, InfoWindow } from "@react-google-maps/api";
import Main from "./Main";
import { FileUpload, ImgUpload } from "./FileUpload";
import * as XLSX from "xlsx";
import {
  clearSimilarArrayObjects,
  mapCenter,
  manageMqttEvents,
} from "../utils";
import useAjaxHook from "use-ajax-request";
import axios from "axios";
import CustomLoader from "./CustomLoader";
import { useDispatch, useSelector } from "react-redux";
import dummy from "../assets/img/dummy_profile_pic.png";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../pages/Home";

const getDevicesToShowOnMap = (
  /**@type  Array*/ mappedMembers,
  /**@type Object */ socketDevices
) => {
  const onlineDevices = {};
  for (const member of mappedMembers) {
    if (member?.Devices?.length < 1) continue;
    for (const device of member?.Devices) {
      if (socketDevices[device])
        onlineDevices[device] = {
          ...member,
          IMEI_Number: device,
          location: {
            lat: socketDevices[device]?.lat,
            lng: socketDevices[device]?.lng,
          },
        };
    }
  }

  return Object.entries(onlineDevices)?.map(([key, device]) => device);
};

export const RankCard = ({ rank, onView = () => {}, index, socketDevices }) => {
  const [ref, inView] = useInView();
  const [onlineMembers, setOnlineMembers] = useState(0);
  const control = useAnimation();
  const navigate = useNavigate();
  const variants = {
    far: { opacity: 0, x: "-100px" },
    current: { opacity: 1, x: "0px" },
  };
  const mappedMembers = rank?.Members?.map((member) => ({
    ...member,
    rankImage: rank?.Image,
  }));

  const getOnlineMembers = () => {
    const onlineMembers = {};
    for (const member of mappedMembers) {
      if (member?.Devices?.length < 1) continue;
      for (const device of member?.Devices) {
        if (socketDevices[device]) onlineMembers[member?.UserId] = { member };
      }
    }

    setOnlineMembers(
      Object.entries(onlineMembers)?.map(([key, member]) => member)?.length
    );
  };

  const onEditClick = () => {
    navigate(`/home/ranks/edit/${rank?.RankId}`);
  };

  useEffect(() => {
    if (inView) {
      control.start("current");
    } else {
      control.start("far");
    }
  }, [control, inView]);

  useEffect(() => {
    getOnlineMembers();
  }, [socketDevices]);

  return (
    <motion.div
      variants={variants}
      initial="far"
      animate={control}
      transition={{
        delay: index / 50,
      }}
      className={css["rank-card"]}
      ref={ref}
    >
      <div className={css["img-container"]}>
        <img src={rank?.Image} alt="" />
      </div>
      <div className={css.details}>
        <em>
          <b>ID: </b>
          {rank?.RankId}
        </em>
        <em>
          <b>Rank:</b> {rank?.RankName}
        </em>
        <em>
          <b>Total members:</b> {rank?.Members?.length}
        </em>
      </div>
      <div className={`actions ${css.actions}`}>
        <div className={css["button-container"]}>
          <Button
            onClick={() => {
              onView(
                getDevicesToShowOnMap(mappedMembers, socketDevices),
                mappedMembers
              );
            }}
          >
            View on map
          </Button>
          <Button onClick={onEditClick}>Edit</Button>
        </div>

        <div className={css["badge-container"]}>
          <p className={css.badge}>
            <span className="online-dot"></span> {onlineMembers}
          </p>
          <p className={css.badge}>
            <span className="offline-dot"></span>{" "}
            {mappedMembers?.length - onlineMembers}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const Ranks = () => {
  const [ranks, setRanks] = useState(/**@type data.ranks */ []);
  const [onlineDevices, setOnlineDevices] = useState([]);
  const [rankMembers, setRankMembers] = useState([]);
  const socketDevices = useSelector((state) => state?.socketDevices);
  const [showInfo, setShowInfo] = useState(false);
  const map = useRef();
  const dispatch = useDispatch();

  const {
    sendRequest: getRanks,
    error: getRanksError,
    loading: gettingRanks,
    data: allRanks,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/ranks`,
      method: "GET",
    },
  });

  // manageSocketDevicesConnection({ ws, dispatch });
  manageMqttEvents({ client, dispatch });

  const onSearch = (value) => {
    const filtered = allRanks.filter((rank) =>
      rank?.RankName?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setRanks(filtered);
  };
  const onViewClick = (
    /**@type Array */ onlineDevices,
    /**@type Array */ members
  ) => {
    map.current?.setZoom(6.3);
    setOnlineDevices(onlineDevices);
    setRankMembers(members);
  };

  const onGetRanksSuccess = ({ data }) => {
    setRanks(data);
    if (rankMembers?.length < 1) {
      const members = [];
      const onlineDevices = [];
      for (const rank of data) {
        members.push(
          ...rank?.Members?.map((member) => ({
            ...member,
            rankImage: rank?.Image,
          }))
        );
        onlineDevices.push(
          ...getDevicesToShowOnMap(rank?.Members, socketDevices)
        );
      }
      setRankMembers(members);
      setOnlineDevices(onlineDevices);
      console.log("ONLINE DEVICES", onlineDevices);
    }
  };

  useEffect(() => {
    getRanks(onGetRanksSuccess);
  }, []);

  useEffect(() => {
    if (rankMembers?.length > 0)
      setOnlineDevices(getDevicesToShowOnMap(rankMembers, socketDevices));
  }, [socketDevices]);

  return (
    <section className={css.ranks}>
      <div className={css.left}>
        <div className={css["filter-container"]}>
          <Input
            placeholder="Search ranks..."
            label="Search"
            onChange={({ target: { value } }) => onSearch(value)}
          />
        </div>
        <div className={css["ranks-list-container"]}>
          <h3>Ranks</h3>
          <div className={css["ranks-list"]}>
            {gettingRanks ? (
              <CustomLoader />
            ) : getRanksError ? (
              <>
                <Message
                  icon="page4"
                  content="There was an error getting ranks, please retry"
                  warning
                />
              </>
            ) : ranks?.length > 0 ? (
              ranks.map((eachRank, i) => (
                <RankCard
                  rank={eachRank}
                  key={i}
                  onView={onViewClick}
                  socketDevices={socketDevices}
                />
              ))
            ) : (
              <>
                <Message
                  icon="page4"
                  content="No ranks are available"
                  warning
                />
              </>
            )}
          </div>
        </div>
      </div>
      <div className={css.right}>
        {ranks && (
          <Map
            newCenter={mapCenter}
            zoom={5}
            reference={map}
            showMarker={false}
          >
            {onlineDevices.map((/**@type data.ranks.members */ member) => (
              <Marker
                icon={{
                  url: member?.rankImage,
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                position={member?.location}
                onClick={() => {
                  setShowInfo({ ...member });
                }}
              />
            ))}
            {showInfo && (
              <InfoWindow
                position={showInfo.location}
                onCloseClick={() => {
                  setShowInfo(null);
                }}
              >
                <div className={css.info}>
                  <div className={css["img-container"]}>
                    <img src={showInfo?.UserImage || dummy} alt="Militant" />
                  </div>
                  <div className={css.details}>
                    <em>
                      <b>ID:</b> {showInfo?.UserId}
                    </em>
                    <em>
                      <b>Name:</b> {showInfo?.Name}
                    </em>
                    <em>
                      <b>Station:</b> {showInfo?.Station || "Nill"}
                    </em>
                    <em>
                      <b>Device ID:</b> {showInfo?.IMEI_Number || "Nil"}
                    </em>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        )}
      </div>
    </section>
  );
};

const AddEditRankSection = () => {
  const [resetFileImage, setResetFileImage] = useState(false);
  const [previousImage, setPreviousImage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const params = useParams();
  const id = params.id;
  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: file,
    isValid: fileIsValid,
    inputIsInValid: fileInputIsInValid,
    onChange: onFileChange,
    onBlur: onFileBlur,
    reset: resetFile,
  } = useInput((value) => previousImage || typeof value === "object");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("image", file || previousImage || "");

  const {
    sendRequest: postRank,
    data: rankResponse,
    loading: postingRank,
    error: postRankError,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: id
        ? `${process.env.REACT_APP_API_DOMAIN}/api/ranks/${id}`
        : `${process.env.REACT_APP_API_DOMAIN}/api/ranks`,
      method: id ? "PUT" : "POST",
      data: formData,
    },
  });

  const {
    sendRequest: getRank,
    data: fetchedRank,
    loading: gettingRank,
    error: getRankError,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/ranks/${id}`,
      method: "GET",
    },
  });

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onNameBlur, onFileBlur],
    resetHandlers: [
      resetName,
      resetFile,
      () => setResetFileImage((prev) => !prev),
    ],
    validateOptions: () => nameIsValid && fileIsValid,
  });

  const onPostSuccess = ({ data }) => {
    if (!id) reset();
    setShowSuccessMessage(true);

    setTimeout(() => setShowSuccessMessage(false), 1000 * 10);
  };

  const submitHandler = () => {
    if (!formIsValid) return executeBlurHandlers();

    console.log("SUCCESS", { name, image: file || previousImage });

    postRank(onPostSuccess);
  };

  useEffect(() => {
    if (id) {
      const onRankSuccess = ({ data }) => {
        onNameChange(data?.RankName);
        setPreviousImage(data?.Image);
      };
      getRank(onRankSuccess);
    }
  }, []);

  return (
    <>
      <Main header={"Create rank"}>
        {" "}
        {showSuccessMessage && (
          <>
            <Message content="Rank posted successfully" success />
            <br />
          </>
        )}
        {postRankError && (
          <>
            <Message
              content={"There was an error posting the rank please try again"}
              error
            />
            <br />
          </>
        )}
        <Form onSubmit={submitHandler}>
          <div className={"upload-container"}>
            <ImgUpload
              className="upload"
              value={file}
              initialImage={previousImage}
              removeInitialImage={setPreviousImage}
              onChange={(e) => {
                onFileBlur();
                onFileChange(e?.target?.files[0]);
              }}
              triggerReset={resetFileImage}
            />
            {fileInputIsInValid && (
              <Message color="red" content="Please upload an image" />
            )}
          </div>
          <br />
          <Form.Group widths={"equal"}>
            <Form.Input
              placeholder="Enter name of rank"
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
          </Form.Group>
          <div className={`actions ${css.actions}`}>
            <Button type="submit" disabled={!formIsValid || postingRank}>
              {postingRank ? "Loading..." : "Submit"}
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
  data: rankData /**@type data.users[0] */,
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

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onNameBlur],
    resetHandlers: [resetName],
    validateOptions: () => nameIsValid,
  });

  const update = () => {
    if (!formIsValid) return executeBlurHandlers();

    const data = {
      id: rankData?.id,
      name,
    };
    console.log("DATA", data);
    onEdit(data);
    setEditingRow(false);
  };

  useEffect(() => {
    setChecked(approvedState);
  }, [approvedState, refreshCheckedState]);

  useEffect(() => {
    onNameChange(rankData?.name);
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
            onCheckedHandler(rankData, checked);
            setChecked((prev) => !prev);
          }}
        />
      </Table.Cell>
      <Table.HeaderCell>{rankData?.name}</Table.HeaderCell>

      <Table.Cell collapsing>
        <Button
          color="blue"
          onClick={() => {
            setEditingRow(true);
          }}
        >
          Edit
        </Button>
        <Button color="red" onClick={() => onDelete(rankData)}>
          Delete
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};

const UploadBulkRanksSection = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedRanks, setSelectedRanks] = useState({});
  const [approvedState, setApprovedState] = useState(false);
  const [refreshCheckedState, setRefreshCheckedState] = useState(false);
  const [noUploadedRanks, setNoUploadedRanks] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);
  const [uploadedSuccessfuly, setUploadedSuccessfuly] = useState(false);
  const {
    sendRequest: postRanks,
    error: postRanksError,
    loading: postingRanks,
    data: postRanksData,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/ranks/bulk`,
      method: "POST",
      data: Object.entries(selectedRanks)?.map(([key, eachRank]) => ({
        name: eachRank["name"],
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

  const onSuccessUpload = () => {
    setUploadedSuccessfuly(true);

    setTimeout(() => {
      setUploadedSuccessfuly(false);
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
      setSelectedRanks((preRanks) => ({
        ...preRanks,
        [data["id"]]: data,
      }));
    } else {
      const oldRanks = { ...selectedRanks };
      delete oldRanks[data["id"]];
      setSelectedRanks(oldRanks);
    }
  };

  const onNoUploadedRanks = () => {
    setNoUploadedRanks(true);

    setTimeout(() => setNoUploadedRanks(false), 1000 * 10);
  };

  const onUploadSuccess = ({ data }) => {
    const { uploadedRanks, errorLogs } = data;
    console.info(data);
    const currentRanks = {};
    uploadedData.forEach((eachRank) => {
      currentRanks[eachRank["name"]] = eachRank;
    });

    for (const key in uploadedRanks) {
      delete currentRanks[key];
    }

    const currentRanksArray = Object.entries(currentRanks)?.map(
      ([key, value]) => value
    );

    setUploadedData(currentRanksArray);
    setErrorLogs(errorLogs);
    setSelectedRanks({});
    disApproveAll();
    if (Object?.keys(uploadedRanks)?.length > 0) {
      onSuccessUpload();
    } else {
      onNoUploadedRanks();
    }
  };

  const onErrorUpload = () => setUploadedSuccessfuly(false);

  const uploadRanks = () => {
    const selectedArray = Object.entries(selectedRanks)?.map(
      ([key, value]) => value
    );

    if (selectedArray?.length < 1) {
      return;
    }

    postRanks(onUploadSuccess, onErrorUpload);
  };

  const selectAllRanks = () => {
    const addedRanks = {};

    for (const data of uploadedData) {
      addedRanks[data["id"]] = data;
    }

    setSelectedRanks(addedRanks);
  };

  const approveAll = () => {
    selectAllRanks();
    setApprovedState(true);
  };

  const disApproveAll = () => {
    setSelectedRanks({});
    setApprovedState(false);
    setRefreshCheckedState((prev) => !prev);
  };

  const onEdit = (rank) => {
    const allRanks = [...uploadedData];

    allRanks.forEach((eachRank, i, arr) => {
      if (eachRank["id"] === rank["id"]) {
        arr[i] = rank;
      }
    });

    setUploadedData(allRanks);
  };

  const onDelete = (rank) => {
    setUploadedData((prevData) =>
      prevData?.filter((eachRank) => eachRank["id"] !== rank["id"])
    );
  };

  const clearErrors = () => setErrorLogs([]);

  // console.log("UPLOADED DATA", uploadedData);

  return (
    <Main header="Upload ranks" className={css["bulk-upload"]}>
      <div className="upload-container">
        <FileUpload
          label={"Upload excel/json files only"}
          onChange={fileUploadValidator}
          className={"upload"}
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
                    onClick={uploadRanks}
                    disabled={
                      Object.keys(selectedRanks)?.length < 1
                        ? true
                        : false || postingRanks
                    }
                    // disabled={submitState.uploading}
                  >
                    <Icon name="cloud upload" />{" "}
                    {postingRanks ? "Loading..." : "Upload ranks"}
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
        {uploadedSuccessfuly && (
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
              <Message success content="Ranks uploaded successfully" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {postRanksError && (
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
                content="There was an error uploading your ranks, please try again"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {noUploadedRanks && (
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
              <Message warning content="No ranks were uploaded" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <br />
      <Table compact celled className={"error-table"}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan={2}>Error logs</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell collapsing>Rank name</Table.HeaderCell>
            <Table.HeaderCell>Error message</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {errorLogs?.map((error) => (
            <>
              <Table.Row key={error?.name}>
                <Table.Cell>{error?.name}</Table.Cell>
                <Table.Cell>{error?.error}</Table.Cell>
              </Table.Row>
            </>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell className={"actions"} colSpan={2} textAlign="right">
              <Button negative onClick={clearErrors}>
                Clear all
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Main>
  );
};

export const CreateEditRank = () => {
  return (
    <section className={css["create-rank"]}>
      <AddEditRankSection />
      <UploadBulkRanksSection />
    </section>
  );
};
