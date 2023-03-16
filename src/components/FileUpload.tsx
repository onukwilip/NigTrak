import React, { LegacyRef, useEffect, useRef, useState } from "react";
import { Icon } from "semantic-ui-react";
import css from "../styles/fileUpload/FileUpload.module.scss";
import { fileUploadPropsType, imgUploadPropsType } from "src/types/types";

export const FileUpload = ({
  onChange,
  value,
  label,
  className,
}: fileUploadPropsType) => {
  return (
    <div className={`${css["file-upload"]} ${className}`}>
      <label>
        <input type="file" hidden value={value as string} onChange={onChange} />
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
}: imgUploadPropsType) => {
  const fileRef = useRef<HTMLInputElement>()!;
  const [uploaded, setUploaded] = useState<string | null>("");

  const onFileChange = (e: any) => {
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
            src={uploaded || (initialImage as string)}
            alt={fileRef?.current?.files?.[0]?.name}
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
            ref={fileRef as LegacyRef<HTMLInputElement>}
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
