import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { useGetExpiringSoonQuery } from '../features/api/apiSlice';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActionArea, 
  CardMedia, 
  Button, 
  CircularProgress, 
  Paper, 
  Divider, 
  Chip, 
  Avatar 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Kitchen as PantryIcon, 
  ShoppingCart as ShoppingIcon, 
  Notifications as NotificationsIcon 
} from '@mui/icons-material';

// Alias PantryIcon to KitchenIcon for backward compatibility
const KitchenIcon = PantryIcon;

// Styled components
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
}));

const StatIconWrapper = styled(Box)(({ theme, color = 'primary' }) => ({
  display: 'flex',
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette[color].light,
  color: theme.palette[color].contrastText,
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: expiringItems = [], isLoading, isError } = useGetExpiringSoonQuery();
  const { user } = useSelector((state) => state.auth);

  // Mock data - in a real app, this would come from your API
  const stats = [
    { 
      title: 'Items in Pantry', 
      value: '42', 
      icon: <PantryIcon fontSize="large" />, 
      color: 'primary',
      action: () => navigate('/pantry')
    },
    { 
      title: 'Expiring Soon', 
      value: expiringItems.length.toString(), 
      icon: <NotificationsIcon fontSize="large" />, 
      color: 'warning',
      action: () => navigate('/pantry?filter=expiring')
    },
    { 
      title: 'Shopping List', 
      value: '7', 
      icon: <ShoppingIcon fontSize="large" />, 
      color: 'success',
      action: () => navigate('/shopping-list')
    },
  ];

  // Get recent activity - in a real app, this would come from your API
  const recentActivity = [
    { id: 1, action: 'added', item: 'Milk', time: '2 hours ago' },
    { id: 2, action: 'updated', item: 'Eggs quantity', time: '5 hours ago' },
    { id: 3, action: 'removed', item: 'Expired yogurt', time: '1 day ago' },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error">Error loading dashboard data</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your pantry today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard onClick={stat.action}>
              <CardActionArea sx={{ height: '100%' }}>
                <StatCardContent>
                  <StatIconWrapper color={stat.color}>
                    {React.cloneElement(stat.icon, { fontSize: 'large' })}
                  </StatIconWrapper>
                  <Typography variant="h3" component="div" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" component="div" color="text.secondary">
                    {stat.title}
                  </Typography>
                </StatCardContent>
              </CardActionArea>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Expiring Soon */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                Expiring Soon
              </Typography>
              <Button 
                size="small" 
                color="primary" 
                endIcon={<AddIcon />}
                onClick={() => navigate('/pantry/add')}
              >
                Add Item
              </Button>
            </Box>
            
            {expiringItems.length > 0 ? (
              <Box>
                {expiringItems.slice(0, 5).map((item) => (
                  <Box 
                    key={item._id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', mr: 2 }}>
                      <KitchenIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Expires: {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${item.quantity} ${item.unit}`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                ))}
                {expiringItems.length > 5 && (
                  <Box textAlign="center" mt={2}>
                    <Button 
                      size="small" 
                      onClick={() => navigate('/pantry?filter=expiring')}
                    >
                      View All ({expiringItems.length})
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No items expiring soon
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/pantry/add')}
                >
                  Add Items
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" component="h2" mb={3}>
              Recent Activity
            </Typography>
            
            {recentActivity.length > 0 ? (
              <Box>
                {recentActivity.map((activity, index) => (
                  <Box 
                    key={activity.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      py: 1.5,
                      borderBottom: index < recentActivity.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 2,
                        bgcolor: 'action.selected',
                        color: 'text.primary'
                      }}
                    >
                      {activity.action === 'added' ? '+' : activity.action === 'updated' ? '↻' : '−'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        <strong>{activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}</strong> {activity.item}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Box textAlign="center" mt={2}>
                  <Button size="small">View All Activity</Button>
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mt={4}>
        <Typography variant="h6" component="h2" mb={2}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/pantry/add')}
              sx={{ py: 1.5 }}
            >
              Add Item
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<ShoppingIcon />}
              onClick={() => navigate('/shopping-list')}
              sx={{ py: 1.5 }}
            >
              View Shopping List
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<KitchenIcon />}
              onClick={() => navigate('/pantry')}
              sx={{ py: 1.5 }}
            >
              Browse Pantry
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/shopping-list/add')}
              sx={{ py: 1.5 }}
            >
              Add to Shopping List
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
