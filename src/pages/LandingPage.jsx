import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import map from "../assets/img/map.png";
import walkieTalkie from "../assets/img/walkie-talkie.png";
import buhariOnUniform from "../assets/img/buhari-on-camo.png";
import paperMap from "../assets/img/paper-map.png";
import googleEarth from "../assets/img/google-earth.png";
import css from "../styles/landingPage/LandingPage.module.scss";
import Login from "../components/Login";
import armyLogo from "../assets/img/nig-army.png";
import airforceLogo from "../assets/img/nig-airforce-2.png";
import navyLogo from "../assets/img/nig-navy.png";
import policeLogo from "../assets/img/nig-police.png";

const LandingPage = () => {
  const [force, setForce] = useState("");

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
  return (
    <section className={`${css["landing-page"]}`}>
      {force?.trim() !== "" && (
        <img src={chooseForce(force)} alt="" className={css["force-img"]} />
      )}
      <Swiper
        effect="fade"
        modules={[EffectFade, Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
      >
        <SwiperSlide>
          <img src={map} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={walkieTalkie} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={paperMap} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={googleEarth} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={buhariOnUniform} />
        </SwiperSlide>
      </Swiper>
      <div className={css.overlay}></div>
      <div className={css.main}>
        <div className={css["logo-container"]}>
          <div className={css.logo}>
            <em>NigTrak</em>
            <em>Nigeria defence tracking system</em>
          </div>
        </div>
        <Login toogleForce={setForce} />
      </div>
    </section>
  );
};

export default LandingPage;
