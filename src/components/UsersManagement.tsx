import React, { useState, useEffect } from "react";
import css from "../styles/userManagement/UserManagement.module.scss";
import { useInView } from "react-intersection-observer";
import ProfileContainer from "./ProfileContainer";
import mRank from "../assets/img/major-rank.png";
import mgRank from "../assets/img/mg-rank.png";
import cRank from "../assets/img/coloniel-rank.png";
import lcRank from "../assets/img/lc-rank.png";
import oRank from "../assets/img/officer-rank.png";
import sRank from "../assets/img/sergent-rank.png";
import Map from "./Map";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { FileUpload } from "./FileUpload";
import {
  Button,
  Divider,
  Form,
  Icon,
  Input,
  Message,
  Table,
  Checkbox,
  Select,
} from "semantic-ui-react";
import data from "../data.json";
import walkieTalkieTrans from "../assets/img/walkie-talkie-trans.png";
import { useInput, useForm } from "use-manage-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  clearSimilarArrayObjects,
  fileUploadValidator,
  getExention,
  manageMqttEvents,
  SelectClass,
} from "../utils";
import Main from "./Main";
import useAjaxHook from "use-ajax-request";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getDeviceAction } from "../store/devicesReducer";
import { Marker } from "@react-google-maps/api";
import dummy from "../assets/img/dummy_profile_pic.png";
import CustomLoader from "./CustomLoader";
import { getRanksAction } from "../store/ranksReducer";
import useDevices from "../hooks/useDevices";
import useRanks from "../hooks/useRanks";
import { client } from "../pages/Home";
import {
  cardPropsType,
  eachTableRowPropsType,
  eachUploadedUserFileType,
  latLngType,
  postBulkUsersErrorType,
  postBulkUsersReturnType,
  selectInputOnChangePropsType,
  selectType,
  selectedUsers,
  selectorState,
  socketDeviceType,
  uploadedUserFileType,
  userCardPropsType,
  userType,
  usersListType,
} from "src/types/types";
import { AnyAction } from "redux";

export const ranks = {
  General: mRank,
  "Major General": mgRank,
  Coloniel: cRank,
  "Leutenant Coloniel": lcRank,
  Officer: oRank,
  Sergent: sRank,
};

const Card = ({ item, onCancel, src }: cardPropsType) => {
  return (
    <div className={css["card"]}>
      <div className={css["details-container"]}>
        <div>
          <img src={src} alt="" />
        </div>
        <div>
          <h5>{item}</h5>
        </div>
      </div>
      <div>
        <Icon
          name="cancel"
          onClick={() => {
            onCancel(item);
          }}
        />
      </div>
    </div>
  );
};

export const UserCard = ({
  user,
  onViewMore = () => {},
  index,
}: userCardPropsType) => {
  const socketDevices = useSelector(
    (state: selectorState) => state?.socketDevices
  );
  const [ref, inView] = useInView();
  const control = useAnimation();
  const variants = {
    far: { opacity: 0, x: "100px" },
    current: { opacity: 1, x: "0px" },
  };

  const userSocketDevicesToArray = () => {
    const arr: socketDeviceType[] = [];
    user?.Devices?.forEach((device) => {
      if (socketDevices[device?.IMEI_Number]) {
        arr.push(socketDevices[device?.IMEI_Number]);
      }
    });
    return arr;
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
        delay: index ? index / 50 : 0,
      }}
      className={css["user-card"]}
      ref={ref}
    >
      <div
        className={
          userSocketDevicesToArray()?.length > 0 ? "online-dot" : "offline-dot"
        }
      ></div>
      <div className={css["img-container"]}>
        <img src={user?.Image || dummy} alt="" />
      </div>
      <div className={css.details}>
        <em>{user?.Name}</em>
        <em>
          {" "}
          <img src={user?.RankImage} className="rank" alt="rank" />{" "}
          {user?.RankName}
        </em>
      </div>
      <div className={css.actions}>
        <Button
          onClick={() => {
            onViewMore(user);
          }}
        >
          View more
        </Button>
      </div>
    </motion.div>
  );
};

export const UsersList = ({ users, onViewMore, className }: usersListType) => {
  return (
    <div className={`${css["users-list"]} ${className}`}>
      {users.map((user, i) => (
        <UserCard
          user={user}
          onViewMore={onViewMore}
          key={user?.UserId}
          index={i}
        />
      ))}
    </div>
  );
};

export const AllUsers = ({ position }: { position: latLngType }) => {
  const [militaints, setMilitaints] = useState<userType[]>([]);
  const [userProfile, setUserProfile] = useState(militaints[0]);
  const socketDevices = useSelector(
    (state: selectorState) => state?.socketDevices
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    sendRequest: getUsers,
    error: getUsersError,
    loading: gettingUsers,
    data: allUsers,
  } = useAjaxHook<userType[]>({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/users/`,
      method: "GET",
    },
  });

  const editUser = () => {
    navigate(`/home/users/edit/${userProfile?.UserId}`);
  };

  // manageSocketDevicesConnection({ ws, dispatch });
  manageMqttEvents({ client, dispatch });

  const onSearch = (value: string) => {
    const filtered = allUsers.filter(
      (eachUser) =>
        eachUser?.Name?.toLowerCase()?.includes(value.toLowerCase()) ||
        eachUser?.UserId?.toLowerCase()?.includes(value.toLowerCase()) ||
        eachUser?.RankName?.toLowerCase()?.includes(value.toLowerCase())
    );

    setMilitaints(filtered);
  };

  const userSocketDevicesToArray = () => {
    const arr: socketDeviceType[] = [];
    userProfile?.Devices?.forEach((device) => {
      if (socketDevices[device?.IMEI_Number]) {
        arr.push(socketDevices[device?.IMEI_Number]);
      }
    });
    return arr;
  };

  const checkIfDeviceIsOnline = (imeiNumber: string) => {
    return socketDevices[imeiNumber];
  };

  useEffect(() => {
    const onGetUsersSuccess = ({ data }: { data: userType[] }) => {
      setMilitaints(data);
    };
    getUsers(onGetUsersSuccess);
  }, []);

  useEffect(() => {
    if (militaints?.length > 0) setUserProfile(militaints[0]);
  }, [militaints]);

  return (
    <section className={css.users}>
      <div
        className={`${css.left} ${
          userSocketDevicesToArray()?.length < 1 ? css["left-no-map"] : null
        }`}
      >
        <div className={css["user-details"]}>
          <div className={css.picture}>
            <ProfileContainer
              profilePic={userProfile?.Image}
              name={userProfile?.Name}
              email={userProfile?.Email}
              phone={userProfile?.Phone}
            />
          </div>
          <div className={css.details}>
            <ul className={css["list"]}>
              <li>
                <em>Address</em>: <em> {userProfile?.Address || "Nil"}</em>
              </li>
              <li>
                <em>Joined</em>: <em>{new Date()?.toUTCString() || "Nil"}</em>
              </li>{" "}
              <li>
                <em>Status</em>:{" "}
                <em
                  className={
                    userSocketDevicesToArray()?.length > 0
                      ? "online"
                      : "offline"
                  }
                >
                  {userSocketDevicesToArray()?.length > 0
                    ? "Online"
                    : "Offline"}
                </em>
              </li>{" "}
              <li>
                <em> Rank</em>:{" "}
                <em>
                  {" "}
                  <img
                    src={userProfile?.RankImage}
                    className="rank"
                    alt="rank"
                  />{" "}
                  {userProfile?.RankName || "Nil"}
                </em>
              </li>
              <li>
                <em>Station</em>: <em>{userProfile?.Station || "Nil"}</em>
              </li>
              <li>
                <em>Devices</em>: {!userProfile && "Nil"}
                {userProfile?.Devices &&
                  userProfile?.Devices?.length < 1 &&
                  "Nil"}
                <ul className={css["mini-list"]}>
                  {userProfile?.Devices?.map((eachDevice, i) => (
                    <li key={i}>
                      <Link to="/home/devices/edit">
                        {`${eachDevice?.IMEI_Number}, `}{" "}
                      </Link>
                      <em
                        className={
                          checkIfDeviceIsOnline(eachDevice?.IMEI_Number)
                            ? "online"
                            : "offline"
                        }
                      >
                        {checkIfDeviceIsOnline(eachDevice?.IMEI_Number)
                          ? "Online"
                          : "Offline"}
                      </em>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <em>Accessories</em>: {!userProfile && "Nil"}
                {userProfile?.Accessories &&
                  userProfile?.Accessories?.length < 1 &&
                  "Nil"}
                <ul className={css["mini-list"]}>
                  {userProfile?.Accessories?.map((eachAccessory, i) => (
                    <li key={i}>
                      <span>{`${eachAccessory}, `}</span>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <em>Ammunition</em>: {!userProfile && "Nil"}
                {userProfile?.Ammunition &&
                  userProfile?.Ammunition?.length < 1 &&
                  "Nil"}
                <ul className={css["mini-list"]}>
                  {userProfile?.Ammunition?.map((eachAmmo, i) => (
                    <li key={i}>
                      <span>{`${eachAmmo}, `}</span>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
            <br />
            <div className="actions">
              <Button className="button" onClick={editUser}>
                Edit User
              </Button>
            </div>
          </div>
        </div>
        <div
          className={
            userSocketDevicesToArray()?.length > 0
              ? css["map-container"]
              : css["message-container"]
          }
        >
          {userSocketDevicesToArray()?.length > 0 ? (
            <Map
              newCenter={{
                lat: userSocketDevicesToArray()[0]?.lat,
                lng: userSocketDevicesToArray()[0]?.lng,
              }}
              zoom={10}
              showMarker={false}
            >
              {userSocketDevicesToArray()?.map((socketDevice) => (
                <>
                  <Marker
                    position={{
                      lat: parseFloat(socketDevice?.lat as unknown as string),
                      lng: parseFloat(socketDevice?.lng as unknown as string),
                    }}
                  />
                </>
              ))}
            </Map>
          ) : (
            <Message content="User is offline" warning />
          )}
        </div>
      </div>
      <div className={css.right}>
        <div className={css["search-container"]}>
          <Input
            className={css.input}
            label="Search"
            placeholder="Search militants"
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </div>
        {gettingUsers ? (
          <CustomLoader />
        ) : getUsersError ? (
          <>
            <Message
              icon="page4"
              content="There was an error getting users, please retry"
              warning
            />
          </>
        ) : militaints?.length > 0 ? (
          <UsersList
            users={militaints}
            onViewMore={setUserProfile}
            className={css.users}
          />
        ) : (
          <>
            <Message
              icon="page4"
              content="No militants are available"
              warning
            />
          </>
        )}
      </div>
    </section>
  );
};

export const CreateEditUser = () => {
  const [uploaded, setUploaded] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;
  const [rankOptions, setRankOptions] = useState<selectType[]>();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedAmmos, setSelectedAmmos] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [devicesOptions, setDevicesOptions] = useState<selectType[]>();
  useDevices({
    devicesOptions: devicesOptions as selectType[],
    setDevicesOptions: setDevicesOptions as any,
  });
  useRanks({
    rankOptions: rankOptions as selectType[],
    setRankOptions: setRankOptions as any,
  });
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [ammunition, setAmmunition] = useState<selectType[]>([
    {
      key: 0,
      value: "Pistol",
      text: "Pistol",
    },
    {
      key: 1,
      value: "Rifle",
      text: "Rifle",
    },
    {
      key: 2,
      value: "AK 47",
      text: "AK 47",
    },
    {
      key: 3,
      value: "Sniper",
      text: "Sniper",
    },
    {
      key: 4,
      value: "Tear gas",
      text: "Tear gas",
    },
    {
      key: 5,
      value: "Baton",
      text: "Baton",
    },
    {
      key: 6,
      value: "Hand cuffs",
      text: "Hand cuffs",
    },
    {
      key: 7,
      value: "Tazer",
      text: "Tazer",
    },
  ]);
  const [accessories, setAccessories] = useState<selectType[]>([
    {
      key: 0,
      value: "Helmet",
      text: "Helmet",
    },
    {
      key: 1,
      value: "Drone",
      text: "Drone",
    },
    {
      key: 2,
      value: "Laptop",
      text: "Laptop",
    },
    {
      key: 3,
      value: "Bulletproof",
      text: "Bulletproof",
    },
  ]);
  // const dispatch = useDispatch();

  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput<string>(
    (value) =>
      value?.trim() !== "" &&
      value?.trim() !== undefined &&
      value?.trim() !== null
  );

  const {
    value: email,
    isValid: emailIsValid,
    inputIsInValid: emailInputIsInValid,
    onChange: onEmailChange,
    onBlur: onEmailBlur,
    reset: resetEmail,
  } = useInput<string>(
    (value) =>
      value?.trim() !== "" &&
      value?.trim() !== undefined &&
      value?.trim() !== null
  );

  const {
    value: address,
    isValid: addressIsValid,
    inputIsInValid: addressInputIsInValid,
    onChange: onAddressChange,
    onBlur: onAddressBlur,
    reset: resetAddress,
  } = useInput<string>(
    (value) =>
      value?.trim() !== "" &&
      value?.trim() !== undefined &&
      value?.trim() !== null
  );

  const {
    value: phone,
    isValid: phoneIsValid,
    inputIsInValid: phoneInputIsInValid,
    onChange: onPhoneChange,
    onBlur: onPhoneBlur,
    reset: resetPhone,
  } = useInput<string>(
    (value) =>
      value?.trim() !== "" &&
      value?.trim() !== undefined &&
      value?.trim() !== null
  );

  const {
    value: rank,
    isValid: rankIsValid,
    inputIsInValid: rankInputIsInValid,
    onChange: onRankChange,
    onBlur: onRankBlur,
    reset: resetRank,
  } = useInput<string>(
    (value) =>
      value?.trim() !== "" &&
      value?.trim() !== undefined &&
      value?.trim() !== null
  );

  const {
    value: station,
    isValid: stationIsValid,
    inputIsInValid: stationInputIsInValid,
    onChange: onStationChange,
    onBlur: onStationBlur,
    reset: resetStation,
  } = useInput<string>(
    (value) =>
      value?.trim() !== "" &&
      value?.trim() !== undefined &&
      value?.trim() !== null
  );

  const {
    value: device,
    inputIsInValid: deviceInputIsInValid,
    onBlur: onDeviceBlur,
    onChange: onDeviceChange,
    reset: resetDevice,
  } = useInput<string>((value) => true);

  const {
    value: ammo,
    onBlur: onAmmoBlur,
    onChange: onAmmoChange,
    reset: resetAmmo,
  } = useInput<string>((value) => true);

  const {
    value: accessory,
    onBlur: onAccessoryBlur,
    onChange: onAccessoryChange,
    reset: resetAccessory,
  } = useInput<string>((value) => true);

  const {
    value: image,
    onBlur: onImageBlur,
    onChange: onImageChange,
    reset: resetImage,
  } = useInput<File>((value) => true);

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [
      onNameBlur,
      onEmailBlur,
      onAddressBlur,
      onPhoneBlur,
      onRankBlur,
      onStationBlur,
    ],
    resetHandlers: [
      resetName,
      resetEmail,
      resetAddress,
      resetPhone,
      resetRank,
      resetStation,
      resetDevice,
      resetAmmo,
      resetAccessory,
      resetImage,
      () => setSelectedDevices([]),
      () => setSelectedAccessories([]),
      () => setSelectedAmmos([]),
      () => setUploaded(null),
    ],
    validateOptions: () =>
      nameIsValid &&
      emailIsValid &&
      addressIsValid &&
      phoneIsValid &&
      rankIsValid &&
      stationIsValid,
  });

  const formData = new FormData();

  formData.append("name", name);
  formData.append("email", email);
  formData.append("address", address);
  formData.append("phone", phone);
  formData.append("rank", rank);
  formData.append("station", station);
  formData.append("userId", id || "");
  formData.append("devices", JSON.stringify(selectedDevices));
  formData.append("ammos", JSON.stringify(selectedAmmos));
  formData.append("accessories", JSON.stringify(selectedAccessories));
  formData.append("image", image || previousImage || "");

  const {
    sendRequest: postUser,
    data: userResponse,
    loading: postingUser,
    error: postUserError,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: id
        ? `${process.env.REACT_APP_API_DOMAIN}/api/users/${id}`
        : `${process.env.REACT_APP_API_DOMAIN}/api/users`,
      method: id ? "PUT" : "POST",
      data: formData,
    },
  });

  const {
    sendRequest: getUser,
    data: fetchedUser,
    loading: gettingUser,
    error: getUserError,
  } = useAjaxHook<userType>({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/users/${id}`,
      method: "GET",
    },
  });

  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    onImageChange(file);
    setUploaded(URL.createObjectURL(file));
  };

  const addDevice = (e: any, { value }: { value: string }) => {
    setSelectedDevices((prev) => [...prev, value]);
    setDevicesOptions((prev) =>
      prev?.filter((prevItem) => prevItem?.key !== value)
    );
  };

  const removeDevice = (device: string) => {
    setSelectedDevices((prev) =>
      prev.filter((prevDevice) => prevDevice !== device)
    );
    const option = devicesOptions?.find(
      (eachItem) => eachItem?.value === device || eachItem?.key === device
    );
    if (option) return;
    setDevicesOptions((prev = []) => [
      ...prev,
      new SelectClass(device, device, device),
    ]);
  };

  const addAmmo = (e: any, { value }: { value: string }) => {
    setAmmunition((prev) =>
      prev.filter((prevItem) => prevItem?.value !== value)
    );
    setSelectedAmmos((prev) => [...prev, value]);
  };

  const removeAmmo = (ammo: string) => {
    const option = ammunition?.find(
      (eachItem) =>
        eachItem?.value === ammo ||
        eachItem?.key?.toString() === ammo?.toString()
    );
    if (option) return;
    setAmmunition((prev = []) => [...prev, new SelectClass(ammo, ammo, ammo)]);
    setSelectedAmmos((prev) => prev.filter((prevAmmo) => prevAmmo !== ammo));
  };

  const addAccessories = (e: any, { value }: { value: string }) => {
    setAccessories((prev) =>
      prev.filter((prevItem) => prevItem?.value !== value)
    );
    setSelectedAccessories((prev) => [...prev, value]);
  };

  const removeAccessories = (accessory: string) => {
    const option = accessories?.find(
      (eachItem) => eachItem?.value === accessory || eachItem?.key === accessory
    );
    if (option) return;
    setAccessories((prev) => [
      ...prev,
      new SelectClass(accessory, accessory, accessory),
    ]);

    setSelectedAccessories((prev) =>
      prev.filter((prevAccessories) => prevAccessories !== accessory)
    );
  };

  const onSuccessPost = () => {
    setShowSuccessMessage(true);
    if (!id) reset();
    setTimeout(() => setShowSuccessMessage(false), 1000 * 5);
  };

  const onSubmit = () => {
    if (!formIsValid) return executeBlurHandlers();
    console.log("SUBMITTED", {
      name,
      email,
      address,
      phone,
      rank,
      station,
      devices: selectedDevices,
      ammos: selectedAmmos,
      accessories: selectedAccessories,
      image: image,
    });
    postUser(onSuccessPost);
  };

  // const stations = [
  //   {
  //     key: 0,
  //     value: data.stations[0]?.name,
  //     text: data.stations[0]?.name,
  //   },
  //   {
  //     key: 1,
  //     value: data.stations[1]?.name,
  //     text: data.stations[1]?.name,
  //   },
  //   {
  //     key: 2,
  //     value: data.stations[2]?.name,
  //     text: data.stations[2]?.name,
  //   },
  //   {
  //     key: 3,
  //     value: data.stations[5]?.name,
  //     text: data.stations[5]?.name,
  //   },
  //   {
  //     key: 4,
  //     value: data.stations[3]?.name,
  //     text: data.stations[3]?.name,
  //   },
  //   {
  //     key: 5,
  //     value: data.stations[4]?.name,
  //     text: data.stations[4]?.name,
  //   },
  // ];

  const stations: selectType[] = data?.stations?.map(
    (each) => new SelectClass(each?._id, each?.name, each?.name)
  );

  const onSuccessGet = ({ data }: { data: userType }) => {
    onNameChange(data?.Name);
    onEmailChange(data?.Email);
    onAddressChange(data?.Address);
    onPhoneChange(data?.Phone);
    onRankChange(data?.RankId);
    onStationChange(data?.Station);
    setSelectedDevices(
      data?.Devices?.map((eachDevice) => eachDevice?.IMEI_Number)
    );
    setSelectedAmmos(data?.Ammunition?.map((eachAmmo) => eachAmmo));
    setSelectedAccessories(
      data?.Accessories?.map((eachAccessory) => eachAccessory)
    );
    setPreviousImage(data?.Image);
  };

  useEffect(() => {
    if (id) getUser(onSuccessGet);
  }, [id]);

  return (
    <section className={css["create-user"]}>
      <div className={css.main}>
        <div className={css.head}>
          <em>{id ? "Edit user" : "Create new user"}</em>
        </div>
        <Divider className={css.divider} />
        <div className={css.body}>
          {showSuccessMessage && (
            <>
              <Message content="User posted successfully" success />
              <br />
            </>
          )}
          {postUserError && (
            <>
              <Message
                content={"There was an error posting the user please try again"}
                error
              />
              <br />
            </>
          )}

          <Form className={css.form} onSubmit={onSubmit}>
            <div className={css["form-inputs"]}>
              <Form.Group widths="equal">
                <Form.Input
                  icon="user"
                  iconPosition="left"
                  placeholder="Fullname..."
                  label="Fullname"
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
                  icon="mail"
                  iconPosition="left"
                  placeholder="Email address..."
                  label="Email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={onEmailBlur}
                  error={
                    emailInputIsInValid && {
                      content: "Input must be a valid email address",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Input
                  icon="address book"
                  iconPosition="left"
                  placeholder="Address..."
                  label="Address"
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
                <Form.Input
                  icon="phone"
                  iconPosition="left"
                  placeholder="Phone number..."
                  label="Phone"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  onBlur={onPhoneBlur}
                  error={
                    phoneInputIsInValid && {
                      content: "Input must NOT be empty",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Select
                  placeholder="Rank..."
                  label="Rank"
                  options={rankOptions as selectType[]}
                  value={rank}
                  onChange={(e, { value }) => onRankChange(value)}
                  onBlur={onRankBlur as any}
                  error={
                    rankInputIsInValid && {
                      content: "Select a rank",
                      pointing: "above",
                    }
                  }
                />
                <Form.Select
                  placeholder="Station..."
                  label="Station"
                  options={stations}
                  value={station}
                  onChange={(e, { value }) => onStationChange(value)}
                  onBlur={onStationBlur as any}
                  error={
                    stationInputIsInValid && {
                      content: "Select a station",
                      pointing: "above",
                    }
                  }
                />
              </Form.Group>
              <br />
              <div className={css["device-container"]}>
                <h3>Devices</h3>
                <Form.Select
                  label="Select a device"
                  placeholder="Select device"
                  options={devicesOptions as selectType[]}
                  value={device}
                  onChange={(e, { value }) => {
                    addDevice(e, { value: value as string });
                    onDeviceChange(value);
                  }}
                  onBlur={onDeviceBlur as any}
                  error={
                    deviceInputIsInValid && {
                      content: "Select at least one device",
                    }
                  }
                />
                <div className={css.devices}>
                  {selectedDevices.length > 0 ? (
                    <>
                      {selectedDevices.map((eachDevice) => (
                        <>
                          <Card
                            item={eachDevice}
                            onCancel={removeDevice}
                            src={walkieTalkieTrans}
                          />
                        </>
                      ))}
                    </>
                  ) : (
                    <Message
                      content="No device added"
                      className={css.message}
                    />
                  )}
                </div>
              </div>
              <br />
              <div className={css["accessory-container"]}>
                <h3>Accessories</h3>
                <Form.Select
                  label="Select an accessory"
                  placeholder="Select accessory"
                  options={accessories}
                  value={accessory}
                  onChange={(e, { value }) => {
                    addAccessories(e, { value: value as string });
                    onAccessoryChange(value);
                  }}
                  onBlur={onAccessoryBlur as any}
                />
                <div className={css.accessories}>
                  {selectedAccessories.length > 0 ? (
                    <>
                      {selectedAccessories.map((eachAccessory) => (
                        <>
                          <Card
                            item={eachAccessory}
                            onCancel={removeAccessories}
                          />
                        </>
                      ))}
                    </>
                  ) : (
                    <Message
                      content="No accessory added"
                      className={css.message}
                    />
                  )}
                </div>
              </div>
              <br />
              <div className={css["ammo-container"]}>
                <h3>Ammunition</h3>
                <Form.Select
                  label="Select an ammunition"
                  placeholder="Select ammunition"
                  options={ammunition}
                  value={ammo}
                  onChange={(e, { value }) => {
                    addAmmo(e, { value: value as string });
                    onAmmoChange(value);
                  }}
                  onBlur={onAmmoBlur as any}
                />
                <div className={css.ammos}>
                  {selectedAmmos.length > 0 ? (
                    <>
                      {selectedAmmos.map((eachAmmo) => (
                        <>
                          <Card item={eachAmmo} onCancel={removeAmmo} />
                        </>
                      ))}
                    </>
                  ) : (
                    <Message
                      content="No ammuniton added"
                      className={css.message}
                    />
                  )}
                </div>
              </div>
              <br />
              <div className={`${css.actions} actions`}>
                <Button
                  className={css.button}
                  type="submit"
                  disabled={!formIsValid || postingUser}
                >
                  {postingUser ? "Loading..." : "Submit"}
                </Button>
                <Button
                  className={css.button}
                  type="reset"
                  onClick={() => reset()}
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className={css["img-upload"]}>
              {uploaded || previousImage ? (
                <div className={css["img-container"]}>
                  <img
                    src={(uploaded || previousImage) as string | undefined}
                    alt={image?.name}
                  />
                  <Icon
                    className={css.edit}
                    name="cancel"
                    onClick={() => {
                      setUploaded(null);
                      setPreviousImage(null);
                      onImageChange(null);
                    }}
                  />
                </div>
              ) : (
                <label>
                  <input type="file" hidden onChange={onFileChange} />
                  <Icon name="cloud upload" />
                  <em>Upload picture</em>
                </label>
              )}
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
};

const EachTableRow = ({
  data: userData,
  onCheckedHandler,
  onEdit,
  onDelete,
  approvedState,
  refreshCheckedState,
}: eachTableRowPropsType<eachUploadedUserFileType>) => {
  const [checked, setChecked] = useState(approvedState);
  const [editingRow, setEditingRow] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedAmmos, setSelectedAmmos] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const devices = useSelector((state: selectorState) => state.devices.devices);
  const ranks = useSelector((state: selectorState) => state.ranks.ranks);
  const [rankOptions, setRankOptions] = useState<selectType[]>([]);
  const [devicesOptions, setDevicesOptions] = useState<selectType[]>();
  const [ammunitionOptions, setAmmunitionOptions] = useState(
    data.ammunition?.map(
      (eachAmmo) =>
        new SelectClass(eachAmmo?._id, eachAmmo?.name, eachAmmo?.name)
    )
  );
  const [accessories, setAccessories] = useState(
    data.accessories?.map(
      (accessory) =>
        new SelectClass(accessory?._id, accessory?.name, accessory?.name)
    )
  );

  const dispatch = useDispatch();

  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: email,
    isValid: emailIsValid,
    inputIsInValid: emailInputIsInValid,
    onChange: onEmailChange,
    onBlur: onEmailBlur,
    reset: resetEmail,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: address,
    isValid: addressIsValid,
    inputIsInValid: addressInputIsInValid,
    onChange: onAddressChange,
    onBlur: onAddressBlur,
    reset: resetAddress,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: phone,
    isValid: phoneIsValid,
    inputIsInValid: phoneInputIsInValid,
    onChange: onPhoneChange,
    onBlur: onPhoneBlur,
    reset: resetPhone,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: rank,
    isValid: rankIsValid,
    inputIsInValid: rankInputIsInValid,
    onChange: onRankChange,
    onBlur: onRankBlur,
    reset: resetRank,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: station,
    isValid: stationIsValid,
    inputIsInValid: stationInputIsInValid,
    onChange: onStationChange,
    onBlur: onStationBlur,
    reset: resetStation,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: gender,
    isValid: genderIsValid,
    inputIsInValid: genderInputIsInValid,
    onChange: onGenderChange,
    onBlur: onGenderBlur,
    reset: resetGender,
  } = useInput<string>((value) => value?.trim() !== "");

  const {
    value: device,
    inputIsInValid: deviceInputIsInValid,
    onBlur: onDeviceBlur,
    onChange: onDeviceChange,
    reset: resetDevice,
  } = useInput<string>((value) => true);

  const {
    value: ammo,
    onBlur: onAmmoBlur,
    onChange: onAmmoChange,
    reset: resetAmmo,
  } = useInput<string>((value) => true);

  const {
    value: accessory,
    onBlur: onAccessoryBlur,
    onChange: onAccessoryChange,
    reset: resetAccessory,
  } = useInput<string>((value) => true);

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [
      onNameBlur,
      onEmailBlur,
      onAddressBlur,
      onPhoneBlur,
      onRankBlur,
      onStationBlur,
      onGenderBlur,
    ],
    resetHandlers: [
      resetName,
      resetEmail,
      resetAddress,
      resetPhone,
      resetRank,
      resetStation,
      resetDevice,
      resetAmmo,
      resetAccessory,
      resetGender,
      () => setSelectedDevices([]),
      () => setSelectedAccessories([]),
      () => setSelectedAmmos([]),
    ],
    validateOptions: () =>
      nameIsValid &&
      emailIsValid &&
      addressIsValid &&
      phoneIsValid &&
      rankIsValid &&
      stationIsValid &&
      genderIsValid,
  });

  if (!devices) dispatch(getDeviceAction() as unknown as AnyAction);
  if (!ranks) dispatch(getRanksAction() as unknown as AnyAction);

  const addDevice: selectInputOnChangePropsType<string> = (e, { value }) =>
    setSelectedDevices((prev) => [...prev, value]);

  const removeDevice = (device: string) =>
    setSelectedDevices((prev) =>
      prev.filter((prevDevice) => prevDevice !== device)
    );

  const addAmmo: selectInputOnChangePropsType<string> = (e, { value }) =>
    setSelectedAmmos((prev) => [...prev, value]);

  const removeAmmo = (ammo: string) =>
    setSelectedAmmos((prev) => prev.filter((prevAmmo) => prevAmmo !== ammo));

  const addAccessories: selectInputOnChangePropsType<string> = (e, { value }) =>
    setSelectedAccessories((prev) => [...prev, value]);

  const removeAccessories = (accessory: string) =>
    setSelectedAccessories((prev) =>
      prev.filter((prevAccessories) => prevAccessories !== accessory)
    );

  const update = () => {
    if (!formIsValid) return executeBlurHandlers();

    const data = {
      id: userData?.id,
      name,
      email,
      phoneNumber: phone,
      address,
      rank,
      station,
      state: userData?.state,
      gender,
      devices: selectedDevices?.length > 0 ? selectedDevices?.join(",") : "",
      accessories:
        selectedAccessories?.length > 0 ? selectedAccessories?.join(",") : "",
      ammunition: selectedAmmos?.length > 0 ? selectedAmmos?.join(",") : "",
    };
    console.log("DATA", data);
    onEdit(data);
    setEditingRow(false);
  };

  const mapValidate = (item: string) => {
    if (item?.trim() !== "") {
      return item;
    }
    return false;
  };

  useEffect(() => {
    setChecked(approvedState);
  }, [approvedState, refreshCheckedState]);

  useEffect(() => {
    onNameChange(userData?.name);
    onAddressChange(userData?.address);
    onPhoneChange(userData?.phoneNumber?.toString());
    onEmailChange(userData?.email);
    onRankChange(userData?.rank);
    onStationChange(userData?.station);
    onGenderChange(userData?.gender);
    setSelectedDevices(
      userData?.devices?.split(",")?.map(mapValidate) as string[]
    );
    setSelectedAccessories(
      userData?.accessories?.split(",")?.map(mapValidate) as string[]
    );
    setSelectedAmmos(
      userData?.ammunition?.split(",")?.map(mapValidate) as string[]
    );
  }, [editingRow]);

  useEffect(() => {
    if (!devicesOptions || devicesOptions?.length < 1)
      setDevicesOptions(
        devices
          ?.filter((device) => device?.UserID === null)
          ?.map((device) => ({
            key: device?.IMEI_Number,
            value: device?.IMEI_Number,
            text: device?.IMEI_Number,
          }))
      );
  }, [devices]);

  useEffect(() => {
    if (!rankOptions || rankOptions?.length < 1)
      setRankOptions(
        ranks?.map((rank) => ({
          key: rank?.RankId,
          value: rank?.RankId,
          text: rank?.RankName,
        }))
      );
  }, [ranks]);

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
            placeholder="Email..."
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onEmailBlur}
            error={emailInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Input
            placeholder="Phone..."
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onBlur={onPhoneBlur}
            error={phoneInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Input
            placeholder="Gender..."
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            onBlur={onGenderBlur}
            error={genderInputIsInValid}
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
            placeholder="Rank..."
            value={rank}
            options={rankOptions}
            onChange={(e, { value }) => onRankChange(value)}
            onBlur={onRankBlur as any}
            error={rankInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Input
            placeholder="Address..."
            value={station}
            onChange={(e) => onStationChange(e.target.value)}
            onBlur={onStationBlur}
            error={stationInputIsInValid}
          />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Select
            label="Select a device"
            placeholder="Select device"
            options={devicesOptions as selectType[]}
            value={device}
            onChange={(e, { value }) => {
              addDevice(e, { value: value as string });
              onDeviceChange(value);
              console.log("Value", value);
            }}
            onBlur={onDeviceBlur as any}
            error={deviceInputIsInValid}
          />
          {selectedDevices?.length > 0 && (
            <div className={"row-select-item"}>
              {selectedDevices?.map((eachDevice, i) => (
                <>
                  <em key={i}>
                    {eachDevice}
                    <Icon
                      name="cancel"
                      onClick={() => removeDevice(eachDevice)}
                    />
                  </em>
                </>
              ))}
            </div>
          )}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Select
            label="Select an accessory"
            placeholder="Select accessory"
            options={accessories}
            value={accessory}
            onChange={(e, { value }) => {
              addAccessories(e, { value: value as string });
              onAccessoryChange(value as string);
            }}
            onBlur={onAccessoryBlur as any}
          />
          {selectedAccessories?.length > 0 && (
            <div className={"row-select-item"}>
              {selectedAccessories?.map((eachAccessory, i) => (
                <>
                  <em key={i}>
                    {eachAccessory}
                    <Icon
                      name="cancel"
                      onClick={() => removeAccessories(eachAccessory)}
                    />
                  </em>
                </>
              ))}
            </div>
          )}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Select
            label="Select an ammunition"
            placeholder="Select ammunition"
            options={ammunitionOptions}
            value={ammo}
            onChange={(e, { value }) => {
              addAmmo(e, { value: value as string });
              onAmmoChange(value);
            }}
            onBlur={onAmmoBlur as any}
          />
          {selectedAmmos?.length > 0 && (
            <div className={"row-select-item"}>
              {selectedAmmos?.map((eachAmmo, i) => (
                <>
                  <em key={i}>
                    {eachAmmo}
                    <Icon name="cancel" onClick={() => removeAmmo(eachAmmo)} />
                  </em>
                </>
              ))}
            </div>
          )}
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
      <Table.HeaderCell>{userData?.name}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.email}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.phoneNumber}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.gender}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.address}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.rank}</Table.HeaderCell>
      <Table.HeaderCell>{userData?.station}</Table.HeaderCell>
      <Table.HeaderCell>
        <div>
          {userData?.devices?.split(",")?.map((eachDevice) => (
            <>
              <em>{eachDevice}, </em>
            </>
          ))}
        </div>
      </Table.HeaderCell>
      <Table.HeaderCell>
        <div>
          {userData?.accessories?.split(",")?.map((eachAccessory) => (
            <>
              <em>{eachAccessory}, </em>
            </>
          ))}
        </div>
      </Table.HeaderCell>
      <Table.HeaderCell>
        <div>
          {userData?.ammunition?.split(",")?.map((eachAmmo) => (
            <>
              <em>{eachAmmo}, </em>
            </>
          ))}
        </div>
      </Table.HeaderCell>
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

export const UploadBulkUsers = () => {
  const [uploadedData, setUploadedData] = useState<uploadedUserFileType>([]);
  const [selectedUsers, setSelectedUsers] = useState<selectedUsers>({});
  const [approvedState, setApprovedState] = useState(false);
  const [refreshCheckedState, setRefreshCheckedState] = useState(false);
  const [noUploadedUsers, setNoUploadedUsers] = useState(false);
  const [errorLogs, setErrorLogs] = useState<postBulkUsersErrorType[]>([]);
  const [uploadedSuccessfuly, setUploadedSuccessfuly] = useState(false);
  const {
    sendRequest: postUsers,
    error: postUsersError,
    loading: postingUsers,
    data: postUsersData,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/users/bulk`,
      method: "POST",
      data: Object.entries(selectedUsers)?.map(([key, eachUser]) => ({
        ...eachUser,
        devices: eachUser?.devices?.split(","),
        accessories: eachUser?.accessories?.split(","),
        ammos: eachUser?.ammunition?.split(","),
      })),
    },
  });

  const {
    value: file,
    isValid: fileIsValid,
    inputIsInValid: fileInputIsInValid,
    onChange: onFileChange,
    onBlur: onFileBlur,
    reset: resetFIle,
  } = useInput<File>(
    (file) =>
      getExention(file?.name) === "xlsx" || getExention(file?.name) === "json"
  );

  const onSuccessUpload = () => {
    // setUploadedSuccessfuly((prev) => ({
    //   ...prev,
    //   success: true,
    //   uploading: false,
    // }));

    setUploadedSuccessfuly(true);

    setTimeout(() => {
      // setUploadedSuccessfuly((prev) => ({
      //   ...prev,
      //   success: false,
      //   uploading: false,
      // }));

      setUploadedSuccessfuly(false);
    }, 1000 * 10);
  };

  const onFileReaderSuccess = (data: any) => {
    setUploadedData(clearSimilarArrayObjects(data, "id"));
  };

  const onReadJSONSuccess = (data: any) => {
    setUploadedData(clearSimilarArrayObjects(data, "id"));
  };

  const onCheckedHandler = (
    data: eachUploadedUserFileType,
    checked: boolean
  ) => {
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

  const onNoUploadedUsers = () => {
    setNoUploadedUsers(true);

    setTimeout(() => setNoUploadedUsers(false), 1000 * 10);
  };

  const onUploadSuccess = ({ data }: { data: postBulkUsersReturnType }) => {
    const { uploadUsers, errorLogs } = data;
    const currentUsers: selectedUsers = {};
    uploadedData.forEach((eachUser) => {
      currentUsers[eachUser["id"]] = eachUser;
    });

    for (const key in selectedUsers) {
      delete currentUsers[key];
    }

    const currentUsersArray = Object.entries(currentUsers)?.map(
      ([key, value]) => value
    );

    setUploadedData(currentUsersArray);
    setErrorLogs(errorLogs);
    setSelectedUsers({});
    disApproveAll();
    if (Object?.keys(uploadUsers)?.length > 0) {
      onSuccessUpload();
    } else {
      onNoUploadedUsers();
    }
  };

  const onErrorUpload = () => setUploadedSuccessfuly(false);

  const uploadUsers = () => {
    const selectedArray = Object.entries(selectedUsers)?.map(
      ([key, value]) => ({
        ...value,
        devices: value?.devices?.split(","),
        accessories: value?.accessories?.split(","),
        ammunition: value?.ammunition?.split(","),
      })
    );

    if (selectedArray?.length < 1) {
      return;
    }
    postUsers(onUploadSuccess, onErrorUpload);
  };

  const selectAllUsers = () => {
    const addedDevices: selectedUsers = {};

    for (const data of uploadedData) {
      addedDevices[data["id"]] = data;
    }

    setSelectedUsers(addedDevices);
  };

  const approveAll = () => {
    selectAllUsers();
    setApprovedState(true);
  };

  const disApproveAll = () => {
    setSelectedUsers({});
    setApprovedState(false);
    setRefreshCheckedState((prev) => !prev);
  };

  const onEdit = (user: eachUploadedUserFileType) => {
    const allUsers = [...uploadedData];

    allUsers.forEach((eachUser, i, arr) => {
      if (eachUser["id"] === user["id"]) {
        arr[i] = user;
      }
    });

    setUploadedData(allUsers);
  };

  const onDelete = (user: eachUploadedUserFileType) => {
    setUploadedData((prevData) =>
      prevData?.filter((eachUser) => eachUser["id"] !== user["id"])
    );
  };

  const clearErrors = () => setErrorLogs([]);

  // console.log("UPLOADED DATA", uploadedData);

  return (
    <section className={css["bulk-upload"]}>
      <Main header="Upload users">
        <div className={css["upload-container"]}>
          <FileUpload
            label={"Upload excel/json files only"}
            onChange={(e: any) =>
              fileUploadValidator({
                e,
                onFileChange: onFileChange as any,
                onFileBlur: onFileBlur,
                onFileReaderSuccess,
                onReadJSONSuccess,
              })
            }
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
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Phone</Table.HeaderCell>
                  <Table.HeaderCell>Gender</Table.HeaderCell>
                  <Table.HeaderCell>Address</Table.HeaderCell>
                  <Table.HeaderCell>Rank</Table.HeaderCell>
                  <Table.HeaderCell>Station</Table.HeaderCell>
                  <Table.HeaderCell>Devices</Table.HeaderCell>
                  <Table.HeaderCell>Accessories</Table.HeaderCell>
                  <Table.HeaderCell>Ammunition</Table.HeaderCell>
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
                      onClick={uploadUsers}
                      disabled={
                        Object.keys(selectedUsers)?.length < 1
                          ? true
                          : false || postingUsers
                      }
                    >
                      <Icon name="cloud upload" />{" "}
                      {postingUsers ? "Loading..." : "Upload users"}
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
                <Message success content="Users uploaded successfully" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {postUsersError && (
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
                  content="There was an error uploading the users, please try again"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {noUploadedUsers && (
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
                <Message warning content="No users were uploaded" />
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
              <Table.HeaderCell collapsing>User name</Table.HeaderCell>
              <Table.HeaderCell>Error message</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {errorLogs?.map((error, i) => (
              <>
                <Table.Row key={i}>
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
    </section>
  );
};
