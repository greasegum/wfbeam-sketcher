import { Box, Paper, Typography } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { colors } from '../config/theme';

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

// Utility to generate Paper.js path for a W-beam cross section
function getIBeamPath(beam: BeamProperties, scale: number, filletRadius = 0.25) {
  // All units in px
  const w = beam.flangeWidth * scale;
  const h = beam.depth * scale;
  const tw = beam.webThickness * scale;
  const tf = beam.flangeThickness * scale;
  const x0 = 20, y0 = 20; // margin

  // Create the path
  const path = new paper.Path();
  path.strokeColor = new paper.Color(colors.beam.stroke);
  path.strokeWidth = colors.beam.strokeWidth;
  path.closed = true;

  // Start from top left, go clockwise
  path.moveTo(new paper.Point(x0, y0)); // Top left
  path.lineTo(new paper.Point(x0 + w, y0)); // Top right
  path.lineTo(new paper.Point(x0 + w, y0 + tf)); // Top flange bottom right
  path.lineTo(new paper.Point(x0 + (w + tw)/2, y0 + tf)); // Web right
  path.lineTo(new paper.Point(x0 + (w + tw)/2, y0 + h - tf)); // Web right bottom
  path.lineTo(new paper.Point(x0 + w, y0 + h - tf)); // Bottom flange top right
  path.lineTo(new paper.Point(x0 + w, y0 + h)); // Bottom right
  path.lineTo(new paper.Point(x0, y0 + h)); // Bottom left
  path.lineTo(new paper.Point(x0, y0 + h - tf)); // Bottom flange top left
  path.lineTo(new paper.Point(x0 + (w - tw)/2, y0 + h - tf)); // Web left bottom
  path.lineTo(new paper.Point(x0 + (w - tw)/2, y0 + tf)); // Web left top
  path.lineTo(new paper.Point(x0, y0 + tf)); // Top flange bottom left
  path.closePath();

  return path;
}

// Utility to generate Paper.js path for a W-beam elevation
function getBeamElevationPath(beam: BeamProperties, length: number, scale: number) {
  // All units in px
  const w = length * scale;
  const h = beam.depth * scale;
  const tf = beam.flangeThickness * scale;
  const x0 = 20, y0 = 20; // margin

  // Create the path
  const path = new paper.Path();
  path.strokeColor = new paper.Color(colors.beam.stroke);
  path.strokeWidth = colors.beam.strokeWidth;

  // Create beam outline
  path.moveTo(new paper.Point(x0, y0));
  path.lineTo(new paper.Point(x0 + w, y0));
  path.lineTo(new paper.Point(x0 + w, y0 + h));
  path.lineTo(new paper.Point(x0, y0 + h));
  path.closePath();

  // Add flange lines
  const topFlangeLine = new paper.Path.Line({
    from: new paper.Point(x0, y0 + tf),
    to: new paper.Point(x0 + w, y0 + tf),
    strokeColor: new paper.Color(colors.beam.stroke),
    strokeWidth: colors.beam.strokeWidth
  });

  const bottomFlangeLine = new paper.Path.Line({
    from: new paper.Point(x0, y0 + h - tf),
    to: new paper.Point(x0 + w, y0 + h - tf),
    strokeColor: new paper.Color(colors.beam.stroke),
    strokeWidth: colors.beam.strokeWidth
  });

  return { outline: path, topFlange: topFlangeLine, bottomFlange: bottomFlangeLine };
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
  const path = getIBeamPath(beam, scale);
  const svg = path.exportSVG({ asString: true });

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
  const model = getBeamElevationPath(beam, length, scale);
  const svg = model.outline.exportSVG({ asString: true });

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
          </g>
        </svg>
      </Box>
    </Box>
  );
}