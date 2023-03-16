declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";
// declare module "use-manage-form";
declare module "use-manage-form" {
  type inputReturnValue<T> = {
    value: T;
    isValid: boolean;
    inputIsInValid: boolean;
    onChange: Function;
    onBlur: Function;
    reset: Function;
  };
  type inputValidator<T> = (value: T) => boolean;

  type formReturnValue = {
    executeBlurHandlers: Function;
    formIsValid: boolean;
    reset: Function;
  };

  type formParams = {
    blurHandlers?: Function[];
    resetHandlers?: Function[];
    validateOptions?: () => boolean;
  };

  const useInput: <T>(validator: inputValidator<T>) => inputReturnValue<T>;

  const useForm: (a: formParams) => formReturnValue;

  export { useInput, useForm };
}
// declare module "use-ajax-request";
declare module "use-ajax-request" {
  const useAjaxHook: <T>(a: {
    instance: Function;
    options: {
      url: string;
      method: string;
      data?: any;
      [key: string]: any;
    };
  }) => {
    sendRequest: (
      onSuccess?: ({ data: T }) => void,
      onError?: ({ response: { data: any } }) => void
    ) => any;
    error: any;
    loading: boolean;
    data: T;
  };
  export = useAjaxHook;
}
