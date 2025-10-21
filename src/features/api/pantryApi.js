import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const pantryApi = createApi({
  reducerPath: 'pantryApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/pantry',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PantryItem'],
  endpoints: (builder) => ({
    // Get all pantry items with optional filters
    getPantryItems: builder.query({
      query: (params = {}) => ({
        url: '/items',
        params: {
          ...params,
          // Format dates to ISO strings if they exist in params
          ...(params.expiryDate && { 
            expiryDate: params.expiryDate.toISOString() 
          }),
          ...(params.addedDate && { 
            addedDate: params.addedDate.toISOString() 
          }),
        },
      }),
      providesTags: (result = [], error, arg) => [
        'PantryItem',
        ...result.map(({ _id }) => ({ type: 'PantryItem', id: _id })),
      ],
    }),
    
    // Get a single pantry item by ID
    getPantryItem: builder.query({
      query: (id) => `items/${id}`,
      transformResponse: (response) => ({
        ...response.data,
        id: response.data._id,
      }),
      providesTags: (result, error, id) => [{ type: 'PantryItem', id }],
    }),
    
    // Add a new pantry item
    addPantryItem: builder.mutation({
      query: (body) => ({
        url: '/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PantryItem'],
    }),
    
    // Update an existing pantry item
    updatePantryItem: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `items/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PantryItem', id },
        'PantryItem',
      ],
    }),
    
    // Delete a pantry item
    deletePantryItem: builder.mutation({
      query: (id) => ({
        url: `items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PantryItem', id },
        'PantryItem',
      ],
    }),
    
    // Get items expiring soon (within 7 days)
    getExpiringSoon: builder.query({
      query: (days = 7) => ({
        url: '/items/expiring-soon',
        params: { days },
      }),
      providesTags: ['PantryItem'],
    }),
    
    // Get items by category
    getItemsByCategory: builder.query({
      query: (category) => ({
        url: '/items/by-category',
        params: { category },
      }),
      providesTags: (result, error, category) => [
        { type: 'PantryItem', category },
      ],
    }),
    
    // Get all categories with item counts
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['PantryItem'],
    }),
    
    // Search pantry items
    searchPantryItems: builder.query({
      query: (query) => ({
        url: '/items/search',
        params: { q: query },
      }),
      providesTags: (result = []) => [
        'PantryItem',
        ...result.map(({ _id }) => ({ type: 'PantryItem', id: _id })),
      ],
    }),
  }),
});

export const {
  useGetPantryItemsQuery,
  useGetPantryItemQuery,
  useAddPantryItemMutation,
  useUpdatePantryItemMutation,
  useDeletePantryItemMutation,
  useGetExpiringSoonQuery,
  useGetItemsByCategoryQuery,
  useGetCategoriesQuery,
  useSearchPantryItemsQuery,
  useLazySearchPantryItemsQuery,
} = pantryApi;
