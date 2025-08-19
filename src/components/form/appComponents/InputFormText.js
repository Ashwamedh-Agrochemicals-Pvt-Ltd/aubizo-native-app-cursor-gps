import { View } from "react-native";
import AppErrorMessage from "./AppErrorMeassage";
import FormInputText from "./FormInputText";
import { useField, useFormikContext } from "formik";

function InputFormField({ name, value, externalValue, ...otherProps }) {
  const { handleChange, setFieldTouched, touched, errors } = useFormikContext();
  const [field] = useField(name);
  return (
    <View>
      <FormInputText
        onChangeText={handleChange(name)}
        onBlur={() => setFieldTouched(name)}
        value={externalValue !== undefined ? externalValue : field.value}
        {...otherProps}
      />

      <AppErrorMessage
        error={errors[name]}
        visible={touched[name]}
        {...otherProps}
      />
    </View>
  );
}

export default InputFormField;
