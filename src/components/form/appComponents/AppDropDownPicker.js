import { StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const AppDropDownPicker = ({
  open,
  value,
  items,
  setOpen,
  setValue,
  placeholder,
  style,
  zIndex = 1000,
  searchable = false,                     
  searchablePlaceholder, 
  searchableError = () => "Not found",    
  ...otherProps
}) => {
  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      placeholder={placeholder}
      style={[styles.dropdown, style]}
      zIndex={zIndex}
      searchable={searchable}
      searchablePlaceholder={searchablePlaceholder}
      searchableError={searchableError}
      {...otherProps}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    marginVertical: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default AppDropDownPicker;
