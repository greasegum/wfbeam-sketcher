import paper from 'paper';
import { colors } from '../config/theme';

export interface GridCell {
  row: number;
  col: number;
  value: number; // 0 = intact, 1 = minor loss, 2 = major loss, 3 = full loss
}

export interface ContourOptions {
  cellSize: number;
  smoothing: number;
  offset: { x: number; y: number };
}

/**
 * Generates smooth contours from grid data using marching squares algorithm
 */
export class ContourGenerator {
  private paperScope: paper.PaperScope;

  constructor(paperScope: paper.PaperScope) {
    this.paperScope = paperScope;
  }

  /**
   * Generate contours for a specific condition level
   */
  generateContours(
    grid: string[][],
    conditionColor: string,
    options: ContourOptions
  ): paper.Path[] {
    const paths: paper.Path[] = [];
    const processed = new Set<string>();

    // Find all connected regions of the same condition
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const key = `${row},${col}`;
        if (processed.has(key) || grid[row][col] === colors.grid.web.intact) {
          continue;
        }

        if (grid[row][col] === conditionColor) {
          const region = this.findConnectedRegion(grid, row, col, conditionColor, processed);
          if (region.length > 0) {
            const contour = this.createContourPath(region, options);
            if (contour) {
              paths.push(contour);
            }
          }
        }
      }
    }

    return paths;
  }

  /**
   * Find all connected cells of the same condition using flood fill
   */
  private findConnectedRegion(
    grid: string[][],
    startRow: number,
    startCol: number,
    targetColor: string,
    processed: Set<string>
  ): GridCell[] {
    const region: GridCell[] = [];
    const stack: [number, number][] = [[startRow, startCol]];

    while (stack.length > 0) {
      const [row, col] = stack.pop()!;
      const key = `${row},${col}`;

      if (
        row < 0 || row >= grid.length ||
        col < 0 || col >= grid[0].length ||
        processed.has(key) ||
        grid[row][col] !== targetColor
      ) {
        continue;
      }

      processed.add(key);
      region.push({ row, col, value: 1 });

      // Check all 8 neighbors for smoother contours
      const neighbors = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

      for (const [dr, dc] of neighbors) {
        stack.push([row + dr, col + dc]);
      }
    }

    return region;
  }

  /**
   * Create a smooth contour path from a region of cells
   */
  private createContourPath(region: GridCell[], options: ContourOptions): paper.Path | null {
    if (region.length === 0) return null;

    // Find the boundary cells
    const boundary = this.findBoundary(region);
    if (boundary.length < 3) return null;

    // Convert boundary to points
    const points = boundary.map(cell => {
      const x = options.offset.x + (cell.col + 0.5) * options.cellSize;
      const y = options.offset.y + (cell.row + 0.5) * options.cellSize;
      return new this.paperScope.Point(x, y);
    });

    // Create path
    const path = new this.paperScope.Path(points);
    path.closed = true;

    // Smooth the path
    path.smooth({ type: 'catmull-rom', factor: options.smoothing });

    // Expand path slightly to create organic overlap
    const expandedPath = this.expandPath(path, options.cellSize * 0.3);

    return expandedPath;
  }

  /**
   * Find boundary cells of a region
   */
  private findBoundary(region: GridCell[]): GridCell[] {
    const cellSet = new Set(region.map(c => `${c.row},${c.col}`));
    const boundary: GridCell[] = [];

    for (const cell of region) {
      // Check if any neighbor is outside the region
      const neighbors = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];

      for (const [dr, dc] of neighbors) {
        const neighborKey = `${cell.row + dr},${cell.col + dc}`;
        if (!cellSet.has(neighborKey)) {
          boundary.push(cell);
          break;
        }
      }
    }

    // Sort boundary cells to create a continuous path
    return this.sortBoundary(boundary);
  }

  /**
   * Sort boundary cells to form a continuous path
   */
  private sortBoundary(boundary: GridCell[]): GridCell[] {
    if (boundary.length === 0) return [];

    const sorted: GridCell[] = [boundary[0]];
    const remaining = new Set(boundary.slice(1));

    while (remaining.size > 0 && sorted.length < boundary.length) {
      const last = sorted[sorted.length - 1];
      let closest: GridCell | null = null;
      let minDist = Infinity;

      for (const cell of remaining) {
        const dist = Math.abs(cell.row - last.row) + Math.abs(cell.col - last.col);
        if (dist < minDist) {
          minDist = dist;
          closest = cell;
        }
      }

      if (closest && minDist <= 2) {
        sorted.push(closest);
        remaining.delete(closest);
      } else {
        break;
      }
    }

    return sorted;
  }

  /**
   * Expand a path outward to create organic overlap
   */
  private expandPath(path: paper.Path, amount: number): paper.Path {
    // Create offset path using Paper.js offsetting
    const expanded = path.clone();
    
    // Scale from center
    const center = expanded.bounds.center;
    expanded.scale(1.1, center);
    
    return expanded;
  }

  /**
   * Generate flange contours (simpler rectangular regions)
   */
  generateFlangeContours(
    flangeGrid: string[],
    isTop: boolean,
    beamBounds: paper.Rectangle,
    flangeThickness: number,
    gridSize: number
  ): paper.Path[] {
    const paths: paper.Path[] = [];
    let start = -1;

    for (let i = 0; i < flangeGrid.length; i++) {
      if (flangeGrid[i] !== colors.grid.flange.intact) {
        if (start === -1) start = i;
      } else if (start !== -1) {
        // Create contour for the region
        const x = beamBounds.left + start * gridSize;
        const width = (i - start) * gridSize;
        const y = isTop ? beamBounds.top : beamBounds.bottom - flangeThickness;

        const rect = new this.paperScope.Path.Rectangle({
          point: [x, y],
          size: [width, flangeThickness],
          radius: gridSize * 0.2
        });

        paths.push(rect);
        start = -1;
      }
    }

    // Handle case where loss extends to the end
    if (start !== -1) {
      const x = beamBounds.left + start * gridSize;
      const width = (flangeGrid.length - start) * gridSize;
      const y = isTop ? beamBounds.top : beamBounds.bottom - flangeThickness;

      const rect = new this.paperScope.Path.Rectangle({
        point: [x, y],
        size: [width, flangeThickness],
        radius: gridSize * 0.2
      });

      paths.push(rect);
    }

    return paths;
  }
}