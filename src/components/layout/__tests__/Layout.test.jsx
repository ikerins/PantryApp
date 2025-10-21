import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';
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

// Create a custom render function that includes all necessary providers
const renderWithProviders = (ui, { store = mockStore, ...renderOptions } = {}) => {
  const theme = createTheme();
  
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          {children}
        </Router>
      </ThemeProvider>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

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

  it('renders the layout with all main elements', () => {
    renderWithProviders(<Layout />);
    
    // Check for main layout elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Drawer
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content area
  });

  it('displays the user profile information', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows navigation menu items', () => {
    renderWithProviders(<Layout />);
    
    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Pantry')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('toggles the mobile drawer when menu button is clicked', () => {
    // Mock mobile view
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      ...originalMatchMedia(query),
      matches: true, // Force mobile view
    }));

    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <Layout />
      </MemoryRouter>
    );

    // Menu should be closed initially
    const menuButton = screen.getByRole('button', { name: /open drawer/i });
    expect(menuButton).toBeInTheDocument();
    
    // Click the menu button to open the drawer
    fireEvent.click(menuButton);
    
    // The drawer should now be open
    const navElement = screen.getByRole('navigation');
    expect(navElement).toHaveAttribute('aria-hidden', 'false');
    
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });

  it('shows notifications when the notification icon is clicked', () => {
    renderWithProviders(<Layout />);
    
    // Click the notifications icon
    const notificationsButton = screen.getByLabelText('show notifications');
    fireEvent.click(notificationsButton);
    
    // Check that notifications are displayed
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Milk expires in 2 days')).toBeInTheDocument();
    expect(screen.getByText('Eggs added to shopping list')).toBeInTheDocument();
  });

  it('shows user menu when the profile icon is clicked', () => {
    renderWithProviders(<Layout />);
    
    // Click the profile icon
    const profileButton = screen.getByLabelText('account of current user');
    fireEvent.click(profileButton);
    
    // Check that menu items are displayed
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
