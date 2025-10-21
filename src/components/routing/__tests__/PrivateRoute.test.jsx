import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

// Mock child components
const Dashboard = () => <div>Dashboard Content</div>;
const Login = () => <div>Login Page</div>;

// Create a custom render function with router and store
const renderWithProviders = (ui, { 
  isAuthenticated = false, 
  loading = false,
  initialEntries = ['/dashboard'] 
} = {}) => {
  // Create a mock store with the auth state
  const mockStore = configureStore({
    reducer: {
      auth: () => ({
        isAuthenticated,
        loading,
        user: isAuthenticated ? { id: '1', name: 'Test User' } : null,
        error: null
      })
    }
  });

  return {
    ...render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
    store: mockStore
  };
};

describe('PrivateRoute', () => {
  it('renders the child component when authenticated', () => {
    renderWithProviders(<PrivateRoute><Dashboard /></PrivateRoute>, {
      isAuthenticated: true
    });
    
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderWithProviders(<PrivateRoute><Dashboard /></PrivateRoute>, {
      isAuthenticated: false,
      initialEntries: ['/dashboard']
    });
    
    // Should redirect to login, so Dashboard content should not be visible
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    renderWithProviders(<PrivateRoute><Dashboard /></PrivateRoute>, {
      isAuthenticated: false,
      loading: true
    });
    
    // Check for loading spinner
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('spinner-border');
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });
});
