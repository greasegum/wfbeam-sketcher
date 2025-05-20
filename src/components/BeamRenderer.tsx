import { Box, Paper, Typography } from '@mui/material';
import * as makerjs from 'makerjs';
import type { BeamProperties } from '../data/beamProperties';

interface BeamRendererProps {
  beam: BeamProperties;
  scale: number;
  gridRows?: number;
  gridCols?: number;
  gridState?: string[][];
  onGridCellClick?: (row: number, col: number) => void;
}

// Utility to generate Maker.js model for a W-beam cross section
function getIBeamMakerModel(beam: BeamProperties, scale: number, filletRadius = 0.25) {
  // All units in px
  const w = beam.flangeWidth * scale;
  const h = beam.depth * scale;
  const tw = beam.webThickness * scale;
  const tf = beam.flangeThickness * scale;
  const x0 = 40, y0 = 40; // margin

  // Build the I-beam as a Maker.js model (approximate fillets with rectangles)
  const model: makerjs.IModel = {
    models: {
      topFlange: new makerjs.models.Rectangle(w, tf),
      botFlange: new makerjs.models.Rectangle(w, tf),
      web: new makerjs.models.Rectangle(tw, h - 2 * tf)
    },
    origin: [x0, y0]
  };
  // Move bottom flange and web to correct positions
  makerjs.model.moveRelative(model.models!.botFlange, [0, h - tf]);
  makerjs.model.moveRelative(model.models!.web, [(w - tw) / 2, tf]);
  return model;
}

// Utility to generate Maker.js model for a W-beam elevation
function getBeamElevationMakerModel(beam: BeamProperties, length: number, scale: number) {
  // All units in px
  const w = length * scale;
  const h = beam.depth * scale;
  const tf = beam.flangeThickness * scale;
  // Outline, top flange, bottom flange
  const model: makerjs.IModel = {
    models: {
      outline: new makerjs.models.Rectangle(w, h),
      topFlange: new makerjs.models.Rectangle(w, tf),
      botFlange: new makerjs.models.Rectangle(w, tf)
    },
    origin: [0, 0]
  };
  makerjs.model.moveRelative(model.models!.botFlange, [0, h - tf]);
  return model;
}

export function BeamCrossSection({ beam, scale }: BeamRendererProps) {
  const svgW = beam.flangeWidth * scale + 80;
  const svgH = beam.depth * scale + 80;
  const model = getIBeamMakerModel(beam, scale, 0.25);
  const svg = makerjs.exporter.toSVG(model);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'background.paper',
        fontFamily: 'Inter, Roboto, Fira Sans, Arial, sans-serif',
      }}
    >
      <Typography variant="h6" sx={{ color: 'primary.main' }}>Cross Section - {beam.designation}</Typography>
      <Box
        sx={{
          position: 'relative',
          width: svgW,
          height: svgH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Render Maker.js SVG directly */}
        <span dangerouslySetInnerHTML={{ __html: svg }} style={{ position: 'absolute' }} />
      </Box>
    </Paper>
  );
}

export function BeamElevation({ beam, scale, gridRows, gridCols, gridState, onGridCellClick }: BeamRendererProps) {
  const length = 60; // 5 feet in inches
  const height = beam.depth * scale;
  const width = length * scale;
  const tf = beam.flangeThickness * scale;
  const webLeft = ((width - beam.webThickness * scale) / 2);
  const webWidth = beam.webThickness * scale;

  // SVG grid overlay
  let gridOverlay = null;
  if (gridRows && gridCols && gridState) {
    const cellH = height / gridRows;
    const cellW = webWidth / gridCols;
    gridOverlay = [];
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        gridOverlay.push(
          <rect
            key={`cell-${r}-${c}`}
            x={webLeft + c * cellW}
            y={r * cellH}
            width={cellW}
            height={cellH}
            fill={gridState[r][c]}
            fillOpacity={0.4}
            stroke="#00bfff"
            strokeWidth={0.5}
            onClick={onGridCellClick ? () => onGridCellClick(r, c) : undefined}
            style={{ cursor: onGridCellClick ? 'pointer' : 'default' }}
          />
        );
      }
    }
  }

  // Maker.js for outline/flanges
  const model = getBeamElevationMakerModel(beam, length, scale);
  const svg = makerjs.exporter.toSVG(model);

  return (
    <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, bgcolor: 'background.paper', fontFamily: 'Inter, Roboto, Fira Sans, Arial, sans-serif' }}>
      <Typography variant="h6" sx={{ color: 'primary.main' }}>Elevation - {beam.designation}</Typography>
      <Box sx={{ position: 'relative', width: width + 40, height: height + 40, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute' }}>
          <g dangerouslySetInnerHTML={{ __html: svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<g').replace('</svg>', '</g>') }} />
          {/* Grid overlay on web */}
          {gridOverlay}
        </svg>
      </Box>
    </Paper>
  );
}