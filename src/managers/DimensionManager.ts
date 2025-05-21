import * as paper from 'paper';
import { TechnicalDimension, DimensionPoint, DimensionOptions } from '../components/TechnicalDimension';
import { DimensionStyle } from '../config/dimensionStyles';

interface DimensionBounds {
  dimension: TechnicalDimension;
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
    start: DimensionPoint,
    end: DimensionPoint,
    text: string,
    options: DimensionOptions = {}
  ): TechnicalDimension {
    // Calculate initial offset
    const offset = this.calculateOptimalOffset(start, end);

    // Create dimension
    const dimension = new TechnicalDimension(
      this.paper,
      start,
      end,
      offset,
      text,
      {
        ...options,
        style: { ...this.defaultStyle, ...options.style }
      }
    );

    // Store dimension with its bounds
    this.dimensions.push({
      dimension,
      bounds: dimension.getGroup().bounds
    });

    // Optimize placement if needed
    this.optimizePlacement();

    return dimension;
  }

  private calculateOptimalOffset(start: DimensionPoint, end: DimensionPoint): number {
    const isHorizontal = Math.abs(end.y - start.y) < Math.abs(end.x - start.x);
    let baseOffset = this.spacing;

    // Find existing dimensions in the same direction
    const existingDimensions = this.dimensions.filter(d => {
      const dimBounds = d.bounds;
      if (isHorizontal) {
        return dimBounds.intersects(new this.paper.Rectangle(
          new this.paper.Point(Math.min(start.x, end.x), Math.min(start.y, end.y) - this.spacing),
          new this.paper.Point(Math.max(start.x, end.x), Math.max(start.y, end.y) + this.spacing)
        ));
      } else {
        return dimBounds.intersects(new this.paper.Rectangle(
          new this.paper.Point(Math.min(start.x, end.x) - this.spacing, Math.min(start.y, end.y)),
          new this.paper.Point(Math.max(start.x, end.x) + this.spacing, Math.max(start.y, end.y))
        ));
      }
    });

    // Increment offset based on existing dimensions
    existingDimensions.forEach(d => {
      if (isHorizontal) {
        baseOffset = Math.max(baseOffset, d.bounds.height + this.spacing);
      } else {
        baseOffset = Math.max(baseOffset, d.bounds.width + this.spacing);
      }
    });

    return baseOffset;
  }

  private optimizePlacement() {
    let changed = true;
    let iterations = 0;
    const maxIterations = 10;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      // Check each dimension against all others
      for (let i = 0; i < this.dimensions.length; i++) {
        const dim1 = this.dimensions[i];
        for (let j = i + 1; j < this.dimensions.length; j++) {
          const dim2 = this.dimensions[j];

          if (this.checkCollision(dim1.bounds, dim2.bounds)) {
            // Adjust position of the newer dimension
            this.adjustDimensionPosition(dim1, dim2);
            changed = true;
          }
        }
      }
    }
  }

  private checkCollision(bounds1: paper.Rectangle, bounds2: paper.Rectangle): boolean {
    // Add padding to bounds for better spacing
    const padding = this.spacing;
    const b1 = bounds1.expand(padding);
    const b2 = bounds2.expand(padding);
    return b1.intersects(b2);
  }

  private adjustDimensionPosition(dim1: DimensionBounds, dim2: DimensionBounds) {
    // Determine if dimensions are horizontal or vertical
    const isHorizontal1 = dim1.bounds.height < dim1.bounds.width;
    const isHorizontal2 = dim2.bounds.height < dim2.bounds.width;

    if (isHorizontal1 === isHorizontal2) {
      // Parallel dimensions - stack them
      if (isHorizontal1) {
        // Adjust vertical position
        const newOffset = dim1.bounds.top - dim2.bounds.height - this.spacing;
        // Update dimension position
        // Implementation depends on how your TechnicalDimension handles position updates
      } else {
        // Adjust horizontal position
        const newOffset = dim1.bounds.left - dim2.bounds.width - this.spacing;
        // Update dimension position
      }
    } else {
      // Perpendicular dimensions - move to avoid intersection
      // Implementation depends on your specific needs
    }
  }

  public updateViewportScale(scale: number) {
    this.viewportScale = scale;
    this.dimensions.forEach(dim => {
      dim.dimension.update(scale);
      dim.bounds = dim.dimension.getGroup().bounds;
    });
    this.optimizePlacement();
  }

  public clear() {
    this.dimensions = [];
  }

  public getDimensions(): TechnicalDimension[] {
    return this.dimensions.map(d => d.dimension);
  }
} 