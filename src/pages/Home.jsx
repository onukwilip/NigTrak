import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Icon, Input, Message } from "semantic-ui-react";
import Map from "../components/Map";
import css from "../styles/home/Home.module.scss";
import { CSSTransition } from "react-transition-group";
import { Navigate, Route, Routes } from "react-router-dom";
import Menu from "../components/Menu";
import Profile from "../components/Profile";
import {
  AllUsers,
  CreateEditUser,
  ranks,
  UploadBulkUsers,
} from "../components/UsersManagement";
import {
  AllDevices,
  CreateDevice,
  EditDevice,
  UploadBulkDevices,
} from "../components/DevicesManagement";
import { Analytics } from "../components/Analytics";
import { CreateEditRank, Ranks } from "../components/Ranks";
import { CreateEditStation, Stations } from "../components/Stations";
import data from "../data.json";
import { InfoWindow, Marker } from "@react-google-maps/api";
import armyLogo from "../assets/img/nig-army.png";
import airforceLogo from "../assets/img/nig-airforce-2.png";
import navyLogo from "../assets/img/nig-navy.png";
import policeLogo from "../assets/img/nig-police.png";
import { useDispatch, useSelector } from "react-redux";
import { sockeDeviceActions } from "../store/store";
import useAjaxHook from "use-ajax-request";
import axios from "axios";
import { manageSocketDevicesConnection, mapCenter } from "../utils";
import { getDeviceAction } from "../store/devicesReducer";

const ws = new WebSocket(process.env.REACT_APP_WS_DOMAIN);

const MapTab = ({ position }) => {
  const [showInfo, setShowInfo] = useState(/**@type data.users[0] */ null);
  const socketDevices = useSelector((state) => state?.socketDevices);
  const dispatch = useDispatch();
  const {
    sendRequest: getDevices,
    data: devices,
    error: devicesError,
    loading: loadingDevices,
  } = useAjaxHook({
    instance: axios,
    options: {
      url: `${process.env.REACT_APP_API_DOMAIN}/api/device`,
      method: "GET",
    },
  });

  manageSocketDevicesConnection({ ws, dispatch });

  useEffect(() => {
    getDevices();
  }, []);

  useEffect(() => {
    console.log("Socket devices", socketDevices);
  }, [socketDevices]);

  return (
    <div className={css["map-tab"]}>
      {position ? (
        <Map newCenter={mapCenter} zoom={6.5} showMarker={false}>
          {Object.entries(socketDevices).map(([key, socketDevice]) => {
            const device = devices?.find(
              (eachDevice) => eachDevice["IMEI_Number"] === key
            );
            if (device)
              return (
                <Marker
                  position={{
                    lat: parseFloat(socketDevice?.lat),
                    lng: parseFloat(socketDevice?.lng),
                  }}
                  // icon={
                  //   window.google && {
                  //     url: ranks[user.rank],
                  //     scaledSize: new window.google.maps.Size(35, 35),
                  //   }
                  // }
                  onClick={() =>
                    setShowInfo({
                      ...device,
                      lat: parseFloat(socketDevice?.lat),
                      lng: parseFloat(socketDevice?.lng),
                    })
                  }
                />
              );

            return <></>;
          })}
          {showInfo && (
            <InfoWindow
              position={{
                lat: parseFloat(showInfo?.lat),
                lng: parseFloat(showInfo?.lng),
              }}
              onCloseClick={() => setShowInfo(null)}
            >
              <div className="info">
                <div className={"img-container"}>
                  <img
                    src="https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
                    alt="Militant"
                  />
                </div>
                <div className={"details"}>
                  <em>
                    <b>IMEI number:</b> {showInfo?.["IMEI_Number"]}
                  </em>
                  <em>
                    <b>Holder Id:</b> {showInfo?.UserId || "Nil"}
                  </em>
                  <em>
                    <b>Holder name:</b> {showInfo?.Name || "Nil"}
                  </em>
                  <em>
                    <b>Holder station:</b> {showInfo?.Station || "Nil"}
                  </em>
                  <em>
                    <b>Holder rank:</b> {showInfo?.Rank || "Nil"}
                  </em>
                  {/* <em>
                    <b>State:</b> {showInfo?.state}
                  </em> */}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      ) : (
        <Message
          className="my-message"
          content="Please enable your location"
          warning
        />
      )}
    </div>
  );
};

const Home = () => {
  const [position, setPosition] = useState(null);
  const [showProfile, setShowProfile] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const force = sessionStorage.getItem("force");
  const profileRef = useRef();
  const dispatch = useDispatch();
  dispatch(getDeviceAction());

  const onSuccess = (pos) => {
    const crd = pos.coords;

    console.log("POSITION", crd);
    setPosition({ lat: crd.latitude, lng: crd.longitude });
  };

  const chooseForce = (force) => {
    if (force === "Army") {
      return armyLogo;
    } else if (force === "Air force") {
      return airforceLogo;
    } else if (force === "Navy") {
      return navyLogo;
    } else if (force === "Police") {
      return policeLogo;
    } else {
      return "";
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onSuccess);
    return () => {};
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 450) {
      setShowProfile(false);
    } else {
      setShowProfile(true);
    }
  }, [window.innerWidth]);

  return (
    <section className={css.home}>
      <div className={css["force-img"]}>
        <img src={chooseForce(force)} alt="" />
        <em>Nigerian {force}</em>
      </div>
      <CSSTransition
        in={showMenu}
        appear={true}
        timeout={100}
        classNames={{
          enter: css["menu-animate-enter"],
          enterActive: css["menu-animate-enter-active"],
          enterDone: css["menu-animate-enter-done"],
          exit: css["menu-animate-exit"],
          exitActive: css["menu-animate-exit-active"],
          exitDone: css["menu-animate-exit-done"],
          appear: css["menu-animate-appear"],
          appearActive: css["menu-animate-appear-active"],
          appearDone: css["menu-animate-appear-done"],
        }}
      >
        <Menu />
      </CSSTransition>
      <div className={css.tab}>
        <Routes>
          <Route path="/" element={<MapTab position={position} />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/users/" element={<AllUsers position={position} />} />
          <Route path="users/add" element={<CreateEditUser />} />
          <Route path="users/edit/:id" element={<CreateEditUser />} />
          <Route
            path="users/edit"
            element={<Navigate to={"/home/users/add"} />}
          />
          <Route path="users/bulk" element={<UploadBulkUsers />} />
          <Route path="/devices" element={<AllDevices />} />
          <Route path="devices/add" element={<CreateDevice />} />
          <Route
            path="devices/edit"
            element={<Navigate to={"/home/devices/add"} />}
          />
          <Route path="devices/edit/:id" element={<CreateDevice />} />
          <Route path="devices/bulk" element={<UploadBulkDevices />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/ranks/add" element={<CreateEditRank />} />
          <Route
            path="/ranks/edit"
            element={<Navigate to={"/home/ranks/add"} />}
          />
          <Route path="/ranks/edit/:id" element={<CreateEditRank />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/stations/add" element={<CreateEditStation />} />
          <Route
            path="/stations/edit"
            element={<Navigate to={"/home/stations/add"} />}
          />
          <Route path="/stations/edit/:id" element={<CreateEditStation />} />
        </Routes>
      </div>
      <div className={css["profile-parent"]}>
        <div className={css["toogle-container"]}>
          <div
            onClick={() => {
              setShowProfile((profile) => !profile);
            }}
            className={css["toogle-profile"]}
          >
            <Icon name={showProfile ? "arrow right" : "arrow left"} />
          </div>
          <div
            onClick={() => {
              setShowMenu((menu) => !menu);
            }}
            className={css["toogle-profile"]}
          >
            <i className={showMenu ? "fas fa-xmark" : "fas fa-bars"} />
          </div>
        </div>
        <CSSTransition
          in={showProfile}
          timeout={100}
          appear={true}
          classNames={{
            enter: css["profile-animate-enter"],
            enterActive: css["profile-animate-enter-active"],
            enterDone: css["profile-animate-enter-done"],
            exit: css["profile-animate-exit"],
            exitActive: css["profile-animate-exit-active"],
            exitDone: css["profile-animate-exit-done"],
            appear: css["profile-animate-appear"],
            appearActive: css["profile-animate-appear-active"],
            appearDone: css["profile-animate-appear-done"],
          }}
          ref={profileRef}
        >
          <Profile />
        </CSSTransition>
      </div>
    </section>
  );
};

export default Home;
