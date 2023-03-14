import React from "react";
import { Icon } from "semantic-ui-react";
import css from "../styles/profileContainer/ProfileContainer.module.scss";
import dummy from "../assets/img/dummy_profile_pic.png";
import { profileContainerPropsType } from "src/types/types";

const ProfileContainer = ({
  profilePic,
  name,
  phone,
  email,
  className,
}: profileContainerPropsType) => {
  return (
    <div className={`${css["profile-container"]} ${className}`}>
      <div className={css.bg}></div>
      <div className={css["details-container"]}>
        <div className={css.details}>
          <div className={css["img-container"]}>
            <img src={profilePic || dummy} alt="Profile" />
          </div>
          <em>{name || "Nil"}</em>
          <a href={`mailto:${email}`}>
            <Icon name="mail" /> {email || "Nil"}
          </a>
          <a href={`tel:${phone}`}>
            <Icon name="phone" /> {phone || "Nil"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileContainer;
