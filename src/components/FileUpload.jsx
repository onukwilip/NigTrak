import React from "react";
import { Icon } from "semantic-ui-react";
import css from "../styles/fileUpload/FileUpload.module.scss";

export const FileUpload = ({ onChange, value, label, className }) => {
  return (
    <div className={`${css["file-upload"]} ${className}`}>
      <label>
        <input type="file" hidden value={value} onChange={onChange} />
        <Icon name="cloud upload" />
        <em style={{ textAlign: "center" }}>{label ? label : "Upload file"}</em>
      </label>
    </div>
  );
};
