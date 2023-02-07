import React from "react";
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

const LandingPage = () => {
  return (
    <section className={`${css["landing-page"]}`}>
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
        <Login />
      </div>
    </section>
  );
};

export default LandingPage;
