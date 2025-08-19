import { useFormikContext } from "formik";
import AppErrorMessage from "./AppErrorMeassage";
import AppDropDownPicker from "./AppDropDownPicker";
import { View } from "react-native";

function AppFieldDropDownPicker({
  name,
  open,
  setOpen,
  items,
  loadItems,       // e.g., loadDistricts
  dependsOnField,  // e.g., "state"
  containerStyle,
  zIndex,
  placeholder,
}) {
  const {
    setFieldValue,
    setFieldTouched,
    values,
    errors,
    touched,
  } = useFormikContext();

  return (
    <View style={[containerStyle, { zIndex }]}>
      <AppDropDownPicker
        open={open}
        value={values[name]}
        items={items}
        setOpen={async (o) => {
          setOpen(o);
          // Load districts when dropdown opens and dependency is filled
          if (o && loadItems && dependsOnField && items.length === 0) {
            const dependencyValue = values[dependsOnField];
            if (dependencyValue) {
              await loadItems(dependencyValue);
            }
          }
        }}
        setValue={(callback) => {
          setFieldValue(name, callback(values[name]));
        }}
        onClose={() => setFieldTouched(name, true)}
        placeholder={placeholder}
        zIndex={zIndex}
      />
      <AppErrorMessage error={errors[name]} visible={touched[name]} />
    </View>
  );
}

export default AppFieldDropDownPicker;
