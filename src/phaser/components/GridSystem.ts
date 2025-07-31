import Phaser from 'phaser';
import type { BeamProperties } from '../../data/beamProperties';

export interface GridData {
  webGrid: number[][];
  topFlangeGrid: number[];
  bottomFlangeGrid: number[];
}

export class GridSystem {
  private scene: Phaser.Scene;
  private gridData: GridData;
  private gridSprites: Map<string, Phaser.GameObjects.Rectangle>;
  private cellSize: number = 1; // 1 inch cells
  private scale: number = 20; // pixels per inch
  private gridOrigin: { x: number, y: number } = { x: 0, y: 0 };
  
  // Grid states
  private readonly INTACT = 0;
  private readonly MINOR = 1;
  private readonly MAJOR = 2;
  private readonly FULL = 3;
  
  // Colors
  private readonly STATE_COLORS = [
    0x90EE90, // Intact - matches beam color (transparent effect)
    0xFFB6C1, // Minor - light pink
    0xFF69B4, // Major - hot pink
    0xDC143C  // Full - crimson
  ];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gridData = {
      webGrid: [],
      topFlangeGrid: [],
      bottomFlangeGrid: []
    };
    this.gridSprites = new Map();
  }

  createGrid(
    beam: BeamProperties,
    length: number,
    x: number,
    y: number,
    scale: number,
    container: Phaser.GameObjects.Container,
    onCellClick: (row: number, col: number, isFlange: boolean) => void
  ) {
    this.gridOrigin = { x, y };
    this.scale = scale;
    const cellSizePx = this.cellSize * scale;
    
    // Calculate grid dimensions
    const webHeight = beam.depth - 2 * beam.flangeThickness;
    const webRows = Math.floor(webHeight / this.cellSize);
    const webCols = Math.floor(length / this.cellSize);
    const flangeCols = Math.floor(length / this.cellSize);
    
    // Initialize grid data
    this.gridData.webGrid = Array(webRows).fill(null).map(() => 
      Array(webCols).fill(this.INTACT)
    );
    this.gridData.topFlangeGrid = Array(flangeCols).fill(this.INTACT);
    this.gridData.bottomFlangeGrid = Array(flangeCols).fill(this.INTACT);
    
    // Clear existing sprites
    this.gridSprites.clear();
    
    // Create web grid cells
    const webStartY = y + beam.flangeThickness * scale;
    
    for (let row = 0; row < webRows; row++) {
      for (let col = 0; col < webCols; col++) {
        const cellX = x + col * cellSizePx;
        const cellY = webStartY + row * cellSizePx;
        
        const cell = this.createGridCell(
          cellX, cellY, cellSizePx, cellSizePx,
          row, col, false, container
        );
        
        cell.on('pointerdown', () => onCellClick(row, col, false));
        this.gridSprites.set(`web-${row}-${col}`, cell);
      }
    }
    
    // Create top flange grid cells
    for (let col = 0; col < flangeCols; col++) {
      const cellX = x + col * cellSizePx;
      const cellY = y;
      
      const cell = this.createGridCell(
        cellX, cellY, cellSizePx, beam.flangeThickness * scale,
        0, col, true, container
      );
      
      cell.on('pointerdown', () => onCellClick(0, col, true));
      this.gridSprites.set(`flange-top-${col}`, cell);
    }
    
    // Create bottom flange grid cells
    for (let col = 0; col < flangeCols; col++) {
      const cellX = x + col * cellSizePx;
      const cellY = y + (beam.depth - beam.flangeThickness) * scale;
      
      const cell = this.createGridCell(
        cellX, cellY, cellSizePx, beam.flangeThickness * scale,
        1, col, true, container
      );
      
      cell.on('pointerdown', () => onCellClick(1, col, true));
      this.gridSprites.set(`flange-bottom-${col}`, cell);
    }
  }

  private createGridCell(
    x: number,
    y: number,
    width: number,
    height: number,
    row: number,
    col: number,
    isFlange: boolean,
    container: Phaser.GameObjects.Container
  ): Phaser.GameObjects.Rectangle {
    const cell = this.scene.add.rectangle(x, y, width, height);
    cell.setOrigin(0, 0);
    cell.setStrokeStyle(0.5, 0x333333, 0.3);
    cell.setInteractive({ useHandCursor: true });
    
    // Hover effects
    cell.on('pointerover', () => {
      cell.setStrokeStyle(2, 0x00BFFF, 1);
      cell.setDepth(10);
    });
    
    cell.on('pointerout', () => {
      cell.setStrokeStyle(0.5, 0x333333, 0.3);
      cell.setDepth(0);
    });
    
    // Make initially transparent
    cell.setAlpha(0.01);
    
    container.add(cell);
    return cell;
  }

  toggleCell(row: number, col: number, isFlange: boolean) {
    if (isFlange) {
      const grid = row === 0 ? this.gridData.topFlangeGrid : this.gridData.bottomFlangeGrid;
      const key = row === 0 ? `flange-top-${col}` : `flange-bottom-${col}`;
      
      if (col < grid.length) {
        grid[col] = (grid[col] + 1) % 4;
        const cell = this.gridSprites.get(key);
        if (cell) {
          this.updateCellAppearance(cell, grid[col]);
        }
      }
    } else {
      if (row < this.gridData.webGrid.length && col < this.gridData.webGrid[row].length) {
        this.gridData.webGrid[row][col] = (this.gridData.webGrid[row][col] + 1) % 4;
        const cell = this.gridSprites.get(`web-${row}-${col}`);
        if (cell) {
          this.updateCellAppearance(cell, this.gridData.webGrid[row][col]);
        }
      }
    }
  }

  private updateCellAppearance(cell: Phaser.GameObjects.Rectangle, state: number) {
    if (state === this.INTACT) {
      cell.setAlpha(0.01);
      cell.setFillStyle(0x000000, 0);
    } else {
      cell.setAlpha(0.6);
      cell.setFillStyle(this.STATE_COLORS[state]);
    }
  }

  getGridData(): GridData {
    return this.gridData;
  }

  getCellSize(): number {
    return this.cellSize * this.scale;
  }

  getGridOrigin(): { x: number, y: number } {
    return this.gridOrigin;
  }
}