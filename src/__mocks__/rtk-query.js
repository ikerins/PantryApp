// Mock for @reduxjs/toolkit/query/react
export const createApi = jest.fn(() => ({}));
export const fetchBaseQuery = jest.fn(() => async () => ({}));
export const ApiProvider = ({ children }) => <div>{children}</div>;
