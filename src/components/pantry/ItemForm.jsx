import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Typography, 
  Paper, 
  InputAdornment, 
  IconButton, 
  MenuItem, 
  Divider, 
  Avatar, 
  FormControl, 
  InputLabel, 
  Select, 
  FormHelperText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  AddPhotoAlternate as AddPhotoIcon, 
  CameraAlt as CameraIcon, 
  QrCode as BarcodeIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  QrCodeScanner as ScannerIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';

// Categories for the dropdown
const categories = [
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

// Storage locations
const storageLocations = [
  'Pantry',
  'Refrigerator',
  'Freezer',
  'Cupboard',
  'Spice Rack',
  'Counter',
  'Other'
];

// Form validation schema
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  quantity: Yup.number()
    .typeError('Must be a number')
    .positive('Must be positive')
    .required('Quantity is required'),
  unit: Yup.string().required('Unit is required'),
  expiryDate: Yup.date().nullable(),
  storageLocation: Yup.string().required('Storage location is required'),
  barcode: Yup.string(),
  notes: Yup.string(),
  image: Yup.mixed(),
});

const ItemForm = ({ 
  initialValues: propInitialValues, 
  onSubmit, 
  isSubmitting, 
  error,
  isEdit = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  
  // Set up form with Formik
  const formik = useFormik({
    initialValues: propInitialValues || {
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
    validationSchema,
    onSubmit: (values) => {
      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      onSubmit(formData);
    },
  });

  // Handle image upload preview
  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    formik.setFieldValue('barcode', barcode);
    setBarcodeDialogOpen(false);
    // Here you would typically look up product details from a barcode API
  };

  // Simulate barcode scanning for demo
  const simulateBarcodeScan = () => {
    setScannerActive(true);
    // Simulate scanning delay
    setTimeout(() => {
      const mockBarcode = '123456789012';
      handleBarcodeScan(mockBarcode);
      setScannerActive(false);
    }, 2000);
  };

  // Set image preview if editing and image exists
  useEffect(() => {
    if (isEdit && propInitialValues?.imageUrl) {
      setImagePreview(propInitialValues.imageUrl);
    }
  }, [isEdit, propInitialValues]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {isEdit ? 'Edit Item' : 'Add New Item'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column - Image Upload */}
            <Grid item xs={12} md={4}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                
                {imagePreview ? (
                  <CardMedia
                    component="img"
                    image={imagePreview}
                    alt="Preview"
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      objectFit: 'contain',
                      mb: 2,
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <AddPhotoIcon fontSize="large" color="action" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload a photo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      or drag and drop
                    </Typography>
                  </Box>
                )}
                
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={imagePreview ? <AddPhotoIcon /> : <CameraIcon />}
                  onClick={(e) => e.stopPropagation()}
                  component="label"
                >
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </Card>
              
              {/* Barcode Section */}
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Barcode
                </Typography>
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    id="barcode"
                    name="barcode"
                    placeholder="Scan or enter barcode"
                    value={formik.values.barcode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.barcode && Boolean(formik.errors.barcode)}
                    helperText={formik.touched.barcode && formik.errors.barcode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BarcodeIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            edge="end" 
                            onClick={() => setBarcodeDialogOpen(true)}
                            color={formik.values.barcode ? 'default' : 'primary'}
                          >
                            <ScannerIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {/* Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Item Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    autoFocus
                  />
                </Grid>
                
                {/* Category and Storage Location */}
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <FormHelperText>{formik.errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.storageLocation && Boolean(formik.errors.storageLocation)}
                  >
                    <InputLabel id="storage-location-label">Storage Location</InputLabel>
                    <Select
                      labelId="storage-location-label"
                      id="storageLocation"
                      name="storageLocation"
                      value={formik.values.storageLocation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Storage Location"
                    >
                      {storageLocations.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.storageLocation && formik.errors.storageLocation && (
                      <FormHelperText>{formik.errors.storageLocation}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Quantity and Unit */}
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    id="quantity"
                    name="quantity"
                    label="Quantity"
                    type="number"
                    inputProps={{ min: 0.01, step: 0.01 }}
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                    helperText={formik.touched.quantity && formik.errors.quantity}
                  />
                </Grid>
                
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="unit-label">Unit</InputLabel>
                    <Select
                      labelId="unit-label"
                      id="unit"
                      name="unit"
                      value={formik.values.unit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Unit"
                    >
                      {units.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Expiry Date (Optional)"
                    value={formik.values.expiryDate}
                    onChange={(date) => formik.setFieldValue('expiryDate', date, true)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                        helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                      />
                    )}
                  />
                </Grid>
                
                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="notes"
                    name="notes"
                    label="Notes (Optional)"
                    multiline
                    rows={3}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Add any additional notes about this item..."
                  />
                </Grid>
                
                {/* Form Actions */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    
                    <Box>
                      {isEdit && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          sx={{ mr: 2 }}
                          onClick={() => {
                            // Handle delete
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              // Call delete function if provided
                              if (propInitialValues?.onDelete) {
                                propInitialValues.onDelete();
                              }
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          Delete
                        </Button>
                      )}
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Item'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Barcode Scanner Dialog */}
      <Dialog 
        open={barcodeDialogOpen} 
        onClose={() => setBarcodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Barcode</DialogTitle>
        <DialogContent>
          {scannerActive ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Scanning Barcode...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Point your camera at the barcode
              </Typography>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  bgcolor: 'black', 
                  mt: 3, 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                }}
              >
                {/* Simulated barcode scanner UI */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
                    animation: 'scan 2s linear infinite',
                    '@keyframes scan': {
                      '0%': { transform: 'translateY(-100%)' },
                      '100%': { transform: 'translateY(100%)' },
                    },
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BarcodeIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
              <Typography variant="h6" gutterBottom>
                Barcode Scanner
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '80%', mx: 'auto' }}>
                Place the barcode in front of your device's camera to scan.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<ScannerIcon />}
                onClick={simulateBarcodeScan}
                disabled={scannerActive}
                sx={{ mt: 2 }}
              >
                Start Scanning
              </Button>
              
              <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
                Or enter the barcode manually above
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBarcodeDialogOpen(false)}
            color="inherit"
            disabled={scannerActive}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              // Simulate a successful scan
              if (!scannerActive) {
                simulateBarcodeScan();
              }
            }}
            color="primary"
            variant={scannerActive ? 'outlined' : 'contained'}
            disabled={scannerActive}
          >
            {scannerActive ? 'Scanning...' : 'Simulate Scan'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ItemForm;
