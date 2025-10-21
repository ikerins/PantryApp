import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
  credentials: 'include',
});

// Create base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Handle 401 Unauthorized responses
    if (result.error && result.error.status === 401) {
      console.error('Authentication error:', result.error);
    }
    
    return result;
  },
  tagTypes: ['PantryItem', 'User', 'Household'],
  endpoints: (builder) => ({
    // Pantry Items
    getPantryItems: builder.query({
      query: () => '/pantry/items',
      providesTags: ['PantryItem'],
    }),
    
    getExpiringSoon: builder.query({
      query: () => '/pantry/items/expiring-soon',
      providesTags: ['PantryItem'],
    }),
    
    addPantryItem: builder.mutation({
      query: (item) => ({
        url: '/pantry/items',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['PantryItem'],
    }),
    
    updatePantryItem: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/pantry/items/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['PantryItem'],
    }),
    
    deletePantryItem: builder.mutation({
      query: (id) => ({
        url: `/pantry/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PantryItem'],
    }),
  }),
});

export const {
  useGetPantryItemsQuery,
  useGetExpiringSoonQuery,
  useAddPantryItemMutation,
  useUpdatePantryItemMutation,
  useDeletePantryItemMutation,
} = apiSlice;

export default apiSlice;
