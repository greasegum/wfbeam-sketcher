import { colors } from '../config/theme';

interface DimensionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  offset?: number;
  text: string;
  orientation?: 'horizontal' | 'vertical';
  textPosition?: 'start' | 'middle' | 'end';
}

interface DimensionOverlayProps {
  width: number;
  height: number;
  scale: number;
  beam: {
    depth: number;
    flangeWidth: number;
    flangeThickness: number;
    webThickness: number;
  };
  showOrdinate?: boolean;
  showDepth?: boolean;
  showFlangeWidth?: boolean;
}

function Dimension({ x1, y1, x2, y2, offset = 30, text, orientation = 'horizontal', textPosition = 'middle' }: DimensionProps) {
  const isVertical = orientation === 'vertical';
  const arrowSize = 6;
  const textOffset = 15;
  
  // Extension lines
  const ext1Start = isVertical ? [x1, y1] : [x1, y1];
  const ext1End = isVertical ? [x1 - offset, y1] : [x1, y1 + offset];
  const ext2Start = isVertical ? [x2, y2] : [x2, y2];
  const ext2End = isVertical ? [x2 - offset, y2] : [x2, y2 + offset];
  
  // Dimension line
  const dimStart = isVertical ? [x1 - offset, y1] : [x1, y1 + offset];
  const dimEnd = isVertical ? [x2 - offset, y2] : [x2, y2 + offset];
  
  // Text position
  const textX = isVertical ? 
    x1 - offset - textOffset :
    x1 + (x2 - x1) * (textPosition === 'middle' ? 0.5 : textPosition === 'end' ? 1 : 0);
  const textY = isVertical ?
    y1 + (y2 - y1) * (textPosition === 'middle' ? 0.5 : textPosition === 'end' ? 1 : 0) :
    y1 + offset + textOffset;
  
  return (
    <g>
      {/* Extension lines */}
      <line
        x1={ext1Start[0]}
        y1={ext1Start[1]}
        x2={ext1End[0]}
        y2={ext1End[1]}
        stroke={colors.beam.stroke}
        strokeWidth={0.5}
      />
      <line
        x1={ext2Start[0]}
        y1={ext2Start[1]}
        x2={ext2End[0]}
        y2={ext2End[1]}
        stroke={colors.beam.stroke}
        strokeWidth={0.5}
      />
      
      {/* Dimension line */}
      <line
        x1={dimStart[0]}
        y1={dimStart[1]}
        x2={dimEnd[0]}
        y2={dimEnd[1]}
        stroke={colors.beam.stroke}
        strokeWidth={1}
      />
      
      {/* Arrows */}
      <path
        d={isVertical ?
          `M${dimStart[0]-arrowSize} ${dimStart[1]} L${dimStart[0]} ${dimStart[1]} L${dimStart[0]-arrowSize} ${dimStart[1]+arrowSize}` :
          `M${dimStart[0]} ${dimStart[1]+arrowSize} L${dimStart[0]} ${dimStart[1]} L${dimStart[0]+arrowSize} ${dimStart[1]+arrowSize}`
        }
        stroke={colors.beam.stroke}
        fill="none"
      />
      <path
        d={isVertical ?
          `M${dimEnd[0]-arrowSize} ${dimEnd[1]-arrowSize} L${dimEnd[0]} ${dimEnd[1]} L${dimEnd[0]-arrowSize} ${dimEnd[1]}` :
          `M${dimEnd[0]-arrowSize} ${dimEnd[1]+arrowSize} L${dimEnd[0]} ${dimEnd[1]} L${dimEnd[0]} ${dimEnd[1]-arrowSize}`
        }
        stroke={colors.beam.stroke}
        fill="none"
      />
      
      {/* Dimension text */}
      <text
        x={textX}
        y={textY}
        textAnchor={textPosition === 'middle' ? 'middle' : textPosition === 'end' ? 'end' : 'start'}
        dominantBaseline={isVertical ? 'middle' : 'hanging'}
        fill={colors.beam.stroke}
        fontSize="12"
        fontFamily="monospace"
      >
        {text}
      </text>
    </g>
  );
}

export function DimensionOverlay({ width, height, scale, beam, showOrdinate = true, showDepth = true, showFlangeWidth = true }: DimensionOverlayProps) {
  // Create ordinate dimensions
  const ordinateDimensions = [];
  if (showOrdinate) {
    const dimSpacing = 12 * scale; // 12 inch increments
    for (let x = 0; x <= width; x += dimSpacing) {
      ordinateDimensions.push(
        <Dimension
          key={`ordinate-${x}`}
          x1={x}
          y1={height}
          x2={x}
          y2={height}
          text={createOrdinateDimension(x, scale)}
        />
      );
    }
  }

  // Create depth dimensions
  const depthDimensions = [];
  if (showDepth) {
    // Overall depth
    depthDimensions.push(
      <Dimension
        key="depth-overall"
        x1={width + 20}
        y1={0}
        x2={width + 20}
        y2={height}
        text={`${beam.depth}"`}
        orientation="vertical"
      />
    );
    
    // Web depth
    const webStart = beam.flangeThickness * scale;
    const webEnd = height - beam.flangeThickness * scale;
    depthDimensions.push(
      <Dimension
        key="depth-web"
        x1={width + 60}
        y1={webStart}
        x2={width + 60}
        y2={webEnd}
        text={`${beam.depth - 2 * beam.flangeThickness}"`}
        orientation="vertical"
      />
    );
  }

  // Create flange width dimensions
  const flangeWidthDimensions = [];
  if (showFlangeWidth) {
    // Top flange
    flangeWidthDimensions.push(
      <Dimension
        key="width-top"
        x1={0}
        y1={-30}
        x2={beam.flangeWidth * scale}
        y2={-30}
        text={`${beam.flangeWidth}"`}
        offset={20}
      />
    );
    
    // Bottom flange
    flangeWidthDimensions.push(
      <Dimension
        key="width-bottom"
        x1={0}
        y1={height + 60}
        x2={beam.flangeWidth * scale}
        y2={height + 60}
        text={`${beam.flangeWidth}"`}
        offset={20}
      />
    );
  }

  return (
    <g>
      {ordinateDimensions}
      {depthDimensions}
      {flangeWidthDimensions}
    </g>
  );
}

// Utility to create dimension text
function createOrdinateDimension(x: number, scale: number) {
  const inches = x / scale;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  
  return feet > 0 ? 
    `${feet}'-${remainingInches > 0 ? remainingInches + '"' : '0"'}` : 
    `${remainingInches}"`;
} 