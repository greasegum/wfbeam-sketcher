import { Box, Paper, Typography } from '@mui/material';
import * as makerjs from 'makerjs';
import type { BeamProperties } from '../data/beamProperties';
import { colors } from '../config/theme';
import { DimensionOverlay } from './DimensionOverlay';

interface BeamRendererProps {
  beam: BeamProperties;
  scale: number;
  gridRows?: number;
  gridCols?: number;
  gridState?: string[][];
  topFlangeGrid?: string[];
  bottomFlangeGrid?: string[];
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

  // Create paths for the beam outline and flanges only
  const model: makerjs.IModel = {
    paths: {
      // Outer rectangle using lines
      outlineTop: new makerjs.paths.Line([0, 0], [w, 0]),
      outlineRight: new makerjs.paths.Line([w, 0], [w, h]),
      outlineBottom: new makerjs.paths.Line([w, h], [0, h]),
      outlineLeft: new makerjs.paths.Line([0, h], [0, 0]),
      // Top flange line
      topFlangeLine: new makerjs.paths.Line([0, tf], [w, tf]),
      // Bottom flange line
      bottomFlangeLine: new makerjs.paths.Line([0, h - tf], [w, h - tf])
    },
    origin: [20, 20]
  };

  return model;
}

// Utility to create dimension text and lines
function createOrdinateDimension(x: number, scale: number) {
  const inches = x / scale;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  
  return feet > 0 ? 
    `${feet}'-${remainingInches > 0 ? remainingInches + '"' : '0"'}` : 
    `${remainingInches}"`;
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
  topFlangeGrid,
  bottomFlangeGrid,
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

    // First add the grid lines
    const gridLines = [];
    // Horizontal grid lines
    for (let r = 0; r <= gridRows; r++) {
      gridLines.push(
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
    // Vertical grid lines
    for (let c = 0; c <= gridCols; c++) {
      gridLines.push(
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
    const conditionCells = [];
    for (let r = 0; r < gridRows; r++) {
      if (!Array.isArray(gridState[r])) continue;
      for (let c = 0; c < gridCols; c++) {
        if (gridState[r][c] !== colors.grid.web.intact) { // Only show non-intact cells
          conditionCells.push(
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

    webGridOverlay = [...gridLines, ...conditionCells];
  }

  // Flange grid marks and condition states
  const flangeElements = [];
  if (topFlangeGrid && bottomFlangeGrid) {
    const flangeSpacing = flangeGridSize * scale;
    
    // Add flange grid lines
    for (let x = 0; x <= width; x += flangeSpacing) {
      // Top flange marks
      flangeElements.push(
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
      flangeElements.push(
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

    // Add flange condition states
    const flangeWidth = flangeSpacing;
    // Top flange conditions
    topFlangeGrid.forEach((state, index) => {
      if (state !== colors.grid.flange.intact) {
        flangeElements.push(
          <rect
            key={`top-flange-${index}`}
            x={index * flangeWidth}
            y={0}
            width={flangeWidth}
            height={tf}
            fill={state}
            stroke="none"
            onClick={onGridCellClick ? () => onGridCellClick(0, index, true) : undefined}
            style={{ cursor: onGridCellClick ? 'pointer' : 'default' }}
          />
        );
      }
    });
    // Bottom flange conditions
    bottomFlangeGrid.forEach((state, index) => {
      if (state !== colors.grid.flange.intact) {
        flangeElements.push(
          <rect
            key={`bottom-flange-${index}`}
            x={index * flangeWidth}
            y={height - tf}
            width={flangeWidth}
            height={tf}
            fill={state}
            stroke="none"
            onClick={onGridCellClick ? () => onGridCellClick(1, index, true) : undefined}
            style={{ cursor: onGridCellClick ? 'pointer' : 'default' }}
          />
        );
      }
    });
  }

  // Maker.js for beam outline with high contrast
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
        width: width + 120, // Increased width for vertical dimensions
        height: height + 120, // Increased height for horizontal dimensions
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        bgcolor: 'background.default', 
        border: '1px solid', 
        borderColor: 'divider' 
      }}>
        <svg 
          width={width + 120} 
          height={height + 120} 
          viewBox={`-30 -30 ${width + 120} ${height + 120}`} 
          style={{ position: 'absolute' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <g>
            {/* Grid overlays */}
            {webGridOverlay}
            {flangeElements}
            {/* Beam outline with high contrast */}
            <g dangerouslySetInnerHTML={{ __html: svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<g').replace('</svg>', '</g>') }} />
            {/* Dimension overlay */}
            <DimensionOverlay
              width={width}
              height={height}
              scale={scale}
              beam={beam}
              showOrdinate={true}
              showDepth={true}
              showFlangeWidth={true}
            />
          </g>
        </svg>
      </Box>
    </Box>
  );
}