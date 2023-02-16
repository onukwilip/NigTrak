import React from "react";
import { DotsLoader } from "react-loaders-kit";

const CustomLoader = () => {
  const loaderProps = {
    loading: true,
    size: 100,
    duration: 1,
    color: "darkgreen",
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DotsLoader {...loaderProps} />
    </div>
  );
};

export default CustomLoader;
