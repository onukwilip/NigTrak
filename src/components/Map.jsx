import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useCallback, useRef } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const Map = ({ newCenter, zoom, children, reference, circles = [] }) => {
  const map = useRef();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "",
  });

  const onLoad = useCallback((mapObj) => {
    const bounds = new window.google.maps.LatLngBounds(newCenter);
    mapObj.fitBounds(bounds);

    map.current = mapObj;
    if (reference) reference.current = mapObj;
  }, []);

  if (!isLoaded) {
    return <>Loading...</>;
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={newCenter}
        zoom={zoom}
        onLoad={onLoad}
      >
        <Marker position={newCenter} />
        {circles.map((eachCircle, i) => {
          return (
            <Circle
              center={eachCircle.location}
              radius={eachCircle.radius}
              key={i}
            />
          );
        })}
        {children}
      </GoogleMap>
    </>
  );
};

export default React.memo(Map);
