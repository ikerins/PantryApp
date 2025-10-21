// Mock implementation of authSlice
export const selectCurrentUser = (state) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
});

export const logout = () => ({ type: 'auth/logout' });

// Mock the auth slice reducer
const authSlice = {
  name: 'auth',
  initialState: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  reducers: {},
};

export default authSlice;
