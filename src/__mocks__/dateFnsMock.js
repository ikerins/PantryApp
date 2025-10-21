// Mock for date-fns functions
const format = (date, formatStr) => {
  if (!date) return '';
  return date.toISOString().split('T')[0]; // Simple format for testing
};

const parseISO = (dateString) => {
  return new Date(dateString);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Add other date-fns functions as needed
export { format, parseISO, addDays };

export default {
  format,
  parseISO,
  addDays,
};
