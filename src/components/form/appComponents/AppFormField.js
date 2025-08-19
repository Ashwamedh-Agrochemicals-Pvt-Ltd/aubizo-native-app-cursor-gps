import { useField, useFormikContext } from "formik";
import { StyleSheet, View } from "react-native";
import {AppErrorMessage,AppInputText} from "./index";
import DESIGN from "../../../theme";

function AppFormField({ name, ...otherProps }) {
  const { handleChange, setFieldTouched, touched, errors } = useFormikContext();
  const [field] = useField(name);

  return (
    <View style={styles.container}>
      <AppInputText
        onChangeText={handleChange(name)}
        onBlur={() => setFieldTouched(name)}
        value={field.value}
        rightIcon={otherProps.rightIcon}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: DESIGN.spacing.md,
  },
});

export default AppFormField;
