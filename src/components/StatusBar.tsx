import { Box, Typography, InputAdornment, TextField } from '@mui/material';

interface StatusBarProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  elevationZoom: number;
  onElevationZoomChange: (zoom: number) => void;
  profileZoom: number;
  onProfileZoomChange: (zoom: number) => void;
  buffer: number;
  onBufferChange: (buffer: number) => void;
}

export function StatusBar({
  gridSize,
  onGridSizeChange,
  elevationZoom,
  onElevationZoomChange,
  profileZoom,
  onProfileZoomChange,
  buffer,
  onBufferChange,
}: StatusBarProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: 48,
        bgcolor: 'background.paper',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        borderTop: 1,
        borderColor: 'divider',
        fontFamily: 'Inter, Roboto, Fira Sans, Arial, sans-serif',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <Typography variant="body2" sx={{ mr: 2 }}>
        Grid Size:
      </Typography>
      <TextField
        size="small"
        type="number"
        value={gridSize}
        onChange={e => onGridSizeChange(Number(e.target.value))}
        inputProps={{ min: 0.05, step: 0.05 }}
        InputProps={{
          endAdornment: <InputAdornment position="end">in</InputAdornment>,
        }}
        sx={{ width: 100, mr: 2 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mr: 4 }}>
        (Adjust grid overlay resolution)
      </Typography>
      <Typography variant="body2" sx={{ mr: 2 }}>
        Elevation Zoom:
      </Typography>
      <TextField
        size="small"
        type="number"
        value={elevationZoom}
        onChange={e => onElevationZoomChange(Number(e.target.value))}
        inputProps={{ min: 0.1, step: 0.1 }}
        InputProps={{
          endAdornment: <InputAdornment position="end">x</InputAdornment>,
        }}
        sx={{ width: 80, mr: 2 }}
      />
      <Typography variant="body2" sx={{ mr: 2 }}>
        Profile Zoom:
      </Typography>
      <TextField
        size="small"
        type="number"
        value={profileZoom}
        onChange={e => onProfileZoomChange(Number(e.target.value))}
        inputProps={{ min: 0.1, step: 0.1 }}
        InputProps={{
          endAdornment: <InputAdornment position="end">x</InputAdornment>,
        }}
        sx={{ width: 80, mr: 2 }}
      />
      <Typography variant="body2" sx={{ mr: 2 }}>
        Buffer:
      </Typography>
      <TextField
        size="small"
        type="number"
        value={buffer}
        onChange={e => onBufferChange(Number(e.target.value))}
        inputProps={{ min: 0, step: 1 }}
        InputProps={{
          endAdornment: <InputAdornment position="end">px</InputAdornment>,
        }}
        sx={{ width: 80, mr: 2 }}
      />
    </Box>
  );
} 