import React from "react";
import { Link } from "react-router-dom";
import css from "../styles/home/Home.module.scss";
import logo from "../assets/img/logo.png";

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
  new MenuClass("Users", "/home/users", "fa-solid fa-person-military-rifle"),
  new MenuClass("Devices", "/home/devices", "fa-solid fa-walkie-talkie"),
  new MenuClass(
    "Stations",
    "/home/stations",
    "fa-solid fa-building-circle-exclamation"
  ),
  new MenuClass("Ranks", "/home/ranks", "fa-solid fa-ranking-star"),
  new MenuClass("Log out", "/", "fa-solid fa-right-from-bracket"),
];

const Menu = () => {
  return (
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
  );
};

export default Menu;
