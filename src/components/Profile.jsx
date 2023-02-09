import React from "react";
import { Icon } from "semantic-ui-react";
import css from "../styles/home/Home.module.scss";

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

export default Profile;
