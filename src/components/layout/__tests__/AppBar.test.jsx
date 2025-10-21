import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography } from '@mui/material';

// A simple test component that only includes the AppBar
function TestAppBar() {
  return (
    <ThemeProvider theme={createTheme()}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pantry App
          </Typography>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

describe('AppBar Component', () => {
  it('renders the app bar with title', () => {
    render(<TestAppBar />);
    
    // Check if the app bar is rendered
    const appBar = screen.getByRole('banner');
    expect(appBar).toBeInTheDocument();
    
    // Check if the title is correct
    expect(screen.getByText('Pantry App')).toBeInTheDocument();
  });
});
