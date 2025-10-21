// Mock implementation of formik
const formik = jest.requireActual('formik');

// Create a mock implementation of useFormik
export const useFormik = jest.fn(({ initialValues, onSubmit }) => ({
  values: initialValues,
  handleSubmit: (e) => {
    if (e && e.preventDefault) e.preventDefault();
    return onSubmit(initialValues);
  },
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  errors: {},
  touched: {},
  isSubmitting: false,
}));

// Re-export the actual formik components
export const Formik = formik.Formik;
export const Form = formik.Form;
export const Field = formik.Field;
export const ErrorMessage = formik.ErrorMessage;

export default {
  ...formik,
  useFormik,
};
