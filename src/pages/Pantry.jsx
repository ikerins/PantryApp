import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useGetPantryItemsQuery, 
  useDeletePantryItemMutation,
  useUpdatePantryItemMutation
} from '../features/api/apiSlice';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Container, 
  Grid, 
  IconButton, 
  InputAdornment, 
  MenuItem, 
  Paper, 
  TextField, 
  Typography, 
  Chip, 
  Divider, 
  Tooltip, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
  Fab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  Sort as SortIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Kitchen as PantryIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  LocalGroceryStore as GroceryIcon
} from '@mui/icons-material';
import { format, isAfter, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Categories for filtering
const categories = [
  'All Categories',
  'Dairy',
  'Meat',
  'Produce',
  'Grains',
  'Beverages',
  'Snacks',
  'Frozen',
  'Canned Goods',
  'Baking',
  'Spices',
  'Condiments',
  'Household',
  'Other'
];

// Units for quantity
const units = [
  'g', 'kg', 'ml', 'l', 'oz', 'lb', 
  'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon',
  'unit', 'package', 'bottle', 'can', 'box', 'bag'
];

// Status colors based on expiration date
const getStatusColor = (expiryDate) => {
  if (!expiryDate) return 'default';
  
  const today = new Date();
  const expDate = new Date(expiryDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'error';
  if (diffDays <= 3) return 'warning';
  if (diffDays <= 7) return 'info';
  return 'success';
};

// Status text based on expiration date
const getStatusText = (expiryDate) => {
  if (!expiryDate) return 'No expiry date';
  
  const today = new Date();
  const expDate = new Date(expiryDate);
  
  if (isToday(expDate)) return 'Expires today';
  if (isTomorrow(expDate)) return 'Expires tomorrow';
  if (isThisWeek(expDate)) return 'Expires this week';
  if (isAfter(today, expDate)) return `Expired ${format(expDate, 'MMM d')}`;
  
  return `Expires ${format(expDate, 'MMM d, yyyy')}`;
};

const Pantry = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiryDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // API calls
  const { 
    data: pantryItems = [], 
    isLoading, 
    isError, 
    refetch 
  } = useGetPantryItemsQuery();
  
  const [deleteItem] = useDeletePantryItemMutation();
  const [updateItem] = useUpdatePantryItemMutation();

  // Handle item deletion
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteItem(itemToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Handle item consumption
  const handleConsumeItem = async (item) => {
    try {
      const updatedItem = { ...item, quantity: item.quantity - 1 };
      if (updatedItem.quantity <= 0) {
        await deleteItem(item.id).unwrap();
      } else {
        await updateItem(updatedItem).unwrap();
      }
      refetch();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    return pantryItems
      .filter(item => {
        // Filter by search term
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by category
        const matchesCategory = categoryFilter === 'All Categories' || 
                              item.category === categoryFilter;
        
        // Filter by status
        let matchesStatus = true;
        if (statusFilter === 'expired') {
          matchesStatus = item.expiryDate && new Date(item.expiryDate) < new Date();
        } else if (statusFilter === 'expiring') {
          const weekFromNow = addDays(new Date(), 7);
          matchesStatus = item.expiryDate && 
                         new Date(item.expiryDate) > new Date() && 
                         new Date(item.expiryDate) <= weekFromNow;
        } else if (statusFilter === 'low') {
          matchesStatus = item.quantity <= 2; // Consider items with quantity <= 2 as low
        }
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        // Default sort by expiry date (soonest first)
        let comparison = 0;
        
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'category') {
          comparison = a.category.localeCompare(b.category);
        } else if (sortBy === 'quantity') {
          comparison = a.quantity - b.quantity;
        } else if (sortBy === 'expiryDate') {
          if (!a.expiryDate && !b.expiryDate) comparison = 0;
          else if (!a.expiryDate) comparison = 1;
          else if (!b.expiryDate) comparison = -1;
          else comparison = new Date(a.expiryDate) - new Date(b.expiryDate);
        } else if (sortBy === 'addedDate') {
          comparison = new Date(b.addedDate) - new Date(a.addedDate);
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [pantryItems, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Columns for the data grid
  const columns = [
    {
      field: 'name',
      headerName: 'Item',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {params.row.image ? (
            <CardMedia
              component="img"
              sx={{ width: 40, height: 40, borderRadius: 1, mr: 2 }}
              image={params.row.image}
              alt={params.row.name}
            />
          ) : (
            <Box 
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                color: 'primary.contrastText'
              }}
            >
              <PantryIcon />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" noWrap>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.category}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={`${params.row.quantity} ${params.row.unit || ''}`}
          size="small"
          variant="outlined"
          color={params.row.quantity <= 2 ? 'error' : 'default'}
        />
      ),
    },
    {
      field: 'expiryDate',
      headerName: 'Status',
      flex: 1.5,
      renderCell: (params) => {
        const statusColor = getStatusColor(params.row.expiryDate);
        const statusText = getStatusText(params.row.expiryDate);
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {statusColor === 'error' && <WarningIcon color={statusColor} sx={{ mr: 1 }} />}
            <Typography variant="body2" color={statusColor}>
              {statusText}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'storage',
      headerName: 'Location',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.row.storageLocation || 'Not specified'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => navigate(`/pantry/edit/${params.row.id}`)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<CheckIcon />}
          label="Consume One"
          onClick={() => handleConsumeItem(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<GroceryIcon />}
          label="Add to Shopping List"
          onClick={() => {}}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
          showInMenu
        />,
      ],
    },
  ];

  // Mobile view item card
  const MobileItemCard = ({ item }) => {
    const statusColor = getStatusColor(item.expiryDate);
    const statusText = getStatusText(item.expiryDate);
    
    return (
      <Card sx={{ mb: 2, position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" component="div" noWrap>
              {item.name}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => navigate(`/pantry/edit/${item.id}`)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteClick(item)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              label={item.category}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`${item.quantity} ${item.unit || ''}`}
              size="small"
              color={item.quantity <= 2 ? 'error' : 'default'}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box 
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: `${statusColor}.main`,
                mr: 1
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              {statusText}
            </Typography>
          </Box>
          
          {item.storageLocation && (
            <Typography variant="body2" color="text.secondary">
              Stored in: {item.storageLocation}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button 
              size="small" 
              startIcon={<CheckIcon />}
              onClick={() => handleConsumeItem(item)}
              sx={{ mr: 1 }}
            >
              Consume One
            </Button>
            <Button 
              size="small" 
              startIcon={<GroceryIcon />}
              variant="outlined"
              onClick={() => {}}
            >
              Add to List
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          My Pantry
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pantry/add')}
        >
          Add Item
        </Button>
      </Box>
      
      {/* Filters and Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                size: 'small',
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="expiring">Expiring Soon</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="low">Low Stock</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Sort By"
              value={sortBy}
              onChange={(e) => {
                // Toggle sort order if clicking the same field
                if (e.target.value === sortBy) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(e.target.value);
                  // Default sort order for different fields
                  setSortOrder(['expiryDate', 'addedDate'].includes(e.target.value) ? 'asc' : 'asc');
                }
              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon 
                      color="action" 
                      style={{
                        transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s',
                      }} 
                    />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="category">Category</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="expiryDate">Expiry Date</MenuItem>
              <MenuItem value="addedDate">Date Added</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Items List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box textAlign="center" my={4}>
          <Typography color="error">Error loading pantry items. Please try again.</Typography>
          <Button onClick={refetch} sx={{ mt: 1 }}>Retry</Button>
        </Box>
      ) : filteredItems.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="300px"
          textAlign="center"
          p={3}
        >
          <PantryIcon color="action" sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm || categoryFilter !== 'All Categories' || statusFilter !== 'all' 
              ? 'No matching items found' 
              : 'Your pantry is empty'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
            {searchTerm || categoryFilter !== 'All Categories' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding items to your pantry to keep track of your food inventory.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/pantry/add')}
            size="large"
          >
            Add Your First Item
          </Button>
        </Box>
      ) : isMobile ? (
        <Box>
          {filteredItems.map((item) => (
            <MobileItemCard key={item.id} item={item} />
          ))}
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
          <DataGrid
            rows={filteredItems}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            disableColumnMenu
            components={{
              NoRowsOverlay: () => (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  height="100%"
                  p={3}
                >
                  <PantryIcon color="action" sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No items found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Try adjusting your search or filter criteria, or add a new item to get started.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/pantry/add')}
                  >
                    Add Item
                  </Button>
                </Box>
              ),
            }}
            sx={{
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
            }}
          />
        </Box>
      )}
      
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add item"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          zIndex: 1000,
          boxShadow: 3,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 6,
          },
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => navigate('/pantry/add')}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </Fab>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Item
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pantry;
