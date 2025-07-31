import Phaser from 'phaser';
import type { GridData } from '../components/GridSystem';

export interface Contour {
  path: Phaser.Curves.Path;
  color: number;
  strokeColor: number;
  state: number;
}

export class MarchingSquares {
  // Colors for different states
  private readonly STATE_COLORS = [
    0x90EE90, // Intact - shouldn't appear in contours
    0xFFB6C1, // Minor - light pink
    0xFF69B4, // Major - hot pink
    0xDC143C  // Full - crimson
  ];

  generateContours(
    gridData: GridData,
    cellSize: number,
    origin: { x: number, y: number }
  ): Contour[] {
    const contours: Contour[] = [];
    
    // Process each state level (1, 2, 3)
    for (let state = 1; state <= 3; state++) {
      // Process web grid
      const webContours = this.processGrid(
        gridData.webGrid,
        state,
        cellSize,
        origin.x,
        origin.y + cellSize // Offset for flange thickness
      );
      contours.push(...webContours);
      
      // Process flange grids
      const topFlangeContours = this.processFlangeGrid(
        gridData.topFlangeGrid,
        state,
        cellSize,
        origin.x,
        origin.y,
        cellSize // Height of flange
      );
      contours.push(...topFlangeContours);
      
      // Bottom flange would need the beam height to position correctly
      // For now, focusing on web and top flange
    }
    
    return contours;
  }

  private processGrid(
    grid: number[][],
    targetState: number,
    cellSize: number,
    offsetX: number,
    offsetY: number
  ): Contour[] {
    const contours: Contour[] = [];
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    
    if (rows === 0 || cols === 0) return contours;
    
    // Create a binary grid for the target state
    const binaryGrid = grid.map(row => 
      row.map(cell => cell >= targetState ? 1 : 0)
    );
    
    // Track visited cells
    const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    // Find all regions
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (binaryGrid[row][col] === 1 && !visited[row][col]) {
          const region = this.findRegion(binaryGrid, visited, row, col);
          if (region.length > 0) {
            const contour = this.createContourFromRegion(
              region,
              cellSize,
              offsetX,
              offsetY,
              targetState
            );
            if (contour) {
              contours.push(contour);
            }
          }
        }
      }
    }
    
    return contours;
  }

  private processFlangeGrid(
    grid: number[],
    targetState: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    height: number
  ): Contour[] {
    const contours: Contour[] = [];
    let start = -1;
    
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] >= targetState) {
        if (start === -1) start = i;
      } else if (start !== -1) {
        // Create rectangle for continuous region
        const path = new Phaser.Curves.Path(offsetX + start * cellSize, offsetY);
        const width = (i - start) * cellSize;
        
        path.lineTo(offsetX + start * cellSize + width, offsetY);
        path.lineTo(offsetX + start * cellSize + width, offsetY + height);
        path.lineTo(offsetX + start * cellSize, offsetY + height);
        path.closePath();
        
        contours.push({
          path,
          color: this.STATE_COLORS[targetState],
          strokeColor: this.STATE_COLORS[targetState],
          state: targetState
        });
        
        start = -1;
      }
    }
    
    // Handle case where region extends to end
    if (start !== -1) {
      const path = new Phaser.Curves.Path(offsetX + start * cellSize, offsetY);
      const width = (grid.length - start) * cellSize;
      
      path.lineTo(offsetX + start * cellSize + width, offsetY);
      path.lineTo(offsetX + start * cellSize + width, offsetY + height);
      path.lineTo(offsetX + start * cellSize, offsetY + height);
      path.closePath();
      
      contours.push({
        path,
        color: this.STATE_COLORS[targetState],
        strokeColor: this.STATE_COLORS[targetState],
        state: targetState
      });
    }
    
    return contours;
  }

  private findRegion(
    grid: number[][],
    visited: boolean[][],
    startRow: number,
    startCol: number
  ): Array<{ row: number, col: number }> {
    const region: Array<{ row: number, col: number }> = [];
    const stack: Array<{ row: number, col: number }> = [{ row: startRow, col: startCol }];
    
    while (stack.length > 0) {
      const { row, col } = stack.pop()!;
      
      if (row < 0 || row >= grid.length || 
          col < 0 || col >= grid[0].length ||
          visited[row][col] || grid[row][col] === 0) {
        continue;
      }
      
      visited[row][col] = true;
      region.push({ row, col });
      
      // Add neighbors (8-way connectivity for smoother contours)
      const neighbors = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      
      for (const [dr, dc] of neighbors) {
        stack.push({ row: row + dr, col: col + dc });
      }
    }
    
    return region;
  }

  private createContourFromRegion(
    region: Array<{ row: number, col: number }>,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    state: number
  ): Contour | null {
    if (region.length === 0) return null;
    
    // Find boundary points
    const boundary = this.findBoundary(region);
    if (boundary.length < 3) return null;
    
    // Create smooth path through boundary points
    const path = new Phaser.Curves.Path(
      offsetX + (boundary[0].col + 0.5) * cellSize,
      offsetY + (boundary[0].row + 0.5) * cellSize
    );
    
    // Add curves through remaining points
    for (let i = 1; i < boundary.length; i++) {
      const point = boundary[i];
      const x = offsetX + (point.col + 0.5) * cellSize;
      const y = offsetY + (point.row + 0.5) * cellSize;
      
      // Use quadratic bezier for smoother curves
      if (i < boundary.length - 1) {
        const nextPoint = boundary[i + 1];
        const nextX = offsetX + (nextPoint.col + 0.5) * cellSize;
        const nextY = offsetY + (nextPoint.row + 0.5) * cellSize;
        
        const controlX = x;
        const controlY = y;
        
        path.quadraticBezierTo(
          new Phaser.Math.Vector2(controlX, controlY),
          new Phaser.Math.Vector2((x + nextX) / 2, (y + nextY) / 2)
        );
        i++; // Skip next point as we've used it
      } else {
        path.lineTo(x, y);
      }
    }
    
    path.closePath();
    
    return {
      path,
      color: this.STATE_COLORS[state],
      strokeColor: this.STATE_COLORS[state],
      state
    };
  }

  private findBoundary(region: Array<{ row: number, col: number }>): Array<{ row: number, col: number }> {
    const cellSet = new Set(region.map(c => `${c.row},${c.col}`));
    const boundary: Array<{ row: number, col: number }> = [];
    
    // Find cells on the boundary
    for (const cell of region) {
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
    
    // Sort boundary points to form a continuous path
    if (boundary.length === 0) return [];
    
    const sorted: Array<{ row: number, col: number }> = [boundary[0]];
    const remaining = new Set(boundary.slice(1));
    
    while (remaining.size > 0 && sorted.length < boundary.length) {
      const last = sorted[sorted.length - 1];
      let closest: { row: number, col: number } | null = null;
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
}