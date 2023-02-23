import { useForm, useInput } from "use-manage-form";
import css from "../styles/login/Login.module.scss";
import { Button, Form, Icon } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { SelectClass } from "../utils";

const Login = ({ toogleForce }) => {
  const navigate = useNavigate();
  const forceOptions = [
    new SelectClass(4, "", "Select your force"),
    new SelectClass(0, "Army", "Army"),
    new SelectClass(1, "Air force", "Air force"),
    new SelectClass(2, "Navy", "Navy"),
    new SelectClass(3, "Police", "Police"),
  ];
  const {
    value: id,
    isValid: idIsValid,
    inputIsInValid: idInputIsInValid,
    onChange: onIdChange,
    onBlur: onIdBlur,
    reset: resetId,
  } = useInput((/**@type String */ value) => value?.trim() !== "");

  const {
    value: force,
    isValid: forceIsValid,
    inputIsInValid: forceInputIsInValid,
    onChange: onForceChange,
    onBlur: onForceBlur,
    reset: resetForce,
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
    blurHandlers: [onPasswordBlur, onIdBlur, onForceBlur],
    resetHandlers: [resetId, resetPassword, resetForce],
    validateOptions: () => passwordIsValid && idIsValid && forceIsValid,
  });

  const submitHandler = () => {
    if (!formIsValid) {
      return executeBlurHandlers();
    }
    // SUBMIT FORM
    navigate("/home", { replace: true });
    reset();
  };

  return (
    <>
      <div className={css.login}>
        <em>Tracking systems nationwide</em>
        <Form className={css.form} onSubmit={submitHandler}>
          <Form.Select
            placeholder="Select your force"
            className={css.select}
            options={forceOptions}
            value={force}
            onChange={(e, { value }) => {
              onForceChange(value);
              toogleForce(value);
            }}
            onBlur={onForceBlur}
            error={
              forceInputIsInValid && {
                content: "Please select a force",
                position: "above",
              }
            }
          />
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

export default Login;
