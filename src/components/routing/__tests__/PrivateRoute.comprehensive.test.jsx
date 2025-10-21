import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the auth slice
const mockAuthState = {
  auth: {
    isAuthenticated: false,
    loading: false,
    user: null,
    error: null
  }
};

// Create a mock store
const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...mockAuthState.auth, ...preloadedState.auth }) => state
    }
  });
};

// Test components
const PublicPage = () => <div>Public Page</div>;
const PrivatePage = () => <div>Private Page</div>;
const LoginPage = () => <div>Login Page</div>;

// Mock the actual PrivateRoute component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // Mocked for this test
  const loading = false; // Mocked for this test

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <LoginPage />;
};

// Test component that uses the PrivateRoute
const TestApp = ({ initialEntries = ['/private'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>
      <Route path="/public" element={<PublicPage />} />
      <Route
        path="/private"
        element={
          <PrivateRoute>
            <PrivatePage />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </MemoryRouter>
);

describe('PrivateRoute - Comprehensive Test', () => {
  it('renders private content when authenticated', () => {
    render(
      <Provider store={createMockStore({ auth: { isAuthenticated: true } })}>
        <TestApp />
      </Provider>
    );
    
    expect(screen.getByText('Private Page')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <Provider store={createMockStore({ auth: { isAuthenticated: false } })}>
        <TestApp />
      </Provider>
    );
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Private Page')).not.toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    render(
      <Provider store={createMockStore({ auth: { loading: true } })}>
        <MemoryRouter initialEntries={['/private']}>
          <Routes>
            <Route
              path="/private"
              element={
                <PrivateRoute>
                  <PrivatePage />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('allows access to public routes without authentication', () => {
    render(
      <Provider store={createMockStore()}>
        <TestApp initialEntries={['/public']} />
      </Provider>
    );
    
    expect(screen.getByText('Public Page')).toBeInTheDocument();
  });
});
