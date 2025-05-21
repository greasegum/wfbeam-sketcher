import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Switch } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import GridOnIcon from '@mui/icons-material/GridOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BrushIcon from '@mui/icons-material/Brush';
import CommentIcon from '@mui/icons-material/Comment';
import WarningIcon from '@mui/icons-material/Warning';
import { commonStyles, colors } from '../config/theme';

export interface LayerState {
  baseBeam: boolean;
  dimensions: boolean;
  controlGrid: boolean;
  conditions: boolean;
  annotations: boolean;
  hatching: boolean;
}

interface LayerControlProps {
  layers: LayerState;
  onLayerChange: (layer: keyof LayerState) => void;
}

const layerDefinitions = [
  {
    key: 'baseBeam' as keyof LayerState,
    label: 'Base Beam',
    description: 'Beam geometry and profile',
    icon: <LayersIcon />,
    disabled: true, // Base layer cannot be hidden
    color: colors.primary.main
  },
  {
    key: 'dimensions' as keyof LayerState,
    label: 'Dimensions',
    description: 'Measurements and ordinates',
    icon: <SquareFootIcon />,
    color: colors.secondary.main
  },
  {
    key: 'controlGrid' as keyof LayerState,
    label: 'Control Grid',
    description: 'Measurement grid overlay',
    icon: <GridOnIcon />,
    color: colors.grid.lines.stroke
  },
  {
    key: 'conditions' as keyof LayerState,
    label: 'Conditions',
    description: 'Corrosion and damage markup',
    icon: <WarningIcon />,
    color: colors.grid.web.section_loss
  },
  {
    key: 'annotations' as keyof LayerState,
    label: 'Annotations',
    description: 'Notes and callouts',
    icon: <CommentIcon />,
    color: colors.primary.light
  },
  {
    key: 'hatching' as keyof LayerState,
    label: 'Hatching',
    description: 'Material patterns',
    icon: <BrushIcon />,
    color: colors.beam.hatching.stroke
  }
];

export function LayerControl({ layers, onLayerChange }: LayerControlProps) {
  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 700, 
          fontSize: 14, 
          letterSpacing: 1,
          color: 'text.primary'
        }}>
          Layers
        </Typography>
      </Box>
      
      <List sx={{ 
        width: '100%', 
        py: 0,
        flex: 1,
        overflowY: 'auto'
      }}>
        {layerDefinitions.map((layer) => (
          <ListItem
            key={layer.key}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              py: 1,
              opacity: layers[layer.key] ? 1 : 0.5,
              transition: 'opacity 0.2s ease'
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 36,
              color: layer.color
            }}>
              {layer.icon}
            </ListItemIcon>
            <ListItemText
              primary={layer.label}
              secondary={layer.description}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 500,
                sx: { color: 'text.primary' }
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                sx: { 
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }
              }}
            />
            <Switch
              size="small"
              checked={layers[layer.key]}
              onChange={() => !layer.disabled && onLayerChange(layer.key)}
              disabled={layer.disabled}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: layer.color
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: layer.color
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 