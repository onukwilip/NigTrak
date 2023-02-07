import React, { useCallback, useRef } from "react";
import { Button, Divider, Form, Icon } from "semantic-ui-react";
import { useForm, useInput } from "use-manage-form";
import css from "../styles/landing/Landing.module.scss";
import militaryBg from "../assets/img/military-bg.jpg";
import flagOnUniform from "../assets/img/flag-on-uniform.png";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const Login = () => {
  const {
    value: id,
    isValid: idIsValid,
    inputIsInValid: idInputIsInValid,
    onChange: onIdChange,
    onBlur: onIdBlur,
    reset: resetId,
  } = useInput((/**@type String */ value) => value?.trim() !== "");

  const {
    value: password,
    isValid: passwordIsValid,
    inputIsInValid: passwordInputIsInValid,
    onChange: onPasswordChange,
    onBlur: onPasswordBlur,
    reset: resetPassword,
  } = useInput((/**@type String */ value) => value?.trim() !== "");

  const { executeBlurHandlers, formIsValid, reset } = useForm({
    blurHandlers: [onPasswordBlur, onIdBlur],
    resetHandlers: [resetId, resetPassword],
    validateOptions: () => passwordIsValid && idIsValid,
  });

  const submitHandler = () => {
    if (!formIsValid) {
      return executeBlurHandlers();
    }
    // SUBMIT FORM
    reset();
  };

  return (
    <>
      <div className={css.login}>
        <em>Tracking systems nationwide</em>
        <Form className={css.form} onSubmit={submitHandler}>
          <Form.Input
            icon="users"
            iconPosition="left"
            placeholder="Enter your ID..."
            className={css.input}
            value={id}
            onChange={(e) => onIdChange(e.target.value)}
            onBlur={onIdBlur}
            error={
              idInputIsInValid && {
                content: "Input must not be empty",
                position: "above",
              }
            }
          />
          <Form.Input
            icon="key"
            iconPosition="left"
            type="password"
            placeholder="Enter your passeord..."
            className={css.input}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={onPasswordBlur}
            error={
              passwordInputIsInValid && {
                content: "Input must not be empty",
                position: "above",
              }
            }
          />
          <div className={css.actions}>
            <Button animated>
              <Button.Content visible>Login</Button.Content>
              <Button.Content hidden>
                <Icon name="arrow right" />
              </Button.Content>
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

const Billboard = () => {
  return (
    <section className={css.billboard}>
      <div className={css.main}>
        <div className={css["logo-container"]}>
          <div className={css.logo}>
            <em>NigTrak</em>
            <em>Nigeria defence tracking system</em>
          </div>
        </div>
        <Login />
      </div>
      <div className={css.bg}></div>
    </section>
  );
};

const Banner = ({
  className,
  header1,
  header2,
  content,
  showIcon,
  icon,
  bg,
  styles = {},
}) => {
  return (
    <section className={css.banner}>
      <div
        className={css.bg}
        style={{ backgroundImage: `url(${bg})`, ...styles }}
      ></div>
      <div className={css.main}>
        <div className={css["content-container"]}>
          <h1>
            {header1}
            <br />
            <span>{header2}</span>
          </h1>
          <p>{content}</p>
        </div>
        {showIcon && (
          <div className={css["icon-container"]}>
            <div>
              <Icon name={icon} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const mapContainerStyle = {
  width: "100vw",
  height: "120vh",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "",
  });

  const map = useRef();

  const onLoad = useCallback((mapObj) => {
    const bounds = new window.google.maps.LatLngBounds(center);
    mapObj.fitBounds(bounds);

    map.current = mapObj;
  }, []);

  if (!isLoaded) {
    return <>Loading...</>;
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
      ></GoogleMap>
    </>
  );
};

const Landing = () => {
  return (
    <>
      <div className={css.landing}>
        <Billboard />
        <Banner
          header1="Protect Your Motherland,"
          header2="Your Family, Your Beliefs."
          content="MES CUML DIA SED INENIASINGE DOLOR IPSUM COMMETE IPSUM.DOLOR IPSUM COMMETE IPSUM COMNETUS MES DOLOR."
          showIcon={true}
          icon={"like"}
          bg={militaryBg}
          styles={{ opacity: 0.9 }}
        />
        <Banner
          header1="The Few."
          header2="The Proud"
          content="MES CUML DIA SED INENIASINGE DOLOR IPSUM COMMETE IPSUM.DOLOR IPSUM COMMETE IPSUM COMNETUS MES DOLOR."
          bg={flagOnUniform}
        />
        <Map />
      </div>
      <div className={css.footer}>
        <h1>&copy; Copyright {new Date().getFullYear()} @ Momas ltd Nigeria</h1>
      </div>
    </>
  );
};

export default Landing;
