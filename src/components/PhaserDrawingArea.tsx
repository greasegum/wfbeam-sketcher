import { Box } from '@mui/material';
import { useRef, useEffect, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1,
          minHeight: 0,
          position: 'relative',
          bgcolor: '#232526',
          border: '2px solid #444',
          borderRadius: 2,
          boxShadow: 3,
          overflow: 'hidden'
        }}
      >
        {dimensions.width > 0 && dimensions.height > 0 && (
          <PhaserBeamSketch
            width={dimensions.width}
            height={dimensions.height}
            selectedBeam={selectedBeam}
          />
        )}
      </Box>
    </Box>
  );
}