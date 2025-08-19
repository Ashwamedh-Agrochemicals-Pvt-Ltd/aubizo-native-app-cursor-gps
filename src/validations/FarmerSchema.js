import * as Yup from "yup";

export const FarmerSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Please enter the farmer's name.")
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be less than 50 characters."),
  
  mobile: Yup.string()
    .trim()
    .matches(
      /^[0-9]{10}$/,
      "Enter a valid 10-digit mobile number."
    )
    .required("Mobile number is required."),
  
  city: Yup.string()
    .trim()
    .required("City is required.")
    .min(2, "City must be at least 2 characters.")
    .max(50, "City must be less than 50 characters."),
  
  acre: Yup.string()
    .trim()
    .required("Total acre is required.")
    .matches(
      /^[0-9]+(\.[0-9]{1,2})?$/,
      "Please enter a valid acre value (e.g., 10 or 10.5)"
    )
    .test('positive', 'Acre must be greater than 0', value => {
      return value && parseFloat(value) > 0;
    }),
  
  Current_Product: Yup.string()
    .trim()
    .required("Current product is required.")
    .min(2, "Product name must be at least 2 characters.")
    .max(100, "Product name must be less than 100 characters."),
  
  remark: Yup.string()
    .trim()
    .max(500, "Remark must be less than 500 characters."),
});
