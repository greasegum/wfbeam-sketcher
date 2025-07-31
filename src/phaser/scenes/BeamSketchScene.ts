import Phaser from 'phaser';
import type { BeamProperties } from '../../data/beamProperties';
import { BeamRenderer } from '../components/BeamRenderer';
import { GridSystem } from '../components/GridSystem';
import { MarchingSquares } from '../utils/MarchingSquares';

export class BeamSketchScene extends Phaser.Scene {
  private beam?: BeamProperties;
  private beamRenderer?: BeamRenderer;
  private gridSystem?: GridSystem;
  private marchingSquares?: MarchingSquares;
  
  // Display settings
  private scale: number = 20; // pixels per inch
  private beamLength: number = 60; // 5 feet in inches
  
  // Layers
  private backgroundLayer!: Phaser.GameObjects.Container;
  private beamLayer!: Phaser.GameObjects.Container;
  private gridLayer!: Phaser.GameObjects.Container;
  private sectionLossLayer!: Phaser.GameObjects.Container;
  private dimensionLayer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'BeamSketchScene' });
  }

  preload() {
    // No assets to preload for now
  }

  create() {
    console.log('BeamSketchScene.create() called');
    
    // Create layers in order (back to front)
    this.backgroundLayer = this.add.container(0, 0);
    this.beamLayer = this.add.container(0, 0);
    this.sectionLossLayer = this.add.container(0, 0);
    this.gridLayer = this.add.container(0, 0);
    this.dimensionLayer = this.add.container(0, 0);
    
    // Initialize components
    this.beamRenderer = new BeamRenderer(this);
    this.gridSystem = new GridSystem(this);
    this.marchingSquares = new MarchingSquares();
    
    // Set up camera
    this.cameras.main.setBackgroundColor('#232526');
    
    // Add a test rectangle to verify rendering works
    const testRect = this.add.rectangle(400, 300, 200, 100, 0xff0000);
    console.log('Added test rectangle:', testRect);
    
    // Set up input
    this.setupInput();
    
    // Initial render if beam is set
    if (this.beam) {
      console.log('Initial beam set, rendering:', this.beam);
      this.renderBeam();
    }
  }

  private setupInput() {
    // Enable camera controls
    const cursors = this.input.keyboard?.createCursorKeys();
    
    // Mouse wheel zoom
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.25, 4);
      this.cameras.main.setZoom(newZoom);
    });
    
    // Middle mouse pan
    let isPanning = false;
    let lastPointerPosition = { x: 0, y: 0 };
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown()) {
        isPanning = true;
        lastPointerPosition = { x: pointer.x, y: pointer.y };
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isPanning && pointer.middleButtonDown()) {
        const deltaX = pointer.x - lastPointerPosition.x;
        const deltaY = pointer.y - lastPointerPosition.y;
        
        this.cameras.main.scrollX -= deltaX / this.cameras.main.zoom;
        this.cameras.main.scrollY -= deltaY / this.cameras.main.zoom;
        
        lastPointerPosition = { x: pointer.x, y: pointer.y };
      }
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonReleased()) {
        isPanning = false;
      }
    });
  }

  setBeam(beam: BeamProperties) {
    console.log('BeamSketchScene.setBeam() called with:', beam);
    this.beam = beam;
    if (this.scene.isActive()) {
      console.log('Scene is active, rendering beam');
      this.renderBeam();
    } else {
      console.log('Scene is not active yet');
    }
  }

  private renderBeam() {
    console.log('renderBeam() called', { beam: this.beam, beamRenderer: this.beamRenderer, gridSystem: this.gridSystem });
    if (!this.beam || !this.beamRenderer || !this.gridSystem) {
      console.error('Missing required components for rendering');
      return;
    }
    
    // Clear existing content
    this.beamLayer.removeAll(true);
    this.gridLayer.removeAll(true);
    this.sectionLossLayer.removeAll(true);
    this.dimensionLayer.removeAll(true);
    
    // Calculate positions for both views
    const margin = 60;
    const crossSectionX = margin;
    const crossSectionY = margin;
    const elevationX = margin;
    const elevationY = crossSectionY + this.beam.depth * this.scale + margin * 2;
    
    // Render cross-section
    this.beamRenderer.renderCrossSection(
      this.beam, 
      crossSectionX, 
      crossSectionY, 
      this.scale,
      this.beamLayer
    );
    
    // Render elevation
    this.beamRenderer.renderElevation(
      this.beam,
      this.beamLength,
      elevationX,
      elevationY,
      this.scale,
      this.beamLayer
    );
    
    // Set up grid system
    this.gridSystem.createGrid(
      this.beam,
      this.beamLength,
      elevationX,
      elevationY,
      this.scale,
      this.gridLayer,
      (row: number, col: number, isFlange: boolean) => {
        this.onGridCellClick(row, col, isFlange);
      }
    );
    
    // Center camera on content
    const totalHeight = elevationY + this.beam.depth * this.scale + margin;
    const totalWidth = elevationX + this.beamLength * this.scale + margin;
    this.cameras.main.centerOn(totalWidth / 2, totalHeight / 2);
  }

  private onGridCellClick(row: number, col: number, isFlange: boolean) {
    if (!this.gridSystem || !this.marchingSquares) return;
    
    // Toggle cell state
    this.gridSystem.toggleCell(row, col, isFlange);
    
    // Get updated grid data
    const gridData = this.gridSystem.getGridData();
    
    // Generate contours using marching squares
    const contours = this.marchingSquares.generateContours(
      gridData,
      this.gridSystem.getCellSize(),
      this.gridSystem.getGridOrigin()
    );
    
    // Clear and redraw section loss
    this.sectionLossLayer.removeAll(true);
    
    // Draw contours
    contours.forEach(contour => {
      const graphics = this.add.graphics();
      graphics.fillStyle(contour.color, 0.7);
      graphics.lineStyle(2, contour.strokeColor);
      
      // Draw the path manually since Phaser paths work differently
      const points = contour.path.getPoints();
      if (points.length > 0) {
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
      }
      
      this.sectionLossLayer.add(graphics);
    });
  }

  update(time: number, delta: number) {
    // Update animations or interactive elements if needed
  }
}