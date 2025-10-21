import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetPantryItemQuery, 
  useUpdatePantryItemMutation, 
  useDeletePantryItemMutation 
} from '../features/api/apiSlice';
import { useSnackbar } from 'notistack';
import ItemForm from '../components/pantry/ItemForm';
import { format, parseISO } from 'date-fns';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Fetch the item data
  const { 
    data: item, 
    isLoading: isLoadingItem, 
    isError: isItemError,
    error: itemError 
  } = useGetPantryItemQuery(id);
  
  const [updatePantryItem, { isLoading: isUpdating, error: updateError }] = useUpdatePantryItemMutation();
  const [deletePantryItem, { isLoading: isDeleting }] = useDeletePantryItemMutation();
  
  const [initialValues, setInitialValues] = useState(null);
  
  // Format the item data for the form
  useEffect(() => {
    if (item) {
      setInitialValues({
        ...item,
        // Convert string dates to Date objects for the date picker
        expiryDate: item.expiryDate ? parseISO(item.expiryDate) : null,
        addedDate: item.addedDate ? parseISO(item.addedDate) : null,
        // Store the original image URL if it exists
        imageUrl: item.imageUrl || null,
        // Add onDelete handler
        onDelete: handleDelete
      });
    }
  }, [item]);
  
  const handleSubmit = async (formData) => {
    try {
      await updatePantryItem({ id, ...formData }).unwrap();
      enqueueSnackbar('Item updated successfully!', { variant: 'success' });
      navigate('/pantry');
    } catch (err) {
      console.error('Failed to update item:', err);
      enqueueSnackbar(err.data?.message || 'Failed to update item', { variant: 'error' });
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deletePantryItem(id).unwrap();
        enqueueSnackbar('Item deleted successfully', { variant: 'success' });
        navigate('/pantry');
      } catch (err) {
        console.error('Failed to delete item:', err);
        enqueueSnackbar(err.data?.message || 'Failed to delete item', { variant: 'error' });
      }
    }
  };
  
  if (isLoadingItem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (isItemError) {
    return (
      <div className="alert alert-danger" role="alert">
        {itemError.data?.message || 'Failed to load item'}
      </div>
    );
  }
  
  if (!initialValues) {
    return null; // or a loading state
  }
  
  return (
    <ItemForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      isSubmitting={isUpdating || isDeleting}
      error={updateError?.data?.message || (updateError ? 'Failed to update item' : null)}
      isEdit={true}
    />
  );
};

export default EditItem;
