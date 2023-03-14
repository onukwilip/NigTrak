import React from "react";
import css from "../styles/main/Main.module.scss";
import { mainPropsType } from "src/types/types";

const Main = ({ children, header, className }: mainPropsType) => {
  return (
    <>
      <div className={`${css["section-main"]} ${className}`}>
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
