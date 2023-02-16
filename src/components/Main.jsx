import React from "react";
import css from "../styles/main/Main.module.scss";

const Main = ({ children, header, className }) => {
  return (
    <>
      <div className={`${css["section-main"]}`}>
        <div className={css.head}>
          <h3>{header}</h3>
        </div>
        <hr className={css.divider} />
        <div className={css["body"]}>{children}</div>
      </div>
    </>
  );
};

export default Main;
