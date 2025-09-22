import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Refresh,
  Close,
  Wifi,
  WifiOff,
} from '@mui/icons-material';
import { useWebSocket } from '../hooks/useWebSocket';

interface ConnectionStatusProps {
  showInline?: boolean;
  showSnackbar?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showInline = false, 
  showSnackbar = true 
}) => {
  const { connected, connecting, error, reconnect } = useWebSocket();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);

  // Show snackbar when connection status changes
  React.useEffect(() => {
    if (!connected && error && error !== lastError) {
      setLastError(error);
      if (showSnackbar) {
        setSnackbarOpen(true);
      }
    } else if (connected && lastError) {
      // Connection restored
      setLastError(null);
      if (showSnackbar) {
        setSnackbarOpen(true);
      }
    }
  }, [connected, error, lastError, showSnackbar]);

  const getStatusColor = () => {
    if (connecting) return 'warning';
    return connected ? 'success' : 'error';
  };

  const getStatusIcon = () => {
    if (connecting) return <Refresh className="animate-spin" />;
    return connected ? <Wifi /> : <WifiOff />;
  };

  const getStatusText = () => {
    if (connecting) return 'Connecting...';
    return connected ? 'Connected' : 'Disconnected';
  };

  const handleReconnect = () => {
    reconnect();
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (showInline) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
          variant={connected ? 'filled' : 'outlined'}
        />
        {!connected && !connecting && (
          <Button
            size="small"
            onClick={handleReconnect}
            startIcon={<Refresh />}
            color="primary"
          >
            Reconnect
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={connected ? 3000 : null} // Auto-hide success, keep error visible
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={connected ? 'success' : 'error'}
        variant="filled"
        action={
          <Box display="flex" alignItems="center" gap={1}>
            {!connected && !connecting && (
              <Button
                color="inherit"
                size="small"
                onClick={handleReconnect}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            )}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle>
          {connected ? 'Real-time Updates Active' : 'Connection Lost'}
        </AlertTitle>
        {connected
          ? 'You\'ll receive live updates for all changes'
          : error || 'Unable to connect to server. Some features may not work properly.'
        }
      </Alert>
    </Snackbar>
  );
};

export default ConnectionStatus;
