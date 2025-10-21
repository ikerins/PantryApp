import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  FormHelperText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  householdName: Yup.string()
    .min(3, 'Household name must be at least 3 characters')
    .required('Household name is required'),
  location: Yup.string()
    .required('Please select a location'),
  address: Yup.string()
    .required('Address is required'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('Required'),
});

const locations = [
  { value: 'home', label: 'Home' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'other', label: 'Other' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        householdName: values.householdName,
        location: values.location,
        address: values.address,
      };

      await dispatch(registerUser(userData)).unwrap();
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginY: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Create Your Account
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4, maxWidth: '600px' }}>
          Join Pantry Manager to track your food inventory, reduce waste, and save money.
        </Typography>

        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            maxWidth: '800px',
          }}
        >
          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              householdName: '',
              location: '',
              address: '',
              termsAccepted: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
                      Personal Information
                    </Typography>
                    
                    <TextField
                      margin="normal"
                      fullWidth
                      id="name"
                      label="Full Name"
                      name="name"
                      autoComplete="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
                      Household Information
                    </Typography>

                    <TextField
                      select
                      margin="normal"
                      fullWidth
                      id="location"
                      name="location"
                      label="Location Type"
                      value={values.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.location && Boolean(errors.location)}
                      helperText={touched.location && errors.location}
                      SelectProps={{ native: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    >
                      <option value=""></option>
                      {locations.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      margin="normal"
                      fullWidth
                      id="householdName"
                      label="Household Name"
                      name="householdName"
                      value={values.householdName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.householdName && Boolean(errors.householdName)}
                      helperText={touched.householdName && errors.householdName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      id="address"
                      label="Address"
                      name="address"
                      multiline
                      rows={3}
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ mt: 3, mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.termsAccepted}
                            onChange={handleChange}
                            name="termsAccepted"
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{' '}
                            <Link href="#" color="primary" underline="hover">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="#" color="primary" underline="hover">
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                      />
                      {touched.termsAccepted && errors.termsAccepted && (
                        <FormHelperText error>{errors.termsAccepted}</FormHelperText>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting || loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isSubmitting || loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" color="primary" underline="hover">
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
