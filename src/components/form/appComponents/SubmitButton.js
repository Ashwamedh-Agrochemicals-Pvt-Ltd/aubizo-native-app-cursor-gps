import { useFormikContext } from "formik";
import AppButton from "./AppButton";

function SubmitButton({ title, ...otherProps }) {
  const { handleSubmit, validateForm } = useFormikContext();

  const onPressSubmit = async () => {

    const formErrors = await validateForm();
    if (formErrors?.username) {
      global.usernameRef?.current?.focus();
      return;
    }
    if (formErrors?.password) {
      global.passwordRef?.current?.focus();
      return;
    }

    handleSubmit();
  };

  return <AppButton title={title} onPress={onPressSubmit} {...otherProps} />;
}

export default SubmitButton;
