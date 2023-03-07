import React, { useEffect, useRef, useState } from "react";
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

export const ImgUpload = ({
  onChange,
  value,
  label,
  className,
  triggerReset,
  initialImage,
  removeInitialImage,
}) => {
  const fileRef = useRef();
  const [uploaded, setUploaded] = useState("");

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setUploaded(URL.createObjectURL(file));
    onChange(e);
  };

  useEffect(() => {
    setUploaded(null);
  }, [triggerReset]);

  return (
    <div className={`${css["img-upload"]} ${className}`}>
      {uploaded || initialImage ? (
        <div className={css["img-container"]}>
          <img
            src={uploaded || initialImage}
            alt={fileRef.current?.files[0]?.filename}
          />
          <Icon
            className={css.edit}
            name="cancel"
            onClick={() => {
              onChange(null);
              setUploaded(null);
              removeInitialImage(null);
              onChange(null);
            }}
          />
        </div>
      ) : (
        <label>
          <input
            type="file"
            hidden
            ref={fileRef}
            value={value?.filename}
            onChange={onFileChange}
          />
          <Icon name="cloud upload" />
          <em>{label ? label : "Upload image"}</em>
        </label>
      )}
    </div>
  );
};
