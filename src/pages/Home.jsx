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
  CreateUser,
  EditUser,
  ranks,
} from "../components/UsersManagement";
import {
  AllDevices,
  CreateDevice,
  EditDevice,
  UploadBulkDevices,
} from "../components/DevicesManagement";
import { Analytics } from "../components/Analytics";
import Ranks from "../components/Ranks";
import { Stations } from "../components/Stations";
import data from "../data.json";
import { InfoWindow, Marker } from "@react-google-maps/api";

const MapTab = ({ position }) => {
  const [showInfo, setShowInfo] = useState(/**@type data.users[0] */ null);
  return (
    <div className={css["map-tab"]}>
      {position ? (
        <Map newCenter={position} zoom={6.5}>
          {data.users.map((user) => (
            <Marker
              position={user.location}
              icon={
                window.google && {
                  url: ranks[user.rank],
                  scaledSize: new window.google.maps.Size(35, 35),
                }
              }
              onClick={() => setShowInfo(user)}
            />
          ))}
          {showInfo && (
            <InfoWindow
              position={showInfo.location}
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
      ) : (
        <Message content="Please enable your location" warning />
      )}
    </div>
  );
};

const Home = () => {
  const [position, setPosition] = useState(null);
  const [showProfile, setShowProfile] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const profileRef = useRef();
  const onSuccess = (pos) => {
    const crd = pos.coords;

    console.log("POSITION", crd);
    setPosition({ lat: crd.latitude, lng: crd.longitude });
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
          <Route path="users/add" element={<CreateUser />} />
          <Route path="users/edit" element={<EditUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="/devices" element={<AllDevices />} />
          <Route path="devices/add" element={<CreateDevice />} />
          <Route
            path="devices/edit"
            element={<Navigate to={"/home/devices/add"} />}
          />
          <Route path="devices/edit/:id" element={<CreateDevice />} />
          <Route path="devices/bulk" element={<UploadBulkDevices />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/stations" element={<Stations />} />
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
