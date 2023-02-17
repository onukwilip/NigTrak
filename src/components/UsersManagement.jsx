import React, { useState, useEffect, useRef } from "react";
import css from "../styles/userManagement/UserManagement.module.scss";
import { useInView } from "react-intersection-observer";
import ProfileContainer from "../components/ProfileContainer";
import mRank from "../assets/img/major-rank.png";
import mgRank from "../assets/img/mg-rank.png";
import cRank from "../assets/img/coloniel-rank.png";
import lcRank from "../assets/img/lc-rank.png";
import oRank from "../assets/img/officer-rank.png";
import sRank from "../assets/img/sergent-rank.png";
import Map from "../components/Map";
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
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { clearSimilarArrayObjects, SelectClass } from "../utils";
import Main from "./Main";

export const ranks = {
  General: mRank,
  "Major General": mgRank,
  Coloniel: cRank,
  "Leutenant Coloniel": lcRank,
  Officer: oRank,
  Sergent: sRank,
};

const Card = ({ item, onCancel, src }) => {
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

export const UserCard = ({ user, onViewMore = () => {}, index }) => {
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
      className={css["user-card"]}
      ref={ref}
    >
      <div className={css["img-container"]}>
        <img src={user?.image} alt="" />
      </div>
      <div className={css.details}>
        <em>{user?.name}</em>
        <em>
          {" "}
          <img src={ranks[user["rank"]]} className="rank" /> {user?.rank}
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

export const UsersList = ({ users, onViewMore, className }) => {
  return (
    <div className={`${css["users-list"]} ${className}`}>
      {users.map((user, i) => (
        <UserCard
          user={user}
          onViewMore={onViewMore}
          key={user._id}
          ranks={ranks}
          index={i}
        />
      ))}
    </div>
  );
};

export const AllUsers = ({ position }) => {
  const [userProfile, setUserProfile] = useState(data.users[0]);
  const [militaints, setMilitaints] = useState(data.users);
  const navigate = useNavigate();

  const editUser = () => {
    navigate(`/home/users/edit/${userProfile?._id}`);
  };

  const onSearch = (/**@type String */ value) => {
    const filtered = data.users.filter(
      (eachUser) =>
        eachUser.name.toLowerCase().includes(value.toLowerCase()) ||
        eachUser.rank.toLowerCase().includes(value.toLowerCase())
    );

    setMilitaints(filtered);
  };

  return (
    <section className={css.users}>
      <div className={css.left}>
        <div className={css["user-details"]}>
          <div className={css.picture}>
            <ProfileContainer
              profilePic={userProfile["image"]}
              name={userProfile["name"]}
              email={userProfile["email"]}
              phone={userProfile["phoneNumber"]}
            />
          </div>
          <div className={css.details}>
            <ul className={css["list"]}>
              <li>
                <em>Address</em>: <em>{userProfile["address"]}</em>
              </li>
              <li>
                <em>Joined</em>: <em>{userProfile["joined"]}</em>
              </li>{" "}
              <li>
                <em>Location</em>:{" "}
                <em>
                  {userProfile["location"]["lat"]}{" "}
                  {userProfile["location"]["lng"]}
                </em>
              </li>{" "}
              <li>
                <em> Rank</em>:{" "}
                <em>
                  {" "}
                  <img src={ranks[userProfile["rank"]]} className="rank" />{" "}
                  {userProfile["rank"]}
                </em>
              </li>
              <li>
                <em>State</em>: <em>{userProfile["state"]}</em>
              </li>
              <li>
                <em>Station</em>: <em>{userProfile["station"]}</em>
              </li>
              <li>
                <em>Devices</em>:{" "}
                <ul className={css["mini-list"]}>
                  {userProfile["devices"].map((eachDevice, i) => (
                    <li key={i}>
                      <Link to="/home/devices/edit">{`${eachDevice}, `}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <em>Accessories</em>:{" "}
                <ul className={css["mini-list"]}>
                  {["Helmet", "Drone"].map((eachAccessory, i) => (
                    <li key={i}>
                      <span>{`${eachAccessory}, `}</span>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <em>Ammunition</em>:{" "}
                <ul className={css["mini-list"]}>
                  {["Pistol", "Rifle", "AK 47"].map((eachAmmo, i) => (
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
        <div className={css["map-container"]}>
          {userProfile["location"] && (
            <Map newCenter={userProfile["location"]} zoom={10} />
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
        <UsersList
          users={militaints}
          onViewMore={setUserProfile}
          className={css.users}
        />
      </div>
    </section>
  );
};

export const CreateUser = () => {
  const [uploaded, setUploaded] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedAmmos, setSelectedAmmos] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const fileRef = useRef();
  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: email,
    isValid: emailIsValid,
    inputIsInValid: emailInputIsInValid,
    onChange: onEmailChange,
    onBlur: onEmailBlur,
    reset: resetEmail,
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
    value: phone,
    isValid: phoneIsValid,
    inputIsInValid: phoneInputIsInValid,
    onChange: onPhoneChange,
    onBlur: onPhoneBlur,
    reset: resetPhone,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: rank,
    isValid: rankIsValid,
    inputIsInValid: rankInputIsInValid,
    onChange: onRankChange,
    onBlur: onRankBlur,
    reset: resetRank,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: station,
    isValid: stationIsValid,
    inputIsInValid: stationInputIsInValid,
    onChange: onStationChange,
    onBlur: onStationBlur,
    reset: resetStation,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: device,
    inputIsInValid: deviceInputIsInValid,
    onBlur: onDeviceBlur,
    onChange: onDeviceChange,
    reset: resetDevice,
  } = useInput((value) => true);

  const {
    value: ammo,
    onBlur: onAmmoBlur,
    onChange: onAmmoChange,
    reset: resetAmmo,
  } = useInput((value) => true);

  const {
    value: accessory,
    onBlur: onAccessoryBlur,
    onChange: onAccessoryChange,
    reset: resetAccessory,
  } = useInput((value) => true);

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

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setUploaded(URL.createObjectURL(file));
  };

  const addDevice = (e, { value }) =>
    setSelectedDevices((prev) => [...prev, value]);

  const removeDevice = (device) =>
    setSelectedDevices((prev) =>
      prev.filter((prevDevice) => prevDevice !== device)
    );

  const addAmmo = (e, { value }) =>
    setSelectedAmmos((prev) => [...prev, value]);

  const removeAmmo = (ammo) =>
    setSelectedAmmos((prev) => prev.filter((prevAmmo) => prevAmmo !== ammo));

  const addAccessories = (e, { value }) =>
    setSelectedAccessories((prev) => [...prev, value]);

  const removeAccessories = (accessory) =>
    setSelectedAccessories((prev) =>
      prev.filter((prevAccessories) => prevAccessories !== accessory)
    );

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
    });
    reset();
  };

  const ranks = [
    {
      key: 0,
      value: "General",
      text: "General",
    },
    {
      key: 1,
      value: "Major General",
      text: "Major General",
    },
    {
      key: 2,
      value: "Coloniel",
      text: "Coloniel",
    },
    {
      key: 3,
      value: "Leutenant Coloniel",
      text: "Leuenant Coloniel",
    },
    {
      key: 4,
      value: "Sergent",
      text: "Sergent",
    },
    {
      key: 5,
      value: "Officer",
      text: "Officer",
    },
  ];

  const stations = [
    {
      key: 0,
      value: data.stations[0]?.name,
      text: data.stations[0]?.name,
    },
    {
      key: 1,
      value: data.stations[1]?.name,
      text: data.stations[1]?.name,
    },
    {
      key: 2,
      value: data.stations[2]?.name,
      text: data.stations[2]?.name,
    },
    {
      key: 3,
      value: data.stations[5]?.name,
      text: data.stations[5]?.name,
    },
    {
      key: 4,
      value: data.stations[3]?.name,
      text: data.stations[3]?.name,
    },
    {
      key: 5,
      value: data.stations[4]?.name,
      text: data.stations[4]?.name,
    },
  ];

  const devices = data.devices.map((device) => ({
    key: device._id,
    value: device,
    text: device._id,
  }));

  const ammunitions = [
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
  ];

  const accessories = [
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
  ];

  return (
    <section className={css["create-user"]}>
      <div className={css.main}>
        <div className={css.head}>
          <em>Create new user</em>
        </div>
        <Divider className={css.divider} />
        <div className={css.body}>
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
                  options={ranks}
                  value={rank}
                  onChange={(e, { value }) => onRankChange(value)}
                  onBlur={onRankBlur}
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
                  onBlur={onStationBlur}
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
                  options={devices}
                  value={device}
                  onChange={(e, { value }) => {
                    addDevice(e, { value: value?._id });
                    onDeviceChange(value?._id);
                    console.log("Value", value?._id);
                  }}
                  onBlur={onDeviceBlur}
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
                    addAccessories(e, { value });
                    onAccessoryChange(value);
                  }}
                  onBlur={onAccessoryBlur}
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
                  options={ammunitions}
                  value={ammo}
                  onChange={(e, { value }) => {
                    addAmmo(e, { value });
                    onAmmoChange(value);
                  }}
                  onBlur={onAmmoBlur}
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
              <div className={css.actions}>
                <Button className={css.button} type="submit">
                  Submit
                </Button>
                <Button className={css.button} type="reset">
                  Reset
                </Button>
              </div>
            </div>
            <div className={css["img-upload"]}>
              {uploaded ? (
                <div className={css["img-container"]}>
                  <img
                    src={uploaded}
                    alt={fileRef.current?.files[0]?.filename}
                  />
                  <Icon
                    className={css.edit}
                    name="cancel"
                    onClick={() => {
                      setUploaded(null);
                    }}
                  />
                </div>
              ) : (
                <label>
                  <input
                    type="file"
                    hidden
                    ref={fileRef}
                    onChange={onFileChange}
                  />
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

export const EditUser = () => {
  const [uploaded, setUploaded] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedAmmos, setSelectedAmmos] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const fileRef = useRef();
  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: email,
    isValid: emailIsValid,
    inputIsInValid: emailInputIsInValid,
    onChange: onEmailChange,
    onBlur: onEmailBlur,
    reset: resetEmail,
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
    value: phone,
    isValid: phoneIsValid,
    inputIsInValid: phoneInputIsInValid,
    onChange: onPhoneChange,
    onBlur: onPhoneBlur,
    reset: resetPhone,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: rank,
    isValid: rankIsValid,
    inputIsInValid: rankInputIsInValid,
    onChange: onRankChange,
    onBlur: onRankBlur,
    reset: resetRank,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: station,
    isValid: stationIsValid,
    inputIsInValid: stationInputIsInValid,
    onChange: onStationChange,
    onBlur: onStationBlur,
    reset: resetStation,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: device,
    inputIsInValid: deviceInputIsInValid,
    onBlur: onDeviceBlur,
    onChange: onDeviceChange,
    reset: resetDevice,
  } = useInput((value) => true);

  const {
    value: ammo,
    onBlur: onAmmoBlur,
    onChange: onAmmoChange,
    reset: resetAmmo,
  } = useInput((value) => true);

  const {
    value: accessory,
    onBlur: onAccessoryBlur,
    onChange: onAccessoryChange,
    reset: resetAccessory,
  } = useInput((value) => true);

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

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setUploaded(URL.createObjectURL(file));
  };

  const addDevice = (e, { value }) =>
    setSelectedDevices((prev) => [...prev, value]);

  const removeDevice = (device) =>
    setSelectedDevices((prev) =>
      prev.filter((prevDevice) => prevDevice !== device)
    );

  const addAmmo = (e, { value }) =>
    setSelectedAmmos((prev) => [...prev, value]);

  const removeAmmo = (ammo) =>
    setSelectedAmmos((prev) => prev.filter((prevAmmo) => prevAmmo !== ammo));

  const addAccessories = (e, { value }) =>
    setSelectedAccessories((prev) => [...prev, value]);

  const removeAccessories = (accessory) =>
    setSelectedAccessories((prev) =>
      prev.filter((prevAccessories) => prevAccessories !== accessory)
    );

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
    });
    reset();
  };

  const ranks = [
    {
      key: 0,
      value: "General",
      text: "General",
    },
    {
      key: 1,
      value: "Major General",
      text: "Major General",
    },
    {
      key: 2,
      value: "Coloniel",
      text: "Coloniel",
    },
    {
      key: 3,
      value: "Leutenant Coloniel",
      text: "Leuenant Coloniel",
    },
    {
      key: 4,
      value: "Sergent",
      text: "Sergent",
    },
    {
      key: 5,
      value: "Officer",
      text: "Officer",
    },
  ];

  const stations = [
    {
      key: 0,
      value: data.stations[0]?.name,
      text: data.stations[0]?.name,
    },
    {
      key: 1,
      value: data.stations[1]?.name,
      text: data.stations[1]?.name,
    },
    {
      key: 2,
      value: data.stations[2]?.name,
      text: data.stations[2]?.name,
    },
    {
      key: 3,
      value: data.stations[5]?.name,
      text: data.stations[5]?.name,
    },
    {
      key: 4,
      value: data.stations[3]?.name,
      text: data.stations[3]?.name,
    },
    {
      key: 5,
      value: data.stations[4]?.name,
      text: data.stations[4]?.name,
    },
  ];

  const devices = data.devices.map((device) => ({
    key: device._id,
    value: device,
    text: device._id,
  }));

  const ammunitions = [
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
  ];

  const accessories = [
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
  ];

  return (
    <section className={css["create-user"]}>
      <div className={css.main}>
        <div className={css.head}>
          <em>Edit user</em>
        </div>
        <Divider className={css.divider} />
        <div className={css.body}>
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
                  options={ranks}
                  value={rank}
                  onChange={(e, { value }) => onRankChange(value)}
                  onBlur={onRankBlur}
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
                  onBlur={onStationBlur}
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
                  options={devices}
                  value={device}
                  onChange={(e, { value }) => {
                    addDevice(e, { value: value?._id });
                    onDeviceChange(value?._id);
                    console.log("Value", value?._id);
                  }}
                  onBlur={onDeviceBlur}
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
                    addAccessories(e, { value });
                    onAccessoryChange(value);
                  }}
                  onBlur={onAccessoryBlur}
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
                  options={ammunitions}
                  value={ammo}
                  onChange={(e, { value }) => {
                    addAmmo(e, { value });
                    onAmmoChange(value);
                  }}
                  onBlur={onAmmoBlur}
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
              <div className={css.actions}>
                <Button className={css.button} type="submit">
                  Submit
                </Button>
                <Button className={css.button} type="reset">
                  Reset
                </Button>
              </div>
            </div>
            <div className={css["img-upload"]}>
              {uploaded ? (
                <div className={css["img-container"]}>
                  <img
                    src={uploaded}
                    alt={fileRef.current?.files[0]?.filename}
                  />
                  <Icon
                    className={css.edit}
                    name="cancel"
                    onClick={() => {
                      setUploaded(null);
                    }}
                  />
                </div>
              ) : (
                <label>
                  <input
                    type="file"
                    hidden
                    ref={fileRef}
                    onChange={onFileChange}
                  />
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
  data: userData /**@type data.users[0] */,
  onCheckedHandler,
  onEdit,
  onDelete,
  approvedState,
  refreshCheckedState,
}) => {
  const [checked, setChecked] = useState(approvedState);
  const [editingRow, setEditingRow] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedAmmos, setSelectedAmmos] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  const {
    value: name,
    isValid: nameIsValid,
    inputIsInValid: nameInputIsInValid,
    onChange: onNameChange,
    onBlur: onNameBlur,
    reset: resetName,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: email,
    isValid: emailIsValid,
    inputIsInValid: emailInputIsInValid,
    onChange: onEmailChange,
    onBlur: onEmailBlur,
    reset: resetEmail,
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
    value: phone,
    isValid: phoneIsValid,
    inputIsInValid: phoneInputIsInValid,
    onChange: onPhoneChange,
    onBlur: onPhoneBlur,
    reset: resetPhone,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: rank,
    isValid: rankIsValid,
    inputIsInValid: rankInputIsInValid,
    onChange: onRankChange,
    onBlur: onRankBlur,
    reset: resetRank,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: station,
    isValid: stationIsValid,
    inputIsInValid: stationInputIsInValid,
    onChange: onStationChange,
    onBlur: onStationBlur,
    reset: resetStation,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: gender,
    isValid: genderIsValid,
    inputIsInValid: genderInputIsInValid,
    onChange: onGenderChange,
    onBlur: onGenderBlur,
    reset: resetGender,
  } = useInput((value) => value?.trim() !== "");

  const {
    value: device,
    inputIsInValid: deviceInputIsInValid,
    onBlur: onDeviceBlur,
    onChange: onDeviceChange,
    reset: resetDevice,
  } = useInput((value) => true);

  const {
    value: ammo,
    onBlur: onAmmoBlur,
    onChange: onAmmoChange,
    reset: resetAmmo,
  } = useInput((value) => true);

  const {
    value: accessory,
    onBlur: onAccessoryBlur,
    onChange: onAccessoryChange,
    reset: resetAccessory,
  } = useInput((value) => true);

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

  const addDevice = (e, { value }) =>
    setSelectedDevices((prev) => [...prev, value]);

  const removeDevice = (device) =>
    setSelectedDevices((prev) =>
      prev.filter((prevDevice) => prevDevice !== device)
    );

  const addAmmo = (e, { value }) =>
    setSelectedAmmos((prev) => [...prev, value]);

  const removeAmmo = (ammo) =>
    setSelectedAmmos((prev) => prev.filter((prevAmmo) => prevAmmo !== ammo));

  const addAccessories = (e, { value }) =>
    setSelectedAccessories((prev) => [...prev, value]);

  const removeAccessories = (accessory) =>
    setSelectedAccessories((prev) =>
      prev.filter((prevAccessories) => prevAccessories !== accessory)
    );

  const devices = data.devices?.map(
    (device) => new SelectClass(device?._id, device?._id, device?._id)
  );

  const accessories = data.accessories?.map(
    (accessory) =>
      new SelectClass(accessory?._id, accessory?.name, accessory?.name)
  );

  const ammunitionOptions = data.ammunition?.map(
    (eachAmmo) => new SelectClass(eachAmmo?._id, eachAmmo?.name, eachAmmo?.name)
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

  const mapValidate = (item) => {
    if (item?.trim() !== "") {
      return item;
    }
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
    // setSelectedDevices(userData?.devices?.split(",")?.map((device) => device));
    setSelectedDevices(userData?.devices?.split(",")?.map(mapValidate));
    setSelectedAccessories(userData?.accessories?.split(",")?.map(mapValidate));
    setSelectedAmmos(userData?.ammunition?.split(",")?.map(mapValidate));
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
          <Input
            placeholder="Rank..."
            value={rank}
            onChange={(e) => onRankChange(e.target.value)}
            onBlur={onRankBlur}
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
            options={devices}
            value={device}
            onChange={(e, { value }) => {
              addDevice(e, { value: value });
              onDeviceChange(value);
              console.log("Value", value);
            }}
            onBlur={onDeviceBlur}
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
              addAccessories(e, { value: value });
              onAccessoryChange(value);
            }}
            onBlur={onAccessoryBlur}
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
              addAmmo(e, { value: value });
              onAmmoChange(value);
            }}
            onBlur={onAmmoBlur}
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

  const uploadUsers = () => {
    setSubmitState((prev) => ({ ...prev, uploading: true }));

    const selectedArray = Object.entries(selectedUsers)?.map(
      ([key, value]) => ({
        ...value,
        devices: value?.devices?.split(","),
        accessories: value?.accessories?.split(","),
        ammunition: value?.ammunition?.split(","),
      })
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

  const selectAllUsers = () => {
    const addedDevices = {};

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

  const onEdit = (device) => {
    const allUsers = [...uploadedData];

    allUsers.forEach((eachDevice, i, arr) => {
      if (eachDevice["id"] === device["id"]) {
        arr[i] = device;
      }
    });

    setUploadedData(allUsers);
  };

  const onDelete = (device) => {
    setUploadedData((prevData) =>
      prevData?.filter((eachDevice) => eachDevice["id"] !== device["id"])
    );
  };

  // console.log("UPLOADED DATA", uploadedData);

  return (
    <section className={css["bulk-upload"]}>
      <Main header="Upload users">
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
                        Object.keys(selectedUsers)?.length < 1 ? true : false
                      }
                      // disabled={submitState.uploading}
                    >
                      <Icon name="cloud upload" /> Upload users
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
                <Message success content="Devices uploaded successfully" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Main>
    </section>
  );
};
