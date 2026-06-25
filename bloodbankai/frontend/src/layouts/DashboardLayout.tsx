import { Outlet, useNavigate } from 'react-router-dom'
import {
  Paper,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import InventoryIcon from '@mui/icons-material/Inventory'
import LogoutIcon from '@mui/icons-material/Logout'
import { useBloodBankStore } from '../store/bloodbank.store'
import { useEffect, useState } from 'react'

const DashboardLayout = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { bloodBank, token, logout } = useBloodBankStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/')
    }
  }, [token, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
    { text: 'Donors', icon: <PeopleIcon />, path: '/app/donors' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/app/inventory' },
  ]

  const handleNavClick = (path: string) => {
    navigate(path)
    setDrawerOpen(false)
  }

  const drawerContent = (
    <Box sx={{ width: 250, pt: 2 }} role="presentation">
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 2 }}>
        <Box sx={{ fontSize: '24px', mr: 1 }}>🩸</Box>
        <Typography variant="h6" fontWeight="bold" color="error.main">
          Blood Dot
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavClick(item.path)}>
              <ListItemIcon sx={{ color: 'error.main' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <Paper 
        elevation={8} 
        sx={{ 
          borderRadius: 0,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
          }
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ fontSize: { xs: '20px', sm: '24px' }, mr: 1 }}>🩸</Box>
          <Typography 
            variant="h6" 
            ml={1} 
            flexGrow={1} 
            color="error.main" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            {isMobile ? (bloodBank?.name || 'Blood Dot') : `Blood Dot - ${bloodBank?.name}`}
          </Typography>

          {!isMobile && (
            <>
              <Button 
                onClick={() => navigate('/app/dashboard')}
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/app/donors')}
                startIcon={<PeopleIcon />}
              >
                Donors
              </Button>
              <Button 
                onClick={() => navigate('/app/inventory')}
                startIcon={<InventoryIcon />}
              >
                Inventory
              </Button>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </Paper>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        minHeight: 'calc(100vh - 64px)',
        background: '#ffffff',
        position: 'relative',
        '&::before': {
          content: '"🩸"',
          position: 'fixed',
          fontSize: { xs: '150px', sm: '300px' },
          opacity: 0.05,
          top: '30%',
          left: '20%',
          zIndex: 0,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '"🩸"',
          position: 'fixed',
          fontSize: { xs: '100px', sm: '200px' },
          opacity: 0.03,
          bottom: '10%',
          right: '10%',
          zIndex: 0,
          pointerEvents: 'none',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </>
  )
}

export default DashboardLayout
