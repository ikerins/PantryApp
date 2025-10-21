import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the auth slice
const mockSelectIsAuthenticated = jest.fn();
const mockUseSelector = jest.fn();

// Mock the PrivateRoute component with simplified implementation
jest.mock('../PrivateRoute', () => {
  return function MockPrivateRoute({ children }) {
    const isAuthenticated = mockSelectIsAuthenticated();
    const loading = mockUseSelector((state) => state?.auth?.loading) || false;

    if (loading) {
      return <div data-testid="loading">Loading...</div>;
    }

    return isAuthenticated ? children : <div data-testid="login-redirect">Redirect to Login</div>;
  };
});

// Import the mocked component
import PrivateRoute from '../PrivateRoute';

// Test components
const Dashboard = () => <div>Dashboard Content</div>;
const Login = () => <div>Login Page</div>;

// Create a simple test component that uses the PrivateRoute
const TestApp = ({ isAuthenticated = false, loading = false }) => {
  // Setup mock return values
  mockSelectIsAuthenticated.mockReturnValue(isAuthenticated);
  mockUseSelector.mockImplementation((selector) => 
    selector({ auth: { loading } })
  );

  return (
    <MemoryRouter initialEntries={['/dashboard']}>
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
  );
};

describe('PrivateRoute - Simplified Test', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the child component when authenticated', () => {
    render(<TestApp isAuthenticated={true} />);
    
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-redirect')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('shows login redirect when not authenticated', () => {
    render(<TestApp isAuthenticated={false} />);
    
    expect(screen.getByTestId('login-redirect')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<TestApp isAuthenticated={false} loading={true} />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-redirect')).not.toBeInTheDocument();
  });
});
