import React from "react";
import { Icon } from "semantic-ui-react";
import css from "../styles/profileContainer/ProfileContainer.module.scss";

const ProfileContainer = ({ profilePic, name, phone, email, className }) => {
  return (
    <div className={`${css["profile-container"]} ${className}`}>
      <div className={css.bg}></div>
      <div className={css["details-container"]}>
        <div className={css.details}>
          <div className={css["img-container"]}>
            <img src={profilePic} alt="Profile" />
          </div>
          <em>{name}</em>
          <a href={`mailto:${email}`}>
            <Icon name="mail" /> {email}
          </a>
          <a href={`tel:${phone}`}>
            <Icon name="phone" /> {phone}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileContainer;
