import { useFormikContext } from "formik";
import AppButton from "./AppButton";

function SubmitButton({ title, ...otherProps }) {
  const { handleSubmit } = useFormikContext();
  return <AppButton title={title} onPress={handleSubmit} {...otherProps} />;
}

export default SubmitButton;
