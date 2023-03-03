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
    <div>
      <DotsLoader {...loaderProps} />
    </div>
  );
};

export default CustomLoader;
