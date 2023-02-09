import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Icon, Input } from "semantic-ui-react";
import Map from "../components/Map";
import css from "../styles/home/Home.module.scss";
import { CSSTransition } from "react-transition-group";
import { Route, Routes } from "react-router-dom";
import Menu from "../components/Menu";
import Profile from "../components/Profile";
import { AllUsers } from "../components/UsersManagement";
import { AllDevices } from "../components/DevicesManagement";
import { Analytics } from "../components/Analytics";
import Ranks from "../components/Ranks";
import { Stations } from "../components/Stations";

const MapTab = ({ position }) => {
  return (
    <div className={css["map-tab"]}>
      {position && <Map newCenter={position} zoom={10}></Map>}
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
          <Route path="/users" element={<AllUsers position={position} />} />
          <Route path="/devices" element={<AllDevices />} />
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
