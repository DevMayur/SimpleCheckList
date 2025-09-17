import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { CheckCircle, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <CheckCircle sx={{ color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              color: 'text.primary', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            SimpleCheckList
          </Typography>
        </Box>
        <IconButton color="primary" onClick={() => navigate('/')}>
          <Add />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
