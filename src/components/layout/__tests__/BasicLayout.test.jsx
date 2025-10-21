import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
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

// Simple test component that wraps the Layout with required providers
const TestWrapper = ({ children }) => {
  const theme = createTheme();
  return (
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('Layout - Basic Rendering', () => {
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

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );
    
    // Just check if the layout renders without errors
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the user name', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
