import { useAnimation, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Input, Button } from "semantic-ui-react";
import css from "../styles/ranks/Ranks.module.scss";
import data from "../data.json";
import Map from "./Map";
import { Marker, InfoWindow } from "@react-google-maps/api";
import { ranks as rankImgs } from "./UsersManagement";
import { type } from "@testing-library/user-event/dist/type";

export const RankCard = ({ rank, onView = () => {}, index }) => {
  const [ref, inView] = useInView();
  const control = useAnimation();
  const variants = {
    far: { opacity: 0, x: "-100px" },
    current: { opacity: 1, x: "0px" },
  };
  const mappedMembers = rank?.members?.map((member) => ({
    ...member,
    rank: rank.rank,
  }));

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
      className={css["rank-card"]}
      ref={ref}
    >
      <div className={css["img-container"]}>
        <img src={rankImgs[rank.rank]} alt="" />
      </div>
      <div className={css.details}>
        <em>
          <b>ID: </b>
          {rank?._id}
        </em>
        <em>
          <b>Rank:</b> {rank?.rank}
        </em>
        <em>
          <b>Total members:</b> {rank?.members?.length}
        </em>
      </div>
      <div className={css.actions}>
        <Button
          onClick={() => {
            onView(mappedMembers);
          }}
        >
          View on map
        </Button>
      </div>
    </motion.div>
  );
};

const mapCenter = { lat: 9.082, lng: 8.6753 };

const Ranks = () => {
  const [ranks, setRanks] = useState(/**@type data.ranks */ data.ranks);
  const [rankMembers, setRankMembers] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const map = useRef();
  const onSearch = (value) => {
    const filtered = data.ranks.filter((rank) =>
      rank.rank.toLowerCase().includes(value.toLowerCase())
    );

    setRanks(filtered);
  };
  const onViewClick = (/**@type data.ranks.members */ members) => {
    map.current?.setZoom(6.3);
    setRankMembers(members);
  };

  return (
    <section className={css.ranks}>
      <div className={css.left}>
        <div className={css["filter-container"]}>
          <Input
            placeholder="Search ranks..."
            label="Search"
            onChange={({ target: { value } }) => onSearch(value)}
          />
        </div>
        <div className={css["ranks-list-container"]}>
          <h3>Ranks</h3>
          <div className={css["ranks-list"]}>
            {ranks.map((eachStation, i) => (
              <RankCard rank={eachStation} key={i} onView={onViewClick} />
            ))}
          </div>
        </div>
      </div>
      <div className={css.right}>
        {ranks && (
          <Map
            newCenter={mapCenter}
            zoom={5}
            reference={map}
            showMarker={false}
          >
            {rankMembers.map((/**@type data.ranks.members */ member) => (
              <Marker
                icon={{
                  url: rankImgs[member.rank],
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                position={member?.location}
                onClick={() => {
                  setShowInfo({ ...member });
                }}
              />
            ))}
            {showInfo && (
              <InfoWindow
                position={showInfo.location}
                onCloseClick={() => {
                  setShowInfo(null);
                }}
              >
                <div className={css.info}>
                  <div className={css["img-container"]}>
                    <img
                      src="https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
                      alt="Militant"
                    />
                  </div>
                  <div className={css.details}>
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
        )}
      </div>
    </section>
  );
};

export default Ranks;
