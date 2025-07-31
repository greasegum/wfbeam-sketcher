import { Box } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { PhaserBeamSketch } from '../phaser/PhaserBeamSketch';
import type { LayerState } from './LayerControl';

interface PhaserDrawingAreaProps {
  selectedBeam?: BeamProperties;
  selectedTool: string;
  showGrid: boolean;
  layers: LayerState;
}

export function PhaserDrawingArea({
  selectedBeam,
  selectedTool,
  showGrid,
  layers
}: PhaserDrawingAreaProps) {
  if (!selectedBeam) {
    return (
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <p>Select a beam to begin</p>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flex: 1,
        minHeight: 0,
        position: 'relative',
        bgcolor: '#232526',
        border: '2px solid #444',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden'
      }}>
        <PhaserBeamSketch
          width={window.innerWidth - 600} // Account for sidebars
          height={window.innerHeight - 100} // Account for status bar
          selectedBeam={selectedBeam}
        />
      </Box>
    </Box>
  );
}