import * as paper from 'paper';
import type { DimensionStyle } from '../config/dimensionStyles';

interface DimensionBounds {
  group: paper.Group;
  bounds: paper.Rectangle;
}

export class DimensionManager {
  private paper: typeof paper;
  private dimensions: DimensionBounds[] = [];
  private viewportScale: number = 1.0;
  private defaultStyle: DimensionStyle;
  private spacing: number = 10;

  constructor(paper: typeof paper, defaultStyle: DimensionStyle) {
    this.paper = paper;
    this.defaultStyle = defaultStyle;
  }

  addDimension(
    start: { x: number; y: number },
    end: { x: number; y: number },
    text: string,
    options: Partial<DimensionStyle> = {}
  ): paper.Group {
    // Merge style
    const style = { ...this.defaultStyle, ...options };
    // Calculate offset for dimension line
    const offset = this.calculateOptimalOffset(start, end);
    // Direction vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length; // normal x
    const ny = dx / length;  // normal y
    // Offset points
    const offsetStart = {
      x: start.x + nx * offset,
      y: start.y + ny * offset
    };
    const offsetEnd = {
      x: end.x + nx * offset,
      y: end.y + ny * offset
    };
    // Create dimension line
    const dimLine = new this.paper.Path.Line({
      from: new this.paper.Point(offsetStart.x, offsetStart.y),
      to: new this.paper.Point(offsetEnd.x, offsetEnd.y),
      strokeColor: style.strokeColor,
      strokeWidth: style.strokeWidth
    });
    // Create extension lines
    const extLine1 = new this.paper.Path.Line({
      from: new this.paper.Point(start.x, start.y),
      to: new this.paper.Point(offsetStart.x, offsetStart.y),
      strokeColor: style.strokeColor,
      strokeWidth: style.strokeWidth
    });
    const extLine2 = new this.paper.Path.Line({
      from: new this.paper.Point(end.x, end.y),
      to: new this.paper.Point(offsetEnd.x, offsetEnd.y),
      strokeColor: style.strokeColor,
      strokeWidth: style.strokeWidth
    });
    // Create text label
    const mid = {
      x: (offsetStart.x + offsetEnd.x) / 2,
      y: (offsetStart.y + offsetEnd.y) / 2
    };
    const label = new this.paper.PointText({
      point: new this.paper.Point(mid.x, mid.y - style.textGap),
      content: text,
      justification: 'center',
      fontSize: style.fontSize,
      fillColor: style.textColor,
      fontFamily: style.fontFamily
    });
    // Group all elements
    const group = new this.paper.Group([dimLine, extLine1, extLine2, label]);
    this.dimensions.push({ group, bounds: group.bounds });
    this.optimizePlacement();
    return group;
  }

  private calculateOptimalOffset(start: { x: number; y: number }, end: { x: number; y: number }): number {
    // For now, just return spacing; can be improved for stacking
    return this.spacing;
  }

  private optimizePlacement() {
    // No-op for now; can be implemented for advanced collision avoidance
  }

  public updateViewportScale(scale: number) {
    this.viewportScale = scale;
    // Optionally update dimension styles based on scale
    this.dimensions.forEach(dim => {
      // Could update font size, line width, etc.
    });
  }

  public clear() {
    this.dimensions.forEach(dim => dim.group.remove());
    this.dimensions = [];
  }

  public getDimensions(): paper.Group[] {
    return this.dimensions.map(d => d.group);
  }
} 