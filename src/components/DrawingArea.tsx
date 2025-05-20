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
  profileZoom: number;
  buffer: number;
  elevationHeight: number;
  profileHeight: number;
  setElevationHeight: (h: number) => void;
  setProfileHeight: (h: number) => void;
}

export function DrawingArea({
  selectedBeam,
  selectedTool,
  gridSize,
  elevationZoom,
  profileZoom,
  buffer,
  elevationHeight,
  profileHeight,
  setElevationHeight,
  setProfileHeight,
}: DrawingAreaProps) {
  // Elevation view
  const baseScale = 10;
  const length = 72; // inches (6 ft)
  const elevationScale = baseScale * elevationZoom;
  const profileScale = baseScale * profileZoom;
  const rows = selectedBeam ? Math.floor(selectedBeam.depth / gridSize) : 0;
  const cols = Math.floor(length / gridSize);
  const beamHeight = selectedBeam ? selectedBeam.depth * elevationScale : 0;
  const beamWidth = length * elevationScale;
  const cellHeight = rows > 0 ? (selectedBeam!.depth * elevationScale) / rows : 0;
  const cellWidth = cols > 0 ? (length * elevationScale) / cols : 0;

  // Web area for grid
  const webLeft = selectedBeam ? ((selectedBeam.flangeWidth - selectedBeam.webThickness) / 2) * elevationScale : 0;
  const webWidth = selectedBeam ? selectedBeam.webThickness * elevationScale : 0;
  const webTop = 0;
  const webHeight = beamHeight;

  const [grid, setGrid] = useState<string[][]>([]);

  // Reset grid when rows/cols change
  useMemo(() => {
    if (rows > 0 && cols > 0) {
      setGrid(Array(rows).fill(null).map(() => Array(cols).fill(cellStates[0].key)));
    }
  }, [rows, cols]);

  const handleCellClick = (row: number, col: number) => {
    if (selectedTool !== 'grid') return;
    setGrid(prev => {
      const next = prev.map(arr => arr.slice());
      next[row][col] = getNextState(prev[row][col]);
      return next;
    });
  };

  // Running dimension ticks (every inch, label every foot)
  const runningDims = [];
  for (let i = 0; i <= length; i++) {
    const x = i * elevationScale + buffer;
    runningDims.push(
      <g key={i}>
        <line x1={x} y1={beamHeight + buffer + 8} x2={x} y2={beamHeight + buffer + (i % 12 === 0 ? 24 : 16)} stroke="#00bfff" strokeWidth={i % 12 === 0 ? 1.2 : 0.7} />
        {i % 12 === 0 && i !== 0 && (
          <text x={x} y={beamHeight + buffer + 36} fill="#00bfff" fontSize="13" textAnchor="middle">{i / 12}’</text>
        )}
        {i % 12 !== 0 && i % 6 === 0 && (
          <text x={x} y={beamHeight + buffer + 30} fill="#00bfff" fontSize="11" textAnchor="middle">{i}"</text>
        )}
      </g>
    );
  }

  return (
    <Paper elevation={2} sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      color: 'text.primary',
      fontFamily: 'Inter, Roboto, Fira Sans, Arial, sans-serif',
      boxShadow: 'none',
      overflow: 'auto',
    }}>
      {selectedBeam ? (
        <Box sx={{ width: '100%', maxWidth: 1600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, py: 2 }}>
          {/* Elevation view in a fixed-size, resizable window */}
          <Box sx={{
            position: 'relative',
            width: beamWidth + buffer * 2,
            height: elevationHeight,
            minHeight: 200,
            maxHeight: 800,
            minWidth: 400,
            maxWidth: 2000,
            bgcolor: '#232526',
            border: '2px solid #444',
            borderRadius: 2,
            boxShadow: 3,
            mb: 2,
            resize: 'vertical',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <svg
              width={beamWidth + buffer * 2}
              height={beamHeight + buffer * 2 + 48}
              style={{ display: 'block', background: 'none' }}
            >
              <g transform={`translate(${buffer},${buffer})`}>
                <BeamElevation beam={selectedBeam} scale={elevationScale} />
                {/* Grid overlay only on web */}
                {rows > 0 && cols > 0 && (
                  <g>
                    {grid.map((row, rIdx) =>
                      row.map((cell, cIdx) => (
                        <rect
                          key={rIdx + '-' + cIdx}
                          x={webLeft + cIdx * (webWidth / cols)}
                          y={webTop + rIdx * (webHeight / rows)}
                          width={webWidth / cols}
                          height={webHeight / rows}
                          fill={cellStates.find(s => s.key === cell)?.color}
                          stroke="#00bfff"
                          strokeWidth={0.5}
                          style={{ cursor: selectedTool === 'grid' ? 'pointer' : 'default' }}
                          onClick={() => handleCellClick(rIdx, cIdx)}
                        />
                      ))
                    )}
                    {/* Grid lines */}
                    {Array.from({ length: rows + 1 }).map((_, r) => (
                      <line
                        key={'h' + r}
                        x1={webLeft}
                        y1={webTop + r * (webHeight / rows)}
                        x2={webLeft + webWidth}
                        y2={webTop + r * (webHeight / rows)}
                        stroke="#00bfff"
                        strokeWidth={0.3}
                      />
                    ))}
                    {Array.from({ length: cols + 1 }).map((_, c) => (
                      <line
                        key={'v' + c}
                        x1={webLeft + c * (webWidth / cols)}
                        y1={webTop}
                        x2={webLeft + c * (webWidth / cols)}
                        y2={webTop + webHeight}
                        stroke="#00bfff"
                        strokeWidth={0.3}
                      />
                    ))}
                  </g>
                )}
              </g>
              {/* Running dimensions below elevation */}
              <g>{runningDims}</g>
            </svg>
            {/* Resizer handle (stub) */}
            <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'ns-resize', bgcolor: 'transparent' }} />
          </Box>
          {/* Cross section (profile) in a fixed-size, resizable window */}
          <Box sx={{
            width: beamWidth / 2 + buffer * 2,
            height: profileHeight,
            minHeight: 200,
            maxHeight: 800,
            minWidth: 200,
            maxWidth: 1000,
            bgcolor: '#232526',
            border: '2px solid #444',
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            resize: 'vertical',
            overflow: 'auto',
          }}>
            <svg
              width={beamWidth / 2 + buffer * 2}
              height={profileHeight}
              style={{ display: 'block', background: 'none' }}
            >
              <g transform={`translate(${buffer},${buffer})`}>
                <BeamCrossSection beam={selectedBeam} scale={profileScale} />
              </g>
            </svg>
            {/* Resizer handle (stub) */}
            <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'ns-resize', bgcolor: 'transparent' }} />
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