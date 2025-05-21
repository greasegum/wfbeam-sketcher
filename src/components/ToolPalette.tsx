import { Box, IconButton, Tooltip, Paper } from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { commonStyles } from '../config/theme';

interface ToolPaletteProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const tools = [
  { key: 'grid', label: 'Grid Markup', icon: <GridOnIcon /> },
  { key: 'callout', label: 'Callout/Annotation', icon: <EditNoteIcon /> },
];

export function ToolPalette({ selectedTool, onSelectTool, onZoomIn, onZoomOut }: ToolPaletteProps) {
  return (
    <Paper elevation={3} sx={{
      width: commonStyles.toolPalette.width,
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 2,
      borderRight: 1,
      borderColor: 'divider',
      gap: 2,
    }}>
      {tools.map((tool) => (
        <Tooltip title={tool.label} placement="right" key={tool.key}>
          <IconButton
            color={selectedTool === tool.key ? 'primary' : 'default'}
            onClick={() => onSelectTool(tool.key)}
            size="large"
            sx={{
              bgcolor: selectedTool === tool.key ? 'primary.main' : 'transparent',
              color: selectedTool === tool.key ? '#fff' : 'text.secondary',
              mb: 1,
              '&:hover': {
                bgcolor: 'primary.light',
                color: '#fff',
              },
            }}
          >
            {tool.icon}
          </IconButton>
        </Tooltip>
      ))}
      {/* Zoom controls for elevation only */}
      <Tooltip title="Zoom In Elevation" placement="right">
        <IconButton onClick={onZoomIn} size="large">
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom Out Elevation" placement="right">
        <IconButton onClick={onZoomOut} size="large">
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}