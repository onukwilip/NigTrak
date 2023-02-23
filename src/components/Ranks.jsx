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
  Select,
} from "semantic-ui-react";
import css from "../styles/ranks/Ranks.module.scss";
import data from "../data.json";
import Map from "./Map";
import { Marker, InfoWindow } from "@react-google-maps/api";
import { ranks as rankImgs } from "./UsersManagement";
import Main from "./Main";
import { FileUpload, ImgUpload } from "./FileUpload";
import * as XLSX from "xlsx";
import { SelectClass, clearSimilarArrayObjects } from "../utils";

export const RankCard = ({ rank, onView = () => {}, index }) => {
  const [ref, inView] = useInView();
  const control = useAnimation();
  const variants = {
    far: { opacity: 0, x: "-100px" },
    current: { opacity: 1, x: "0px" },
  };
  const mappedMembers = rank?.members?.map((member) => ({
    ...member,
    rank: rank.rank,
  }));

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
      className={css["rank-card"]}
      ref={ref}
    >
      <div className={css["img-container"]}>
        <img src={rankImgs[rank.rank]} alt="" />
      </div>
      <div className={css.details}>
        <em>
          <b>ID: </b>
          {rank?._id}
        </em>
        <em>
          <b>Rank:</b> {rank?.rank}
        </em>
        <em>
          <b>Total members:</b> {rank?.members?.length}
        </em>
      </div>
      <div className={css.actions}>
        <Button
          onClick={() => {
            onView(mappedMembers);
          }}
        >
          View on map
        </Button>
      </div>
    </motion.div>
  );
};

const mapCenter = { lat: 9.082, lng: 8.6753 };

export const Ranks = () => {
  const [ranks, setRanks] = useState(/**@type data.ranks */ data.ranks);
  const [rankMembers, setRankMembers] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const map = useRef();
  const onSearch = (value) => {
    const filtered = data.ranks.filter((rank) =>
      rank.rank.toLowerCase().includes(value.toLowerCase())
    );

    setRanks(filtered);
  };
  const onViewClick = (/**@type data.ranks.members */ members) => {
    map.current?.setZoom(6.3);
    setRankMembers(members);
  };

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
            {ranks.map((eachStation, i) => (
              <RankCard rank={eachStation} key={i} onView={onViewClick} />
            ))}
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
            {rankMembers.map((/**@type data.ranks.members */ member) => (
              <Marker
                icon={{
                  url: rankImgs[member.rank],
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
                    <img
                      src="https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
                      alt="Militant"
                    />
                  </div>
                  <div className={css.details}>
                    <em>
                      <b>ID:</b> {showInfo?._id}
                    </em>
                    <em>
                      <b>Name:</b> {showInfo?.name}
                    </em>
                    <em>
                      <b>Station:</b> {showInfo?.station}
                    </em>
                    <em>
                      <b>State:</b> {showInfo?.state}
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
  } = useInput((value) => typeof value === "object");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onNameBlur, onFileBlur],
    resetHandlers: [
      resetName,
      resetFile,
      () => setResetFileImage((prev) => !prev),
    ],
    validateOptions: () => nameIsValid && fileIsValid,
  });

  const submitHandler = () => {
    if (!formIsValid) return executeBlurHandlers();

    const data = new FormData();
    data.append("name", name);
    data.append("file", file);

    console.log("SUCCESS", data);
    reset();
  };

  return (
    <>
      <Main header={"Create rank"}>
        <Form onSubmit={submitHandler}>
          <div className={"upload-container"}>
            <ImgUpload
              className="upload"
              value={file}
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

  const uploadRanks = () => {
    setSubmitState((prev) => ({ ...prev, uploading: true }));

    const selectedArray = Object.entries(selectedRanks)?.map(
      ([key, value]) => value
    );

    if (selectedArray?.length < 1) {
      setSubmitState((prev) => ({ ...prev, uploading: false }));
      return;
    }

    const currentRanks = {};
    uploadedData.forEach((eachDevice) => {
      currentRanks[eachDevice["id"]] = eachDevice;
    });

    for (const key in selectedRanks) {
      delete currentRanks[key];
    }

    const currentRanksArray = Object.entries(currentRanks)?.map(
      ([key, value]) => value
    );

    setUploadedData(currentRanksArray);
    setSelectedRanks({});
    onSuccessUpload();
    console.log("SELECTED ARRAY", selectedArray);
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
                      Object.keys(selectedRanks)?.length < 1 ? true : false
                    }
                    // disabled={submitState.uploading}
                  >
                    <Icon name="cloud upload" /> Upload ranks
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
              <Message success content="Ranks uploaded successfully" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
