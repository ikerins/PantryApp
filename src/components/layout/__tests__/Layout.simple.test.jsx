import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from '../Layout';

// Mock the auth slice
const mockAuthState = {
  auth: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    isAuthenticated: true,
    loading: false,
    error: null,
  },
};

// Create a mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = mockAuthState.auth) => state,
  },
});

// Mock the useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/',
  }),
}));

describe('Layout', () => {
  // Mock matchMedia for Material-UI
  beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  const renderLayout = () => {
    const theme = createTheme();
    return render(
      <Provider store={mockStore}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  it('renders the layout with all main elements', () => {
    renderLayout();
    
    // Check for main layout elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Drawer
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content area
  });

  it('displays the user profile information', () => {
    renderLayout();
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows navigation menu items', () => {
    renderLayout();
    
    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Pantry')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
