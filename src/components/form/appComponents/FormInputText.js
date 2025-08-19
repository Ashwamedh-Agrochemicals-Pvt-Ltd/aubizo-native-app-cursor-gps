import { StyleSheet, TextInput } from "react-native";

function FormInputText({ placeholder, style, icon, iconstyle, ...otherProps }) {
  return (
    <TextInput
      placeholder={placeholder}
      style={[styles.input, style]}
      {...otherProps}
    />
  );
}
const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 6,
    borderRadius: 5,
  },
});
export default FormInputText;
