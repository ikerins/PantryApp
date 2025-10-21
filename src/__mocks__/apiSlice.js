// Mock implementation of API slice
export const apiSlice = {
  reducerPath: 'api',
  reducer: () => ({}),
  middleware: () => (next) => (action) => next(action),
  util: {
    getRunningOperationPromises: () => [],
    getRunningMutationsThunk: () => () => {},
    getRunningQueriesThunk: () => () => {},
  },
};

export const { middleware: apiMiddleware } = apiSlice;
