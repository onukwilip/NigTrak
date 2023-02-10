import React, { useState, useEffect } from "react";
import css from "../styles/userManagement/UserManagement.module.scss";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ProfileContainer from "../components/ProfileContainer";
import mRank from "../assets/img/major-rank.png";
import mgRank from "../assets/img/mg-rank.png";
import cRank from "../assets/img/coloniel-rank.png";
import lcRank from "../assets/img/lc-rank.png";
import oRank from "../assets/img/officer-rank.png";
import sRank from "../assets/img/sergent-rank.png";
import Map from "../components/Map";
import { Button, Input } from "semantic-ui-react";
import data from "../data.json";

export const ranks = {
  General: mRank,
  "Major General": mgRank,
  Coloniel: cRank,
  "Leutenant Coloniel": lcRank,
  Officer: oRank,
  Sergent: sRank,
};

export const UserCard = ({ user, onViewMore = () => {}, index }) => {
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
      className={css["user-card"]}
      ref={ref}
    >
      <div className={css["img-container"]}>
        <img src={user?.image} alt="" />
      </div>
      <div className={css.details}>
        <em>{user?.name}</em>
        <em>
          {" "}
          <img src={ranks[user["rank"]]} className="rank" /> {user?.rank}
        </em>
      </div>
      <div className={css.actions}>
        <Button
          onClick={() => {
            onViewMore(user);
          }}
        >
          View more
        </Button>
      </div>
    </motion.div>
  );
};

export const UsersList = ({ users, onViewMore, className }) => {
  return (
    <div className={`${css["users-list"]} ${className}`}>
      {users.map((user, i) => (
        <UserCard
          user={user}
          onViewMore={onViewMore}
          key={user._id}
          ranks={ranks}
          index={i}
        />
      ))}
    </div>
  );
};

export const AllUsers = ({ position }) => {
  const [userProfile, setUserProfile] = useState(data.users[0]);
  const [militaints, setMilitaints] = useState(data.users);

  const onSearch = (/**@type String */ value) => {
    const filtered = data.users.filter(
      (eachUser) =>
        eachUser.name.toLowerCase().includes(value.toLowerCase()) ||
        eachUser.rank.toLowerCase().includes(value.toLowerCase())
    );

    setMilitaints(filtered);
  };

  return (
    <section className={css.users}>
      <div className={css.left}>
        <div className={css["user-details"]}>
          <div className={css.picture}>
            <ProfileContainer
              profilePic={userProfile["image"]}
              name={userProfile["name"]}
              email={userProfile["email"]}
              phone={userProfile["phoneNumber"]}
            />
          </div>
          <div className={css.details}>
            <ul>
              <li>
                <em>Address</em>: <em>{userProfile["address"]}</em>
              </li>
              <li>
                <em>Joined</em>: <em>{userProfile["joined"]}</em>
              </li>{" "}
              <li>
                <em>Location</em>:{" "}
                <em>
                  {userProfile["location"]["lat"]}{" "}
                  {userProfile["location"]["lng"]}
                </em>
              </li>{" "}
              <li>
                <em> Rank</em>:{" "}
                <em>
                  {" "}
                  <img src={ranks[userProfile["rank"]]} className="rank" />{" "}
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
                <em>
                  {userProfile["devices"].map(
                    (eachDevice) => `${eachDevice}, `
                  )}
                </em>
              </li>
            </ul>
          </div>
        </div>
        <div className={css["map-container"]}>
          {userProfile["location"] && (
            <Map newCenter={userProfile["location"]} zoom={10} />
          )}
        </div>
      </div>
      <div className={css.right}>
        <div className={css["search-container"]}>
          <Input
            className={css.input}
            label="Search"
            placeholder="Search militants"
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </div>
        <UsersList
          users={militaints}
          onViewMore={setUserProfile}
          className={css.users}
        />
      </div>
    </section>
  );
};

export const CreateUser = () => {
  return <div>Create User</div>;
};

export const EditUser = () => {
  return <div>Edit User</div>;
};
