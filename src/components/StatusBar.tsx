import { Box, IconButton, Slider, Typography, useTheme, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import GridOnIcon from '@mui/icons-material/GridOn'
import BufferIcon from '@mui/icons-material/ViewInAr'
import { commonStyles } from '../config/theme'

interface StatusBarProps {
  webGridSize: number
  onWebGridSizeChange: (value: number) => void
  flangeGridSize: number
  onFlangeGridSizeChange: (value: number) => void
  elevationZoom: number
  onElevationZoomChange: (value: number) => void
  buffer: number
  onBufferChange: (value: number) => void
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function StatusBar({
  webGridSize,
  onWebGridSizeChange,
  flangeGridSize,
  onFlangeGridSizeChange,
  elevationZoom,
  onElevationZoomChange,
  buffer,
  onBufferChange,
  onToggleSidebar,
  isSidebarOpen
}: StatusBarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      px: 2,
      gap: 2,
      overflowX: 'auto',
      '&::-webkit-scrollbar': {
        height: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
      }
    }}>
      {/* Sidebar Toggle */}
      <IconButton 
        onClick={onToggleSidebar}
        size="small"
        sx={{ 
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' }
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Web Grid Size Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <GridOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Web Grid: {webGridSize.toFixed(1)}"
        </Typography>
        <Slider
          size="small"
          value={webGridSize}
          onChange={(_, value) => onWebGridSizeChange(value as number)}
          min={commonStyles.grid.web.minSize}
          max={commonStyles.grid.web.maxSize}
          step={commonStyles.grid.web.step}
          sx={{ width: 100 }}
        />
      </Box>

      {/* Flange Grid Size Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <GridOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Flange Grid: {flangeGridSize.toFixed(1)}"
        </Typography>
        <Slider
          size="small"
          value={flangeGridSize}
          onChange={(_, value) => onFlangeGridSizeChange(value as number)}
          min={commonStyles.grid.flange.minSize}
          max={commonStyles.grid.flange.maxSize}
          step={commonStyles.grid.flange.step}
          sx={{ width: 100 }}
        />
      </Box>

      {/* Elevation Zoom Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <ZoomInIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Zoom: {elevationZoom.toFixed(1)}x
        </Typography>
        <Slider
          size="small"
          value={elevationZoom}
          onChange={(_, value) => onElevationZoomChange(value as number)}
          min={commonStyles.zoom.min}
          max={commonStyles.zoom.max}
          step={commonStyles.zoom.step}
          sx={{ width: 100 }}
        />
      </Box>

      {/* Buffer Size Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        <BufferIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Buffer: {buffer}px
        </Typography>
        <Slider
          size="small"
          value={buffer}
          onChange={(_, value) => onBufferChange(value as number)}
          min={commonStyles.buffer.min}
          max={commonStyles.buffer.max}
          step={commonStyles.buffer.step}
          sx={{ width: 100 }}
        />
      </Box>
    </Box>
  )
}