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

  return (
    <Paper elevation={2} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', color: 'text.primary', fontFamily: 'Inter, Roboto, Fira Sans, Arial, sans-serif', boxShadow: 'none', overflow: 'auto' }}>
      {selectedBeam ? (
        <Box sx={{ width: '100%', maxWidth: 1600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, py: 2 }}>
          {/* Elevation view */}
          <Box sx={{ position: 'relative', width: beamWidth + buffer * 2, height: elevationHeight, minHeight: 200, maxHeight: 800, minWidth: 400, maxWidth: 2000, bgcolor: '#232526', border: '2px solid #444', borderRadius: 2, boxShadow: 3, mb: 2, resize: 'vertical', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <BeamElevation
              beam={selectedBeam}
              scale={elevationScale}
              gridRows={gridRows}
              gridCols={gridCols}
              gridState={gridState}
              onGridCellClick={onGridCellClick}
            />
            {/* Resizer handle (stub) */}
            <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'ns-resize', bgcolor: 'transparent' }} />
          </Box>
          {/* Cross section (profile) in a fixed-size, resizable window */}
          <Box sx={{ width: beamWidth / 2 + buffer * 2, height: profileHeight, minHeight: 200, maxHeight: 800, minWidth: 200, maxWidth: 1000, bgcolor: '#232526', border: '2px solid #444', borderRadius: 2, boxShadow: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <BeamCrossSection beam={selectedBeam} scale={baseScale} />
          </Box>
        </Box>
      ) : (
        <Box textAlign="center">
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
    </Paper>
  );
}