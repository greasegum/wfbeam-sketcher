import { Box, Paper, Typography } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';

interface BeamRendererProps {
  beam: BeamProperties;
  scale: number;
}

// Utility to generate SVG path for a W-beam cross section with fillets
function getIBeamPath(beam: BeamProperties, scale: number, filletRadius = 0.25) {
  // All units in px
  const w = beam.flangeWidth * scale;
  const h = beam.depth * scale;
  const tw = beam.webThickness * scale;
  const tf = beam.flangeThickness * scale;
  const r = filletRadius * scale;

  // Key points (starting at top left flange, moving clockwise)
  // Fillets are approximated with SVG arc commands
  const x0 = 40, y0 = 40; // margin
  const x1 = x0;
  const x2 = x0 + (w - tw) / 2 - r;
  const x3 = x0 + (w - tw) / 2;
  const x4 = x0 + (w + tw) / 2;
  const x5 = x0 + (w + tw) / 2 + r;
  const x6 = x0 + w;
  const y1 = y0;
  const y2 = y0 + tf - r;
  const y3 = y0 + tf;
  const y4 = y0 + h - tf;
  const y5 = y0 + h - tf + r;
  const y6 = y0 + h;

  // Path string
  return [
    // Top flange
    `M ${x1} ${y1}`,
    `L ${x6} ${y1}`,
    `L ${x6} ${y3}`,
    // Top right fillet
    `L ${x5} ${y3}`,
    `A ${r} ${r} 0 0 0 ${x4} ${y3 + r}`,
    // Web right
    `L ${x4} ${y4 - r}`,
    // Bottom right fillet
    `A ${r} ${r} 0 0 0 ${x5} ${y4}`,
    `L ${x6} ${y4}`,
    `L ${x6} ${y6}`,
    `L ${x1} ${y6}`,
    `L ${x1} ${y4}`,
    // Bottom left fillet
    `L ${x2} ${y4}`,
    `A ${r} ${r} 0 0 0 ${x3} ${y4 - r}`,
    // Web left
    `L ${x3} ${y3 + r}`,
    // Top left fillet
    `A ${r} ${r} 0 0 0 ${x2} ${y3}`,
    `L ${x1} ${y3}`,
    'Z',
  ].join(' ');
}

// Helper for dimension lines with outside arrows and broken leaders
function DimLine({ x1, y1, x2, y2, label, outside = false, leader = false, vertical = false }: any) {
  const arrowLen = 12;
  const leaderLen = 18;
  const color = '#00bfff';
  let path = '';
  let labelX = (x1 + x2) / 2;
  let labelY = (y1 + y2) / 2;
  if (outside) {
    // Draw arrows outside the measured points
    if (vertical) {
      path = `M ${x1} ${y1} L ${x1} ${y1 - arrowLen}` +
        ` M ${x2} ${y2} L ${x2} ${y2 + arrowLen}`;
      labelY = y1 - arrowLen - 6;
    } else {
      path = `M ${x1} ${y1} L ${x1 - arrowLen} ${y1}` +
        ` M ${x2} ${y2} L ${x2 + arrowLen} ${y2}`;
      labelX = x2 + arrowLen + 18;
    }
  } else {
    // Standard inside arrows
    path = `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  // Broken leader (jog)
  let leaderPath = '';
  if (leader) {
    if (vertical) {
      leaderPath = `M ${x1} ${y1} L ${x1 - leaderLen} ${y1 - leaderLen}`;
      labelX = x1 - leaderLen - 8;
      labelY = y1 - leaderLen - 6;
    } else {
      leaderPath = `M ${x2} ${y2} L ${x2 + leaderLen} ${y2 + leaderLen}`;
      labelX = x2 + leaderLen + 8;
      labelY = y2 + leaderLen + 6;
    }
  }
  return (
    <g>
      <path d={path} stroke={color} strokeWidth={1.5} markerEnd={!outside ? 'url(#arrow)' : undefined} />
      {leader && <path d={leaderPath} stroke={color} strokeWidth={1.2} strokeDasharray="4,3" />}
      <text
        x={labelX}
        y={labelY}
        fill={color}
        fontSize="13"
        fontWeight="bold"
        textAnchor={vertical ? 'end' : 'start'}
        alignmentBaseline={vertical ? 'middle' : 'hanging'}
      >
        {label}
      </text>
    </g>
  );
}

export function BeamCrossSection({ beam, scale }: BeamRendererProps) {
  const w = beam.flangeWidth * scale;
  const h = beam.depth * scale;
  const tw = beam.webThickness * scale;
  const tf = beam.flangeThickness * scale;
  const r = 0.25 * scale; // fillet radius
  const svgW = w + 80;
  const svgH = h + 80;
  const x0 = 40;
  const y0 = 40;

  // Key points for dimensioning
  const topY = y0;
  const botY = y0 + h;
  const leftX = x0;
  const rightX = x0 + w;
  const webLeft = x0 + (w - tw) / 2;
  const webRight = x0 + (w + tw) / 2;
  const flangeTop = y0;
  const flangeBot = y0 + tf;
  const flangeBot2 = y0 + h - tf;
  const flangeBot3 = y0 + h;

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
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ position: 'absolute' }}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,4 L8,2 L8,6 Z" fill="#00bfff" />
            </marker>
          </defs>
          {/* I-beam outline with fillets */}
          <path
            d={getIBeamPath(beam, scale, 0.25)}
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
          />
          {/* Overall width dimension (top) */}
          <DimLine
            x1={leftX}
            y1={topY - 18}
            x2={rightX}
            y2={topY - 18}
            label={`${beam.flangeWidth}"`}
            outside
          />
          {/* Overall depth dimension (right) */}
          <DimLine
            x1={rightX + 18}
            y1={topY}
            x2={rightX + 18}
            y2={botY}
            label={`${beam.depth}"`}
            outside
            vertical
          />
          {/* Web thickness (center, with outside arrows and broken leader) */}
          <DimLine
            x1={webLeft}
            y1={(flangeTop + flangeBot2) / 2}
            x2={webRight}
            y2={(flangeTop + flangeBot2) / 2}
            label={`${beam.webThickness}"`}
            outside
            leader
          />
          {/* Flange thickness (left, with outside arrows and broken leader) */}
          <DimLine
            x1={leftX - 18}
            y1={flangeTop}
            x2={leftX - 18}
            y2={flangeBot}
            label={`${beam.flangeThickness}"`}
            outside
            leader
            vertical
          />
          {/* Flange thickness (left, bottom, with outside arrows and broken leader) */}
          <DimLine
            x1={leftX - 18}
            y1={flangeBot2}
            x2={leftX - 18}
            y2={flangeBot3}
            label={`${beam.flangeThickness}"`}
            outside
            leader
            vertical
          />
        </svg>
      </Box>
    </Paper>
  );
}

export function BeamElevation({ beam, scale }: BeamRendererProps) {
  const length = 72; // 6 feet in inches
  const height = beam.depth * scale;
  const width = length * scale;
  const flangeThickness = beam.flangeThickness * scale;

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
      <Typography variant="h6" sx={{ color: 'primary.main' }}>Elevation - {beam.designation}</Typography>
      <Box
        sx={{
          position: 'relative',
          width: width + 40,
          height: height + 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute' }}
        >
          {/* Beam outline */}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
          {/* Top flange edge */}
          <rect
            x={0}
            y={0}
            width={width}
            height={flangeThickness}
            fill="#fff"
            fillOpacity={0.15}
            stroke="#00bfff"
            strokeWidth="1"
          />
          {/* Bottom flange edge */}
          <rect
            x={0}
            y={height - flangeThickness}
            width={width}
            height={flangeThickness}
            fill="#fff"
            fillOpacity={0.15}
            stroke="#00bfff"
            strokeWidth="1"
          />
        </svg>

        {/* Dimensions */}
        <Box sx={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', color: 'primary.main', fontWeight: 600 }}>
          <Typography variant="caption">{length}"</Typography>
        </Box>
        <Box sx={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', color: 'primary.main', fontWeight: 600 }}>
          <Typography variant="caption">{beam.depth}"</Typography>
        </Box>
      </Box>
    </Paper>
  );
} 