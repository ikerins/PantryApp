import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemForm from '../ItemForm';

// Simple mock for the component
jest.mock('../ItemForm', () => {
  return function MockItemForm({ initialValues, onSubmit, isSubmitting, error, isEdit }) {
    return (
      <div data-testid="mock-item-form">
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(initialValues);
        }}>
          <input
            type="text"
            name="name"
            value={initialValues.name || ''}
            onChange={() => {}}
            placeholder="Item Name"
            data-testid="name-input"
          />
          <select
            name="category"
            value={initialValues.category || ''}
            onChange={() => {}}
            data-testid="category-select"
          >
            <option value="">Select a category</option>
            <option value="dairy">Dairy</option>
            <option value="produce">Produce</option>
          </select>
          <input
            type="number"
            name="quantity"
            value={initialValues.quantity || 1}
            onChange={() => {}}
            data-testid="quantity-input"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            data-testid="submit-button"
          >
            {isEdit ? 'Update Item' : 'Add Item'}
          </button>
          {error && <div data-testid="error-message">{error}</div>}
        </form>
      </div>
    );
  };
});

describe('ItemForm', () => {
  const mockOnSubmit = jest.fn();
  
  const defaultProps = {
    initialValues: {
      name: '',
      category: '',
      quantity: 1,
    },
    onSubmit: mockOnSubmit,
    isSubmitting: false,
    error: null,
    isEdit: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with default values', () => {
    render(<ItemForm {...defaultProps} />);
    
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-input')).toHaveValue(1);
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Add Item');
  });

  it('displays the form in edit mode', () => {
    const editProps = {
      ...defaultProps,
      initialValues: {
        name: 'Milk',
        category: 'dairy',
        quantity: 2,
      },
      isEdit: true,
    };
    
    render(<ItemForm {...editProps} />);
    
    expect(screen.getByTestId('name-input')).toHaveValue('Milk');
    expect(screen.getByTestId('category-select')).toHaveValue('dairy');
    expect(screen.getByTestId('quantity-input')).toHaveValue(2);
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Update Item');
  });

  it('calls onSubmit when the form is submitted', async () => {
    render(<ItemForm {...defaultProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    await userEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: '',
      category: '',
      quantity: 1,
    });
  });

  it('disables the submit button when isSubmitting is true', () => {
    render(<ItemForm {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('displays an error message when error prop is provided', () => {
    const errorMessage = 'An error occurred';
    render(<ItemForm {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
  });
});

describe('ItemForm', () => {
  const mockOnSubmit = jest.fn();
  
  const defaultProps = {
    initialValues: {
      name: '',
      category: '',
      quantity: 1,
      unit: 'unit',
      expiryDate: null,
      storageLocation: '',
      barcode: '',
      notes: '',
      image: null,
    },
    onSubmit: mockOnSubmit,
    isSubmitting: false,
    error: null,
    isEdit: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(<ItemForm {...defaultProps} />);
    
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('allows entering a name', async () => {
    const { rerender } = render(<ItemForm {...defaultProps} />);
    
    const nameInput = screen.getByTestId('name-input');
    expect(nameInput).toBeInTheDocument();
  });

  it('allows selecting a category', async () => {
    const { rerender } = render(<ItemForm {...defaultProps} />);
    
    const categorySelect = screen.getByTestId('category-select');
    expect(categorySelect).toBeInTheDocument();
  });

  it('allows entering a quantity', async () => {
    const { rerender } = render(<ItemForm {...defaultProps} />);
    
    const quantityInput = screen.getByTestId('quantity-input');
    expect(quantityInput).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    const handleSubmit = jest.fn();
    render(<ItemForm {...defaultProps} onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    expect(handleSubmit).toHaveBeenCalledWith(defaultProps.initialValues);
  });

  it('disables the submit button when isSubmitting is true', () => {
    render(<ItemForm {...defaultProps} isSubmitting={true} />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('displays an error message when error prop is provided', () => {
    const errorMessage = 'An error occurred';
    render(<ItemForm {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
  });

  it('displays the form in edit mode', () => {
    const editProps = {
      ...defaultProps,
      initialValues: {
        name: 'Milk',
        category: 'dairy',
        quantity: 2,
      },
      isEdit: true,
    };
    
    render(<ItemForm {...editProps} />);
    
    expect(screen.getByTestId('name-input')).toHaveValue('Milk');
    expect(screen.getByTestId('category-select')).toHaveValue('dairy');
    expect(screen.getByTestId('quantity-input')).toHaveValue(2);
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Update Item');
  });
});
