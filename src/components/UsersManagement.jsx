import React, { useState, useEffect, useRef } from "react";
import css from "../styles/userManagement/UserManagement.module.scss";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ProfileContainer from "../components/ProfileContainer";
import mRank from "../assets/img/major-rank.png";
import mgRank from "../assets/img/mg-rank.png";
import cRank from "../assets/img/coloniel-rank.png";
import lcRank from "../assets/img/lc-rank.png";
import oRank from "../assets/img/officer-rank.png";
import sRank from "../assets/img/sergent-rank.png";
import Map from "../components/Map";
import { Button, Divider, Form, Icon, Input, Message } from "semantic-ui-react";
import data from "../data.json";
import walkieTalkieTrans from "../assets/img/walkie-talkie-trans.png";
import { useInput, useForm } from "use-manage-form";
import { Link, useNavigate } from "react-router-dom";

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
