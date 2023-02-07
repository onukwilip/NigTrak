import { useForm, useInput } from "use-manage-form";
import css from "../styles/login/Login.module.scss";
import { Button, Form, Icon } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
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
    navigate("/home", { replace: true });
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

export default Login;
