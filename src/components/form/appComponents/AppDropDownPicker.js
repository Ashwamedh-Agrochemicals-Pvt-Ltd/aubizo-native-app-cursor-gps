import { StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DESIGN from "../../../theme";

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
  maxHeight = 210,
  searchableError = () => "Not found",
  ...otherProps
}) => {
  return (
    <DropDownPicker
      open={open}
      items={items}
      value={value}
      setOpen={setOpen}
      setValue={setValue}
      placeholder={placeholder}
      style={[styles.dropdown, style]}
      zIndex={zIndex}
      searchable={searchable}
      searchablePlaceholder={searchablePlaceholder}
      searchableError={searchableError}
      listMode="SCROLLVIEW"
      maxHeight={maxHeight}
      {...otherProps}
      dropDownContainerStyle={{
        borderColor: "#ccc",
        borderWidth: 1,
        backgroundColor: DESIGN.colors.background,
        elevation: 5, // Android shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3, // iOS shadow
        marginTop: 4,
        zIndex: 9999,
      }}
      listItemContainerStyle={{
        borderBottomWidth: 1,
        borderBottomColor: "#ddd", // line color between items
        paddingHorizontal: 15,    // increased horizontal padding
      }}

      /** 👇 style the search field */
      searchContainerStyle={{
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        backgroundColor: "#f8f8f8",
        paddingHorizontal: 10,
       
      }}
      searchTextInputStyle={{
        borderWidth: 0,          // 🔹 removes border
         backgroundColor: "#f8f8f8",
        borderRadius: 8,
        paddingHorizontal: 5,   // 🔹 increased padding
        fontSize: 15,
        color: "#333",
      }}
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
