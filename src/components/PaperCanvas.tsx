import { useEffect, useRef } from 'react';
import paper from 'paper';
import type { SketchModel } from '../models/SketchModel';
import { colors } from '../config/theme';
import type { LayerState } from './LayerControl';
import { DimensionManager } from '../managers/DimensionManager';
import { baseStyle } from '../config/dimensionStyles';

interface PaperCanvasProps {
  model: SketchModel;
  width: number;
  height: number;
  selectedTool: string;
  isElevation?: boolean;
  showGrid?: boolean;
  onAnnotationAdd?: (annotation: any) => void;
  onAnnotationRemove?: (id: string) => void;
  onGridCellClick?: (row: number, col: number, isFlange: boolean) => void;
  layers?: LayerState;
}

export function PaperCanvas({ 
  model, 
  width, 
  height, 
  selectedTool,
  isElevation = true,
  showGrid = false,
  onAnnotationAdd,
  onAnnotationRemove,
  onGridCellClick,
  layers = {
    baseBeam: true,
    dimensions: true,
    controlGrid: true,
    conditions: true,
    annotations: true,
    hatching: true
  }
}: PaperCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Setup Paper.js
      const canvas = canvasRef.current;
      paper.setup(canvas);
      model.setPaperScope(paper);

      // Get beam and scale early since we'll need them
      const beam = model.getBeam();
      const scale = model.getScale();
      const gridState = model.getGridState();

      // Set up view margins and coordinate system
      const margin = 40; // Margin for dimensions and labels
      const viewRect = new paper.Rectangle(margin, margin, width - 2*margin, height - 2*margin);
      paper.view.center = viewRect.center;

      // Create layers
      const gridLayer = new paper.Layer(); // Background grid
      const baseLayer = new paper.Layer(); // Beam geometry
      const hatchingLayer = new paper.Layer(); // Material hatching
      const dimensionLayer = new paper.Layer(); // Dimensions
      const conditionLayer = new paper.Layer(); // Condition markup
      const annotationLayer = new paper.Layer(); // Annotations

      // Create beam geometry
      baseLayer.activate();
      const beamGroup = model.createGeometry(viewRect, isElevation);
      baseLayer.visible = layers.baseBeam;

      // Add steel hatching in cross-section view
      if (!isElevation && layers.hatching) {
        hatchingLayer.activate();
        const bounds = beamGroup.bounds;
        const hatchSpacing = colors.beam.hatching.spacing;
        const hatchAngle = colors.beam.hatching.angle;
        
        // Calculate diagonal length to ensure hatches cover the entire shape
        const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
        const numLines = Math.ceil(diagonal / hatchSpacing) * 2;
        
        // Create hatching lines
        for (let i = -numLines; i < numLines; i++) {
          const offset = i * hatchSpacing;
          const hatchLine = new paper.Path.Line({
            from: [bounds.left - diagonal, bounds.top + offset],
            to: [bounds.left + diagonal, bounds.top + offset],
            strokeColor: new paper.Color(colors.beam.hatching.stroke),
            strokeWidth: colors.beam.hatching.strokeWidth
          });
          
          // Rotate to 45 degrees
          hatchLine.rotate(hatchAngle, bounds.center);
          
          // Clip to beam outline
          const clipped = hatchLine.intersect(beamGroup.children[0]);
          hatchingLayer.addChild(clipped);
          hatchLine.remove();
        }

        // Create perpendicular hatching for cross pattern
        for (let i = -numLines; i < numLines; i++) {
          const offset = i * hatchSpacing;
          const hatchLine = new paper.Path.Line({
            from: [bounds.left - diagonal, bounds.top + offset],
            to: [bounds.left + diagonal, bounds.top + offset],
            strokeColor: new paper.Color(colors.beam.hatching.stroke),
            strokeWidth: colors.beam.hatching.strokeWidth
          });
          
          // Rotate to -45 degrees for perpendicular pattern
          hatchLine.rotate(-hatchAngle, bounds.center);
          
          // Clip to beam outline
          const clipped = hatchLine.intersect(beamGroup.children[0]);
          hatchingLayer.addChild(clipped);
          hatchLine.remove();
        }
      }
      hatchingLayer.visible = layers.hatching;

      // Draw measurement grid in elevation view only
      if (isElevation && showGrid) {
        gridLayer.activate();

        // Create subtle background grid
        const gridColor = new paper.Color(colors.grid.lines.stroke);
        gridColor.alpha = 0.15;

        for (let x = 0; x <= width; x += scale) {
          new paper.Path.Line({
            from: [x + margin, margin],
            to: [x + margin, height - margin],
            strokeColor: gridColor,
            strokeWidth: 0.5
          });
        }

        for (let y = 0; y <= height; y += scale) {
          new paper.Path.Line({
            from: [margin, y + margin],
            to: [width - margin, y + margin],
            strokeColor: gridColor,
            strokeWidth: 0.5
          });
        }

        // Create interactive grid overlay
        const overlayLayer = new paper.Layer();
        overlayLayer.activate();
        
        const webHeight = (beam.depth - 2 * beam.flangeThickness) * scale;
        const webTop = beam.flangeThickness * scale;
        const cellSize = gridState.webGridSize * scale;

        // Calculate grid origin relative to beam position
        const gridOrigin = beamGroup.bounds.topLeft;

        // Create web grid cells
        for (let row = 0; row < gridState.webGrid.length; row++) {
          for (let col = 0; col < gridState.webGrid[row].length; col++) {
            // Calculate position from bottom-left corner of web
            const x = gridOrigin.x + col * cellSize;
            // Invert row index to start from bottom
            const invertedRow = gridState.webGrid.length - 1 - row;
            const y = gridOrigin.y + beam.depth * scale - beam.flangeThickness * scale - (invertedRow + 1) * cellSize;
            
            const cell = new paper.Path.Rectangle({
              point: [x, y],
              size: [cellSize, cellSize],
              strokeColor: new paper.Color(colors.grid.lines.stroke),
              strokeWidth: colors.grid.lines.strokeWidth,
              fillColor: new paper.Color(gridState.webGrid[row][col])
            });

            // Store grid coordinates for interaction
            cell.data = { row, col, isFlange: false };

            // Add click handler
            cell.onClick = (event: paper.MouseEvent) => {
              if (selectedTool === 'grid') {
                onGridCellClick?.(row, col, false);
              }
            };
          }
        }

        // Create flange grids
        const flangeSpacing = gridState.flangeGridSize * scale;
        
        // Top flange grid
        gridState.topFlangeGrid.forEach((state, index) => {
          const x = gridOrigin.x + index * flangeSpacing;
          const cell = new paper.Path.Rectangle({
            point: [x, gridOrigin.y],
            size: [flangeSpacing, beam.flangeThickness * scale],
            strokeColor: new paper.Color(colors.grid.lines.stroke),
            strokeWidth: colors.grid.lines.strokeWidth,
            fillColor: new paper.Color(state)
          });

          cell.data = { row: 0, col: index, isFlange: true };
          cell.onClick = (event: paper.MouseEvent) => {
            if (selectedTool === 'grid') {
              onGridCellClick?.(0, index, true);
            }
          };
        });

        // Bottom flange grid
        gridState.bottomFlangeGrid.forEach((state, index) => {
          const x = gridOrigin.x + index * flangeSpacing;
          const y = gridOrigin.y + beam.depth * scale - beam.flangeThickness * scale;
          const cell = new paper.Path.Rectangle({
            point: [x, y],
            size: [flangeSpacing, beam.flangeThickness * scale],
            strokeColor: new paper.Color(colors.grid.lines.stroke),
            strokeWidth: colors.grid.lines.strokeWidth,
            fillColor: new paper.Color(state)
          });

          cell.data = { row: 1, col: index, isFlange: true };
          cell.onClick = (event: paper.MouseEvent) => {
            if (selectedTool === 'grid') {
              onGridCellClick?.(1, index, true);
            }
          };
        });

        // Setup interaction tools
        const gridTool = new paper.Tool();
        
        // Track last highlighted cell to prevent unnecessary updates
        let lastHighlightedCell: paper.Path | null = null;

        gridTool.onMouseMove = (event: paper.ToolEvent) => {
          if (selectedTool === 'grid') {
            // Reset last highlighted cell
            if (lastHighlightedCell) {
              lastHighlightedCell.strokeColor = new paper.Color(colors.grid.lines.stroke);
              lastHighlightedCell.strokeWidth = colors.grid.lines.strokeWidth;
              lastHighlightedCell = null;
            }

            // Highlight cell under cursor
            const hitResult = overlayLayer.hitTest(event.point);
            if (hitResult?.item && hitResult.item instanceof paper.Path) {
              hitResult.item.strokeColor = new paper.Color(colors.primary.main);
              hitResult.item.strokeWidth = 2;
              lastHighlightedCell = hitResult.item;
            }
          }
        };
      }
      gridLayer.visible = layers.controlGrid;

      // Draw dimensions
      if (layers.dimensions) {
        dimensionLayer.activate();
        const dimManager = new DimensionManager(paper, baseStyle);
        const beam = model.getBeam();
        const scale = model.getScale();
        const w = model.length * scale;
        const h = beam.depth * scale;
        const tf = beam.flangeThickness * scale;
        const tw = beam.webThickness * scale;
        const margin = 40;

        // Overall depth (vertical, left)
        dimManager.addDimension(
          { x: margin - 10, y: margin },
          { x: margin - 10, y: margin + h },
          `${beam.depth}\"`
        );
        // Flange width (horizontal, top)
        dimManager.addDimension(
          { x: margin, y: margin - 10 },
          { x: margin + w, y: margin - 10 },
          `${beam.flangeWidth}\"`
        );
        // Web thickness (horizontal, at web center)
        dimManager.addDimension(
          { x: margin + (w - tw) / 2, y: margin + h / 2 + 20 },
          { x: margin + (w + tw) / 2, y: margin + h / 2 + 20 },
          `${beam.webThickness}\"`
        );
        // Flange thickness (vertical, at left flange)
        dimManager.addDimension(
          { x: margin + 10, y: margin },
          { x: margin + 10, y: margin + tf },
          `${beam.flangeThickness}\"`
        );
        // Add all dimension groups to the dimension layer
        dimManager.getDimensions().forEach(dim => {
          dimensionLayer.addChild(dim.getGroup());
        });
        dimensionLayer.visible = true;
      } else {
        dimensionLayer.visible = false;
      }

      // Draw condition markup
      if (layers.conditions) {
        conditionLayer.activate();
        // ... condition markup drawing code ...
      }
      conditionLayer.visible = layers.conditions;

      // Draw annotations
      if (layers.annotations) {
        annotationLayer.activate();
        // ... annotation drawing code ...
      }
      annotationLayer.visible = layers.annotations;

      // Cleanup
      return () => {
        paper.project.clear();
        paper.tools.forEach(tool => tool.remove());
      };
    } catch (error) {
      console.error('Error in PaperCanvas:', error);
    }
  }, [model, width, height, selectedTool, isElevation, showGrid, layers]);

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: ['grid', 'callout'].includes(selectedTool) ? 'auto' : 'none'
      }}
    />
  );
} 