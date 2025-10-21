import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

// Create a custom render function that includes all the necessary providers
const customRender = (
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        // Add your reducers here if needed
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from RTL
export * from '@testing-library/react';
// Override the render method
export { customRender as render };

// Helper function to mock formik
// Mock the date picker component to avoid test failures
// Mock the file input to avoid DOM issues
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Mock console.error to ignore specific warnings
beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific warnings from MUI
    if (args[0] && args[0].includes('React does not recognize')) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    // Suppress specific warnings from MUI
    if (args[0] && args[0].includes('A component is changing')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
