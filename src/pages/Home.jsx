import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Icon, Input } from "semantic-ui-react";
import Map from "../components/Map";
import css from "../styles/home/Home.module.scss";
import { CSSTransition } from "react-transition-group";
import logo from "../assets/img/logo.png";
import { Link, Route, Routes, useParams } from "react-router-dom";
import data from "../data.json";
import { Doughnut, Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";
import ProfileContainer from "../components/ProfileContainer";
import mRank from "../assets/img/major-rank.png";
import mgRank from "../assets/img/mg-rank.png";
import cRank from "../assets/img/coloniel-rank.png";
import lcRank from "../assets/img/lc-rank.png";
import oRank from "../assets/img/officer-rank.png";
import sRank from "../assets/img/sergent-rank.png";
import walkieTalkieTrans from "../assets/img/walkie-talkie-trans.png";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Profile = () => {
  return (
    <div className={css.profile}>
      <div className={css["profile-container"]}>
        <div className={css.bg}></div>
        <div className={css["details-container"]}>
          <div className={css.details}>
            <div className={css["img-container"]}>
              <img
                src="https://dailypost.ng/wp-content/uploads/2015/09/download-86.jpg"
                alt=""
              />
            </div>
            <em>Onukwili Prince C.</em>
            <a href="mailto:onukwilip@gmail.com">
              <Icon name="mail" /> onukwilip@gmail.com
            </a>
            <a href="tel:09071589571">
              <Icon name="phone" /> 09071589571
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

class MenuClass {
  constructor(name, tab, icon) {
    this.name = name;
    this.tab = tab;
    this.icon = icon;
  }
}

const menus = [
  new MenuClass("Map", "/home/", "fa-solid fa-map-location-dot"),
  new MenuClass("Analytics", "/home/analytics", "fa-solid fa-chart-bar"),
  new MenuClass(
    "Soldiers",
    "/home/soldiers",
    "fa-solid fa-person-military-rifle"
  ),
  new MenuClass("Devices", "/home/devices", "fa-solid fa-walkie-talkie"),
  new MenuClass(
    "Stations",
    "/home/stations",
    "fa-solid fa-building-circle-exclamation"
  ),
  new MenuClass("Ranks", "/home/ranks", "fa-solid fa-ranking-star"),
  new MenuClass("Log out", "/", "fa-solid fa-right-from-bracket"),
];

const MapTab = ({ position }) => {
  return (
    <div className={css["map-tab"]}>
      {position && <Map newCenter={position} zoom={10}></Map>}
    </div>
  );
};

const Card = ({ icon, className, header, value, delay }) => {
  const control = useAnimation();
  const [ref, inView] = useInView();
  const variant = {
    initial: { opacity: 0, x: -100 },
    scaled: { opacity: 1, x: 0 },
  };

  useEffect(() => {
    if (inView) {
      control.start("scaled");
    } else {
      control.start("initial");
    }
  }, [control, inView]);

  return (
    <motion.div
      variants={variant}
      initial="initial"
      animate={control}
      className={`${css.card} ${className}`}
      ref={ref}
      transition={{ delay: delay / 30 }}
    >
      <div className={css.body}>
        <i className={`${icon} ${css.icon}`} />
        <div className={css.desc}>
          <em>{header}</em>
          <em>{value}</em>
        </div>
      </div>

      <i className={`fas fa-arrow-right-long ${css.next}`} />
    </motion.div>
  );
};

const Analytics = () => {
  const [chartData, setChartData] = useState({
    labels: data.analytics?.map((eachData) => eachData.label),
    datasets: [
      {
        label: "Last walkie talkie distributions",
        fill: true,
        lineTension: 0.4,
        backgroundColor: "rgba(144, 238, 144, 0.5)",
        borderWidth: 4,
        borderColor: "darkgreen",
        marginBottom: "20px",
        color: "white",
        data: data.analytics.map((eachData) => eachData.data),
      },
    ],
  });
  const [doughnutData, setDoughnutData] = useState({
    labels: data.doughnut?.map((eachData) => eachData.label),
    datasets: [
      {
        label: "Devices",
        backgroundColor: data.doughnut?.map((eachData) => eachData.color),
        borderWidth: 0,
        color: "white",
        data: data.doughnut.map((eachData) => eachData.data),
      },
    ],
  });

  const lineChartOptions = {
    title: {
      display: true,
      text: "Device distributions for 2022",
      fontSize: "30px",
    },
    legend: {
      display: true,
      position: "right",
    },
  };

  const doughnutChartOptions = {
    title: {
      display: true,
      text: "Device distributions for 2022",
      fontSize: "30px",
    },
    legend: {
      display: true,
      position: "right",
    },
  };

  return (
    <section className={css.analytics}>
      <div className={css.dashboard}>
        <Line
          data={chartData}
          width="auto"
          height="70"
          options={lineChartOptions}
        />
      </div>
      <div className={css["mobile-dashboard"]}>
        <Line
          data={chartData}
          width="auto"
          height="200"
          options={lineChartOptions}
        />
      </div>
      <div className={css.below}>
        <div className={css.container}>
          <div className={css["card-container"]}>
            <Card
              icon="fas fa-walkie-talkie"
              header="Total devices distributed"
              value={10000}
              delay={0}
            />
            <Card
              icon="fas fa-walkie-talkie"
              header="Total devices available"
              value={15000}
              delay={1}
            />
            <Card
              icon="fas fa-walkie-talkie"
              header="Total devices remaining"
              value={5000}
              delay={2}
            />
            <Card
              icon="fas fa-person-military-rifle"
              header="Total soldiers available"
              value={30000}
              delay={3}
            />
            <Card
              icon="fas fa-person-military-rifle"
              header="Total soldiers with device"
              value={5000}
              delay={4}
            />
            <Card
              icon="fa-solid fa-building-circle-exclamation"
              header="Total stations"
              value={200}
              delay={5}
            />
          </div>
          <div className={css["doughnut-chart"]}>
            <Doughnut
              data={doughnutData}
              height="40vh"
              options={doughnutChartOptions}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const ranks = {
  General: mRank,
  "Major General": mgRank,
  Coloniel: cRank,
  "Leutenant Coloniel": lcRank,
  Officer: oRank,
  Sergent: sRank,
};

const UserCard = ({ user, onViewMore = () => {}, index }) => {
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

const DeviceCard = ({ device, onViewMore = () => {}, index }) => {
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

const UsersList = ({ users, onViewMore, className }) => {
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

const DevicesList = ({ devices, onViewMore, className }) => {
  return (
    <div className={`${css["users-list"]} ${className}`}>
      {devices.map((device, i) => (
        <DeviceCard
          device={device}
          onViewMore={onViewMore}
          key={device._id}
          ranks={ranks}
          index={i}
        />
      ))}
    </div>
  );
};

const Soldiers = ({ position }) => {
  const [userProfile, setUserProfile] = useState(data.users[0]);
  const [militaints, setMilitaints] = useState(data.users);

  const onSearch = (/**@type String */ value) => {
    const filtered = data.users.filter(
      (eachUser) =>
        eachUser.name.toLowerCase().includes(value.toLowerCase()) ||
        eachUser.rank.toLowerCase().includes(value.toLowerCase())
    );

    setMilitaints(filtered);
  };

  return (
    <section className={css.soldiers}>
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
            <ul>
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
                <em>
                  {userProfile["devices"].map(
                    (eachDevice) => `${eachDevice}, `
                  )}
                </em>
              </li>
            </ul>
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

const Devices = () => {
  const [device, setDevice] = useState(data.devices[0]);
  const [devices, setDevices] = useState(data.devices);

  const onSearch = (/**@type String */ value) => {
    const filtered = data.devices.filter(
      (eachDevice) =>
        eachDevice._id.toLowerCase().includes(value.toLowerCase()) ||
        eachDevice.deviceHolderName.toLowerCase().includes(value.toLowerCase())
    );

    setDevices(filtered);
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

const Stations = () => {
  return <div>Stations</div>;
};

const Ranks = () => {
  return <div>Ranks</div>;
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
        <div className={css.menu}>
          <div className={css["logo-container"]}>
            <img src={logo} />
            <em>NigTrak</em>
          </div>
          <ul>
            {menus.map((eachMenu, i) => (
              <Link to={eachMenu?.tab || "/home/"} key={i}>
                <li>
                  <i className={eachMenu.icon} />
                  <em>{eachMenu.name}</em>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </CSSTransition>
      <div className={css.tab}>
        <Routes>
          <Route path="/" element={<MapTab position={position} />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/soldiers" element={<Soldiers position={position} />} />
          <Route path="/devices" element={<Devices />} />
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
