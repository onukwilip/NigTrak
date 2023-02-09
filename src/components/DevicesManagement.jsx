import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Map from "../components/Map";
import { Button, Input } from "semantic-ui-react";
import data from "../data.json";
import css from "../styles/devices/Devices.module.scss";
import { motion, useAnimation } from "framer-motion";
import walkieTalkieTrans from "../assets/img/walkie-talkie-trans.png";

export const DeviceCard = ({ device, onViewMore = () => {}, index }) => {
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

export const DevicesList = ({ devices, onViewMore, className }) => {
  return (
    <div className={`${css["devices-list"]} ${className}`}>
      {devices.map((device, i) => (
        <DeviceCard
          device={device}
          onViewMore={onViewMore}
          key={device._id}
          index={i}
        />
      ))}
    </div>
  );
};

export const AllDevices = () => {
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
