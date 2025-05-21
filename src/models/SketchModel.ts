import * as makerjs from 'makerjs';
import type { BeamProperties } from '../data/beamProperties';
import { colors } from '../config/theme';

export interface GridState {
  webGrid: string[][];
  topFlangeGrid: string[];
  bottomFlangeGrid: string[];
  webGridSize: number;
  flangeGridSize: number;
}

export interface GridCell {
  row: number;
  col: number;
  state: string;
  isFlange: boolean;
}

export interface Contour {
  id: string;
  cells: GridCell[];
  type: 'section_loss' | 'perforation';
  path?: paper.Path;
}

export interface Annotation {
  id: string;
  type: 'callout' | 'leader' | 'measurement';
  position: { x: number; y: number };
  text: string;
  points?: { x: number; y: number }[];
}

export class SketchModel {
  private beam: BeamProperties;
  private scale: number;
  private gridState: GridState;
  private annotations: Annotation[];
  private contours: Contour[];
  private paperScope?: paper.PaperScope;
  private beamGroup?: paper.Group;
  private length: number = 60; // 5 feet in inches
  private filletRadius: number = 0.25; // 1/4 inch fillet radius

  constructor(beam: BeamProperties, scale: number = 10) {
    this.beam = beam;
    this.scale = scale;
    this.annotations = [];
    this.contours = [];
    this.gridState = {
      webGrid: [],
      topFlangeGrid: [],
      bottomFlangeGrid: [],
      webGridSize: 1.0,
      flangeGridSize: 2.0
    };
  }

  // Create beam geometry using Paper.js
  private createBeamGeometry(viewRect: paper.Rectangle): paper.Group {
    if (!this.paperScope) throw new Error('Paper.js scope not initialized');

    const group = new this.paperScope.Group();
    const { depth, flangeWidth, flangeThickness, webThickness } = this.beam;
    const w = this.length * this.scale;
    const h = depth * this.scale;
    const tf = flangeThickness * this.scale;
    const tw = webThickness * this.scale;

    // Create beam outline
    const outline = new this.paperScope.Path.Rectangle({
      point: [0, 0],
      size: [w, h],
      strokeColor: new this.paperScope.Color(colors.beam.stroke),
      strokeWidth: colors.beam.strokeWidth
    });
    group.addChild(outline);

    // Create flange lines
    const topFlangeLine = new this.paperScope.Path.Line({
      from: [0, tf],
      to: [w, tf],
      strokeColor: new this.paperScope.Color(colors.beam.stroke),
      strokeWidth: colors.beam.strokeWidth
    });
    group.addChild(topFlangeLine);

    const bottomFlangeLine = new this.paperScope.Path.Line({
      from: [0, h - tf],
      to: [w, h - tf],
      strokeColor: new this.paperScope.Color(colors.beam.stroke),
      strokeWidth: colors.beam.strokeWidth
    });
    group.addChild(bottomFlangeLine);

    // Create web centerline
    const webCenterX = w / 2;
    const webCenterLine = new this.paperScope.Path.Line({
      from: [webCenterX, tf],
      to: [webCenterX, h - tf],
      strokeColor: new this.paperScope.Color(colors.beam.stroke),
      strokeWidth: colors.beam.strokeWidth * 0.5,
      dashArray: [5, 5]
    });
    group.addChild(webCenterLine);

    // Position group in view
    group.position = viewRect.center;
    this.beamGroup = group;
    return group;
  }

  // Create cross-section geometry using Paper.js
  private createCrossSectionGeometry(viewRect: paper.Rectangle): paper.Group {
    if (!this.paperScope) throw new Error('Paper.js scope not initialized');

    const group = new this.paperScope.Group();
    const { depth, flangeWidth, flangeThickness, webThickness } = this.beam;
    const w = flangeWidth * this.scale;
    const h = depth * this.scale;
    const tf = flangeThickness * this.scale;
    const tw = webThickness * this.scale;
    const r = this.filletRadius * this.scale; // Fillet radius

    // Create the outline path
    const outline = new this.paperScope.Path();
    outline.strokeColor = new this.paperScope.Color(colors.beam.stroke);
    outline.strokeWidth = colors.beam.strokeWidth;
    outline.closed = true;

    // Start from top left, go clockwise
    outline.moveTo(new this.paperScope.Point(0, 0)); // Top left
    outline.lineTo(new this.paperScope.Point(w, 0)); // Top right
    outline.lineTo(new this.paperScope.Point(w, tf)); // Top flange bottom right

    // Add fillet at top right web intersection
    const topRightFillet = new this.paperScope.Path.Arc({
      from: new this.paperScope.Point(w, tf),
      through: new this.paperScope.Point((w + tw) / 2, tf + r),
      to: new this.paperScope.Point((w + tw) / 2, tf + r)
    });
    outline.join(topRightFillet);

    // Web right side
    outline.lineTo(new this.paperScope.Point((w + tw) / 2, h - tf - r));

    // Add fillet at bottom right web intersection
    const bottomRightFillet = new this.paperScope.Path.Arc({
      from: new this.paperScope.Point((w + tw) / 2, h - tf - r),
      through: new this.paperScope.Point((w + tw) / 2, h - tf),
      to: new this.paperScope.Point(w, h - tf)
    });
    outline.join(bottomRightFillet);

    outline.lineTo(new this.paperScope.Point(w, h)); // Bottom right
    outline.lineTo(new this.paperScope.Point(0, h)); // Bottom left
    outline.lineTo(new this.paperScope.Point(0, h - tf)); // Bottom flange top left

    // Add fillet at bottom left web intersection
    const bottomLeftFillet = new this.paperScope.Path.Arc({
      from: new this.paperScope.Point(0, h - tf),
      through: new this.paperScope.Point((w - tw) / 2, h - tf),
      to: new this.paperScope.Point((w - tw) / 2, h - tf - r)
    });
    outline.join(bottomLeftFillet);

    // Web left side
    outline.lineTo(new this.paperScope.Point((w - tw) / 2, tf + r));

    // Add fillet at top left web intersection
    const topLeftFillet = new this.paperScope.Path.Arc({
      from: new this.paperScope.Point((w - tw) / 2, tf + r),
      through: new this.paperScope.Point((w - tw) / 2, tf),
      to: new this.paperScope.Point(0, tf)
    });
    outline.join(topLeftFillet);

    outline.lineTo(new this.paperScope.Point(0, 0)); // Back to start
    outline.closePath();

    group.addChild(outline);

    // Center the cross-section in the view
    group.position = viewRect.center;

    // Add centerlines
    const verticalCenterline = new this.paperScope.Path.Line({
      from: new this.paperScope.Point(w/2, -h/4),
      to: new this.paperScope.Point(w/2, h + h/4),
      strokeColor: new this.paperScope.Color(colors.beam.stroke),
      strokeWidth: colors.beam.strokeWidth * 0.5,
      dashArray: [5, 5]
    });

    const horizontalCenterline = new this.paperScope.Path.Line({
      from: new this.paperScope.Point(-w/4, h/2),
      to: new this.paperScope.Point(w + w/4, h/2),
      strokeColor: new this.paperScope.Color(colors.beam.stroke),
      strokeWidth: colors.beam.strokeWidth * 0.5,
      dashArray: [5, 5]
    });

    group.addChild(verticalCenterline);
    group.addChild(horizontalCenterline);

    // Add dimensions
    const depthDimension = new this.paperScope.Group([
      new this.paperScope.Path.Line({
        from: new this.paperScope.Point(-w/4, 0),
        to: new this.paperScope.Point(-w/4, h),
        strokeColor: new this.paperScope.Color(colors.dimensions.lines.stroke),
        strokeWidth: colors.dimensions.lines.strokeWidth
      }),
      new this.paperScope.PointText({
        point: new this.paperScope.Point(-w/3, h/2),
        content: `${depth}"`,
        justification: 'right',
        fontSize: 10,
        fillColor: new this.paperScope.Color(colors.dimensions.text.fill)
      })
    ]);

    const widthDimension = new this.paperScope.Group([
      new this.paperScope.Path.Line({
        from: new this.paperScope.Point(0, h + h/4),
        to: new this.paperScope.Point(w, h + h/4),
        strokeColor: new this.paperScope.Color(colors.dimensions.lines.stroke),
        strokeWidth: colors.dimensions.lines.strokeWidth
      }),
      new this.paperScope.PointText({
        point: new this.paperScope.Point(w/2, h + h/3),
        content: `${flangeWidth}"`,
        justification: 'center',
        fontSize: 10,
        fillColor: new this.paperScope.Color(colors.dimensions.text.fill)
      })
    ]);

    group.addChild(depthDimension);
    group.addChild(widthDimension);

    this.beamGroup = group;
    return group;
  }

  // Export to Maker.js for printing
  getBaseGeometry(): makerjs.IModel {
    const w = this.length * this.scale;
    const h = this.beam.depth * this.scale;
    const tf = this.beam.flangeThickness * this.scale;

    return {
      paths: {
        outlineTop: new makerjs.paths.Line([0, 0], [w, 0]),
        outlineRight: new makerjs.paths.Line([w, 0], [w, h]),
        outlineBottom: new makerjs.paths.Line([w, h], [0, h]),
        outlineLeft: new makerjs.paths.Line([0, h], [0, 0]),
        topFlangeLine: new makerjs.paths.Line([0, tf], [w, tf]),
        bottomFlangeLine: new makerjs.paths.Line([0, h - tf], [w, h - tf])
      },
      origin: [20, 20]
    };
  }

  // Grid state management
  initializeGrids(rows: number, cols: number) {
    this.gridState.webGrid = Array(rows).fill(null).map(() => 
      Array(cols).fill(colors.grid.web.intact)
    );

    this.gridState.topFlangeGrid = Array(Math.ceil(this.length / this.gridState.flangeGridSize))
      .fill(colors.grid.flange.intact);
    this.gridState.bottomFlangeGrid = Array(Math.ceil(this.length / this.gridState.flangeGridSize))
      .fill(colors.grid.flange.intact);
  }

  setGridCell(row: number, col: number, isFlange: boolean, state: string) {
    if (isFlange) {
      if (row === 0) {
        this.gridState.topFlangeGrid[col] = state;
      } else {
        this.gridState.bottomFlangeGrid[col] = state;
      }
    } else {
      if (this.gridState.webGrid[row]) {
        this.gridState.webGrid[row][col] = state;
      }
    }

    // Update contours when cell state changes
    this.updateContours(row, col, isFlange, state);
  }

  private updateContours(row: number, col: number, isFlange: boolean, state: string) {
    if (!this.paperScope) return;

    // Remove cell from existing contours
    this.contours = this.contours.filter(contour => {
      contour.cells = contour.cells.filter(cell => 
        !(cell.row === row && cell.col === col && cell.isFlange === isFlange)
      );
      return contour.cells.length > 0;
    });

    // Add to or create new contour if state is section loss or perforation
    if (state === colors.grid.web.section_loss || state === colors.grid.web.perforated) {
      const adjacentContour = this.findAdjacentContour(row, col, isFlange, state);
      if (adjacentContour) {
        adjacentContour.cells.push({ row, col, state, isFlange });
      } else {
        this.contours.push({
          id: `contour-${this.contours.length + 1}`,
          cells: [{ row, col, state, isFlange }],
          type: state === colors.grid.web.perforated ? 'perforation' : 'section_loss'
        });
      }
    }

    // Update Paper.js paths for all affected contours
    this.updateContourPaths();
  }

  private findAdjacentContour(row: number, col: number, isFlange: boolean, state: string): Contour | undefined {
    return this.contours.find(contour => {
      if (contour.cells[0].state !== state) return false;
      
      return contour.cells.some(cell => {
        if (cell.isFlange !== isFlange) return false;
        
        // Check 8-way adjacency
        const rowDiff = Math.abs(cell.row - row);
        const colDiff = Math.abs(cell.col - col);
        return rowDiff <= 1 && colDiff <= 1;
      });
    });
  }

  private updateContourPaths() {
    if (!this.paperScope) return;

    this.contours.forEach(contour => {
      // Remove existing path
      contour.path?.remove();

      // Create points for the contour
      const points = this.createContourPoints(contour);
      
      // Create new path
      contour.path = new this.paperScope.Path({
        segments: points,
        closed: true,
        strokeColor: contour.type === 'perforation' ? colors.grid.web.perforated : colors.grid.web.section_loss,
        strokeWidth: 2,
        fillColor: new this.paperScope.Color({
          hue: contour.type === 'perforation' ? 0 : 30,
          saturation: 0.8,
          brightness: 0.8,
          alpha: 0.3
        })
      });

      // Smooth the path
      contour.path.smooth({ type: 'continuous' });
    });
  }

  private createContourPoints(contour: Contour): paper.Point[] {
    if (!this.paperScope) return [];

    // Convert grid cells to boundary points
    const points: paper.Point[] = [];
    const cellSize = this.gridState.webGridSize * this.scale;
    
    contour.cells.forEach(cell => {
      if (cell.isFlange) {
        // Handle flange cells
        const y = cell.row === 0 ? 0 : this.beam.depth * this.scale;
        points.push(
          new this.paperScope.Point(cell.col * cellSize, y),
          new this.paperScope.Point((cell.col + 1) * cellSize, y)
        );
      } else {
        // Handle web cells
        const x = cell.col * cellSize;
        const y = this.beam.flangeThickness * this.scale + cell.row * cellSize;
        points.push(
          new this.paperScope.Point(x, y),
          new this.paperScope.Point(x + cellSize, y),
          new this.paperScope.Point(x + cellSize, y + cellSize),
          new this.paperScope.Point(x, y + cellSize)
        );
      }
    });

    // Sort points to form a proper polygon
    return this.sortPointsForContour(points);
  }

  private sortPointsForContour(points: paper.Point[]): paper.Point[] {
    if (points.length < 3) return points;

    // Find centroid
    const centroid = points.reduce((acc, point) => 
      acc.add(point), new this.paperScope!.Point(0, 0)
    ).divide(points.length);

    // Sort points by angle from centroid
    return points.sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });
  }

  // Paper.js integration
  setPaperScope(scope: paper.PaperScope) {
    this.paperScope = scope;
    this.initializePaperItems();
  }

  private initializePaperItems() {
    if (!this.paperScope) return;

    // Create Paper.js items for interactive elements
    // This will be implemented when we add Paper.js for annotations
  }

  // Annotation management
  addAnnotation(annotation: Omit<Annotation, 'id'>) {
    const id = `annotation-${this.annotations.length + 1}`;
    this.annotations.push({ ...annotation, id });
    
    if (this.paperScope) {
      // Create corresponding Paper.js items for the annotation
      // This will be implemented when we add Paper.js
    }
  }

  removeAnnotation(id: string) {
    this.annotations = this.annotations.filter(a => a.id !== id);
    
    if (this.paperScope) {
      // Remove corresponding Paper.js items
      // This will be implemented when we add Paper.js
    }
  }

  // Getters for rendering
  getGridState(): GridState {
    return this.gridState;
  }

  getAnnotations(): Annotation[] {
    return this.annotations;
  }

  getBeam(): BeamProperties {
    return this.beam;
  }

  getScale(): number {
    return this.scale;
  }

  getContours(): Contour[] {
    return this.contours;
  }

  getBeamGroup(): paper.Group | undefined {
    return this.beamGroup;
  }

  createGeometry(viewRect: paper.Rectangle, isElevation: boolean = true): paper.Group {
    return isElevation ? 
      this.createBeamGeometry(viewRect) : 
      this.createCrossSectionGeometry(viewRect);
  }
} 