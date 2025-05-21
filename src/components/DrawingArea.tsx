import { Box, Typography, Paper } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { BeamCrossSection, BeamElevation } from './BeamRenderer';
import { useState, useMemo } from 'react';

const cellStates = [
  { key: 'intact', color: 'rgba(0,191,255,0.15)' }, // cyan
  { key: 'corroded', color: 'rgba(255,193,7,0.25)' }, // amber
  { key: 'section_loss', color: 'rgba(255,87,34,0.25)' }, // orange
  { key: 'perforated', color: 'rgba(244,67,54,0.35)' }, // red
];

function getNextState(current: string) {
  const idx = cellStates.findIndex(s => s.key === current);
  return cellStates[(idx + 1) % cellStates.length].key;
}

interface DrawingAreaProps {
  selectedBeam?: BeamProperties;
  selectedTool: string;
  gridSize: number;
  elevationZoom: number;
  buffer: number;
  elevationHeight: number;
  profileHeight: number;
  gridRows: number;
  gridCols: number;
  gridState: string[][];
  onGridCellClick: (row: number, col: number) => void;
}

export function DrawingArea({
  selectedBeam,
  selectedTool,
  gridSize,
  elevationZoom,
  buffer,
  elevationHeight,
  profileHeight,
  gridRows,
  gridCols,
  gridState,
  onGridCellClick,
}: DrawingAreaProps) {
  // Elevation view
  const baseScale = 10;
  const length = 60; // inches (5 ft)
  const elevationScale = baseScale * elevationZoom;
  const beamHeight = selectedBeam ? selectedBeam.depth * elevationScale : 0;
  const beamWidth = length * elevationScale;

  // Calculate profile view dimensions
  const profileScale = baseScale;
  const calculatedProfileWidth = selectedBeam ? selectedBeam.flangeWidth * profileScale + buffer * 2 : 0;
  const calculatedProfileHeight = selectedBeam ? selectedBeam.depth * profileScale + buffer * 2 : 0;

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {selectedBeam ? (
        <Box sx={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2
        }}>
          {/* Main elevation view */}
          <Box sx={{ 
            flex: 1,
            minHeight: 0,
            position: 'relative',
            bgcolor: '#232526',
            border: '2px solid #444',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <BeamElevation
              beam={selectedBeam}
              scale={elevationScale}
              gridRows={gridRows}
              gridCols={gridCols}
              gridState={gridState}
              onGridCellClick={onGridCellClick}
            />
          </Box>

          {/* Cross section view */}
          <Box sx={{ 
            position: 'absolute',
            bottom: 16,
            left: 16,
            width: calculatedProfileWidth,
            height: calculatedProfileHeight,
            bgcolor: '#232526',
            border: '2px solid #444',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            zIndex: 1
          }}>
            <BeamCrossSection 
              beam={selectedBeam} 
              scale={profileScale}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <Typography variant="h5" gutterBottom>
            Drawing Area
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Current Tool: <b>{selectedTool}</b>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No beam selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            (Grid markup and callout tools coming soon)
          </Typography>
        </Box>
      )}
    </Box>
  );
}