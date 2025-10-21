// Mock for MUI date picker components
const mockDatePicker = ({ value, onChange, ...props }) => {
  return (
    <input
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onChange(date);
      }}
      data-testid="mock-date-picker"
      {...props}
    />
  );
};

const LocalizationProvider = ({ children }) => <div>{children}</div>;
const AdapterDateFns = () => ({});
const DatePicker = mockDatePicker;

export { LocalizationProvider, AdapterDateFns, DatePicker };

export default {
  LocalizationProvider,
  AdapterDateFns,
  DatePicker,
};
