import { useAnimation, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Input, Select, Button } from "semantic-ui-react";
import css from "../styles/stations/Stations.module.scss";
import data from "../data.json";
import Map from "./Map";
import { Marker } from "@react-google-maps/api";

export const StationCard = ({ station, onView = () => {}, index }) => {
  const [ref, inView] = useInView();
  const control = useAnimation();
  const variants = {
    far: { opacity: 0, x: "-100px" },
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
      className={css["station-card"]}
      ref={ref}
    >
      <div className={css.details}>
        <em>
          <b>ID: </b>
          {station?._id?.substring(0, 5)}...
          {station?._id?.substring(station?._id?.length, 21)}
        </em>
        <em>
          <b>Name:</b> {station?.name}
        </em>
        <em>
          <b>State:</b> {station?.state}
        </em>
        <em>
          <b>Address:</b> {station?.address}
        </em>
        <em>
          <b>Date added:</b> {station?.dateAdded}
        </em>
      </div>
      <div className={css.actions}>
        <Button
          onClick={() => {
            onView(station?.location);
          }}
        >
          View on map
        </Button>
      </div>
    </motion.div>
  );
};

const mapCenter = { lat: 9.082, lng: 8.6753 };

export const Stations = () => {
  const [stations, setStations] = useState(
    /**@type data.stations */ data.stations
  );
  const [currentState, setCurrentState] = useState("");
  const [circle, setCircle] = useState({});
  const map = useRef();
  const states = [
    {
      key: 0,
      value: "",
      text: "All",
    },
    ...data.stations.map((eachStation) => ({
      key: eachStation._id,
      value: eachStation.state,
      text: eachStation.state,
    })),
  ];
  const onStateFilter = (e, { value }) => {
    setCurrentState(value);
    const filtered = data.stations.filter((station) =>
      station.state.toLowerCase().includes(value.toLowerCase())
    );
    setStations(filtered);
  };

  const onSearch = (value) => {
    const filteredState = data.stations.filter((station) =>
      station.state.toLowerCase().includes(currentState.toLowerCase())
    );

    const filtered = filteredState.filter((station) =>
      station.name.toLowerCase().includes(value.toLowerCase())
    );

    setStations(filtered);
  };

  const onViewClick = (position) => {
    map.current?.panTo(position);
    map.current?.setZoom(10);
    setCircle({ location: position, radius: 15000 });
  };

  return (
    <section className={css.stations}>
      <div className={css.left}>
        <div className={css["filter-container"]}>
          <Select
            placeholder="Select state"
            options={states}
            onChange={onStateFilter}
          />
          <Input
            placeholder="Search stations..."
            label="Search"
            onChange={({ target: { value } }) => onSearch(value)}
          />
        </div>
        <div className={css["stations-list-container"]}>
          <h3>Stations</h3>
          <div className={css["stations-list"]}>
            {stations.map((eachStation, i) => (
              <StationCard station={eachStation} key={i} onView={onViewClick} />
            ))}
          </div>
        </div>
      </div>
      <div className={css.right}>
        {stations && (
          <Map
            newCenter={mapCenter}
            zoom={5}
            reference={map}
            circles={[circle]}
          >
            {stations.map((station) => (
              <Marker position={station.location} />
            ))}
          </Map>
        )}
      </div>
    </section>
  );
};
