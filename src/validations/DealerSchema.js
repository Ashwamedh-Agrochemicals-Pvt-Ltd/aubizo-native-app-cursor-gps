import * as Yup from "yup";
export const DealerSchema = Yup.object().shape({
  shop_name: Yup.string().required("Shope name is required"),
  owner_name: Yup.string().required("Owner name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
    
  remark: Yup.string().required("Remark is required"),
});
