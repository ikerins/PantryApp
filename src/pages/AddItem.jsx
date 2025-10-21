import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddPantryItemMutation } from '../features/api/apiSlice';
import { useSnackbar } from 'notistack';
import ItemForm from '../components/pantry/ItemForm';

const AddItem = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [addPantryItem, { isLoading, error }] = useAddPantryItemMutation();
  
  const handleSubmit = async (formData) => {
    try {
      await addPantryItem(formData).unwrap();
      enqueueSnackbar('Item added successfully!', { variant: 'success' });
      navigate('/pantry');
    } catch (err) {
      console.error('Failed to add item:', err);
      enqueueSnackbar(err.data?.message || 'Failed to add item', { variant: 'error' });
    }
  };

  return (
    <ItemForm
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      error={error?.data?.message || (error ? 'Failed to add item' : null)}
    />
  );
};

export default AddItem;
