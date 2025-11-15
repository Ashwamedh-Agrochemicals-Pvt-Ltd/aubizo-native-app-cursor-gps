import * as Yup from "yup";
export const DealerSchema = Yup.object().shape({
  shop_name: Yup.string().required("Shop name is required"),
  owner_name: Yup.string().required("Owner name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  secondaryPhone: Yup.string()
    .matches(/^[0-9]{10}$/, "Secondary phone number must be exactly 10 digits")
    .notRequired(),
  secondary_phone_relation: Yup.string().when("secondaryPhone", {
    is: (val) => val && val.trim().length > 0,
    then: (schema) => schema.required("Please select relation type for secondary phone"),
    otherwise: (schema) => schema.notRequired(),
  }),
  pan_number: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN number must be in valid format")
    .notRequired(),
  gst_number: Yup.string()
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "GST number must be in valid format"
    )
    .notRequired(),
  agreement_status: Yup.string().required("Agreement status is required"),
});
