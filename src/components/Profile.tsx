import React, { useState } from "react";
import { Icon } from "semantic-ui-react";
import css from "../styles/home/Home.module.scss";
import data from "../data.json";
import { ranks } from "./UsersManagement";
import { Link } from "react-router-dom";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(data.users[0]);

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
      <br />
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
            {userProfile["location"]["lat"]} {userProfile["location"]["lng"]}
          </em>
        </li>{" "}
        <li>
          <em> Rank</em>:{" "}
          <em>
            {" "}
            <img
              src={ranks[userProfile["rank"] as "General"]}
              className="rank"
              alt="rank"
            />{" "}
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
    </div>
  );
};

export default Profile;
