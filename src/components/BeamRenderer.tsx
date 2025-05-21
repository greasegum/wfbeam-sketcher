import { Box, Paper, Typography } from '@mui/material';
import * as makerjs from 'makerjs';
import type { BeamProperties } from '../data/beamProperties';
import { colors } from '../config/theme';

interface BeamRendererProps {
  beam: BeamProperties;
  scale: number;
  gridRows?: number;
  gridCols?: number;
  gridState?: string[][];
  flangeGridState?: string[][];
  webGridSize?: number;
  flangeGridSize?: number;
  onGridCellClick?: (row: number, col: number, isFlange: boolean) => void;
}

// Utility to generate Maker.js model for a W-beam cross section
function getIBeamMakerModel(beam: BeamProperties, scale: number, filletRadius = 0.25) {
  // All units in px
  const w = beam.flangeWidth * scale;
  const h = beam.depth * scale;
  const tw = beam.webThickness * scale;
  const tf = beam.flangeThickness * scale;
  const x0 = 20, y0 = 20; // margin

  // Build the I-beam as a Maker.js model
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
  const tw = beam.webThickness * scale;

  // Outline, top flange, bottom flange, web
  const model: makerjs.IModel = {
    models: {
      outline: new makerjs.models.Rectangle(w, h),
      topFlange: new makerjs.models.Rectangle(w, tf),
      botFlange: new makerjs.models.Rectangle(w, tf),
      web: new makerjs.models.Rectangle(tw, h - 2 * tf)
    },
    origin: [20, 20]
  };

  // Position elements
  makerjs.model.moveRelative(model.models!.botFlange, [0, h - tf]);
  makerjs.model.moveRelative(model.models!.web, [(w - tw) / 2, tf]);

  return model;
}

export function BeamCrossSection({ beam, scale }: BeamRendererProps) {
  const svgW = beam.flangeWidth * scale + 40;
  const svgH = beam.depth * scale + 40;
  const model = getIBeamMakerModel(beam, scale);
  const svg = makerjs.exporter.toSVG(model, {
    stroke: colors.beam.stroke,
    strokeWidth: `${colors.beam.strokeWidth}`
  });

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.paper',
      p: 1
    }}>
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
        <span dangerouslySetInnerHTML={{ __html: svg }} style={{ position: 'absolute' }} />
      </Box>
    </Box>
  );
}

export function BeamElevation({ 
  beam, 
  scale, 
  gridRows, 
  gridCols, 
  gridState, 
  flangeGridState,
  webGridSize = 1.0,
  flangeGridSize = 2.0,
  onGridCellClick 
}: BeamRendererProps) {
  const length = 60; // 5 feet in inches
  const height = beam.depth * scale;
  const width = length * scale;
  const tf = beam.flangeThickness * scale;
  const tw = beam.webThickness * scale;
  const webLeft = ((width - tw) / 2);

  // Web grid overlay
  let webGridOverlay = null;
  if (gridRows && gridCols && gridState) {
    const webHeight = height - 2 * tf; // Web height excludes flanges
    const cellH = webHeight / gridRows;
    const cellW = width / gridCols;
    webGridOverlay = [];

    // First add the grid lines
    for (let r = 0; r <= gridRows; r++) {
      webGridOverlay.push(
        <line
          key={`web-grid-h-${r}`}
          x1={0}
          y1={tf + r * cellH}
          x2={width}
          y2={tf + r * cellH}
          stroke={colors.grid.lines.stroke}
          strokeWidth={colors.grid.lines.strokeWidth}
        />
      );
    }
    for (let c = 0; c <= gridCols; c++) {
      webGridOverlay.push(
        <line
          key={`web-grid-v-${c}`}
          x1={c * cellW}
          y1={tf}
          x2={c * cellW}
          y2={height - tf}
          stroke={colors.grid.lines.stroke}
          strokeWidth={colors.grid.lines.strokeWidth}
        />
      );
    }

    // Then add the condition state cells
    for (let r = 0; r < gridRows; r++) {
      if (!Array.isArray(gridState[r])) continue;
      for (let c = 0; c < gridCols; c++) {
        if (gridState[r][c] !== colors.grid.web.intact) { // Only show non-intact cells
          webGridOverlay.push(
            <rect
              key={`web-cell-${r}-${c}`}
              x={c * cellW}
              y={tf + r * cellH}
              width={cellW}
              height={cellH}
              fill={gridState[r][c]}
              stroke="none"
              onClick={onGridCellClick ? () => onGridCellClick(r, c, false) : undefined}
              style={{ cursor: onGridCellClick ? 'pointer' : 'default' }}
            />
          );
        }
      }
    }
  }

  // Flange grid marks
  const flangeMarks = [];
  const flangeSpacing = flangeGridSize * scale;
  for (let x = 0; x <= width; x += flangeSpacing) {
    // Top flange marks
    flangeMarks.push(
      <line
        key={`top-mark-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={tf}
        stroke={colors.grid.lines.stroke}
        strokeWidth={colors.grid.lines.strokeWidth}
      />
    );
    // Bottom flange marks
    flangeMarks.push(
      <line
        key={`bottom-mark-${x}`}
        x1={x}
        y1={height - tf}
        x2={x}
        y2={height}
        stroke={colors.grid.lines.stroke}
        strokeWidth={colors.grid.lines.strokeWidth}
      />
    );
  }

  // Maker.js for outline/flanges with high contrast
  const model = getBeamElevationMakerModel(beam, length, scale);
  const svg = makerjs.exporter.toSVG(model, {
    stroke: colors.beam.stroke,
    strokeWidth: `${colors.beam.strokeWidth}`
  });

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.paper',
      p: 1
    }}>
      <Box sx={{ 
        position: 'relative', 
        width: width + 40, 
        height: height + 40, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        bgcolor: 'background.default', 
        border: '1px solid', 
        borderColor: 'divider' 
      }}>
        <svg width={width + 40} height={height + 40} viewBox={`0 0 ${width + 40} ${height + 40}`} style={{ position: 'absolute' }}>
          <g transform={`translate(20, 20)`}>
            {/* Grid overlays */}
            {webGridOverlay}
            {flangeMarks}
            {/* Beam outline with high contrast */}
            <g dangerouslySetInnerHTML={{ __html: svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<g').replace('</svg>', '</g>') }} />
          </g>
        </svg>
      </Box>
    </Box>
  );
}