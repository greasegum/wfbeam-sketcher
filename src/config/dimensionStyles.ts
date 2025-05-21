import { colors } from './theme';

export interface DimensionStyle {
  arrowSize: number;
  witnessExtension: number;
  textGap: number;
  strokeColor: string;
  strokeWidth: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  textPosition: 'left' | 'center' | 'right';
  extensionOffset: number;
  minSpaceForInside: number;
  textRotation: 'aligned' | 'horizontal' | 'above';
  scale: number;
}

// Base style following ANSI/ISO standards
export const baseStyle: DimensionStyle = {
  arrowSize: 2.5,
  witnessExtension: 2,
  textGap: 6,
  strokeColor: colors.dimensions.lines.stroke,
  strokeWidth: colors.dimensions.lines.strokeWidth,
  textColor: colors.dimensions.text.fill,
  fontSize: 10,
  fontFamily: 'Arial, sans-serif',
  textPosition: 'center',
  extensionOffset: 1,
  minSpaceForInside: 40,
  textRotation: 'horizontal',
  scale: 1.0
};

// ANSI standard style
export const ansiStyle: DimensionStyle = {
  ...baseStyle,
  arrowSize: 3,
  witnessExtension: 2.5,
  textGap: 8,
  fontSize: 12
};

// ISO standard style
export const isoStyle: DimensionStyle = {
  ...baseStyle,
  arrowSize: 2,
  witnessExtension: 2,
  textGap: 5,
  fontSize: 10
};

// Architectural style
export const architecturalStyle: DimensionStyle = {
  ...baseStyle,
  arrowSize: 2,
  witnessExtension: 3,
  textGap: 10,
  fontSize: 9,
  textRotation: 'aligned'
};

// Scale-aware style manager
export class DimensionStyleManager {
  private currentStyle: DimensionStyle;
  private viewportScale: number = 1.0;

  constructor(style: DimensionStyle = baseStyle) {
    this.currentStyle = { ...style };
  }

  setStyle(style: Partial<DimensionStyle>) {
    this.currentStyle = { ...this.currentStyle, ...style };
  }

  setViewportScale(scale: number) {
    this.viewportScale = scale;
    this.updateScaledProperties();
  }

  private updateScaledProperties() {
    // Keep text and arrows consistent size regardless of zoom
    const invScale = 1 / this.viewportScale;
    this.currentStyle.arrowSize *= invScale;
    this.currentStyle.fontSize *= invScale;
    this.currentStyle.textGap *= invScale;
    this.currentStyle.witnessExtension *= invScale;
  }

  getStyle(): DimensionStyle {
    return { ...this.currentStyle };
  }

  // Get scaled dimension for a given measurement
  getScaledDimension(value: number): string {
    if (value >= 12) {
      const feet = Math.floor(value / 12);
      const inches = value % 12;
      return `${feet}'-${inches > 0 ? inches + '"' : '0"'}`;
    }
    return `${value}"`;
  }
} 