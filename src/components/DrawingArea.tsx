import { Box } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { PaperCanvas } from './PaperCanvas';
import { SketchModel } from '../models/SketchModel';
import { useEffect, useState } from 'react';
import { commonStyles } from '../config/theme';
import type { LayerState } from './LayerControl';

interface DrawingAreaProps {
  selectedBeam?: BeamProperties;
  selectedTool: string;
  gridSize: number;
  elevationZoom: number;
  buffer: number;
  elevationHeight: number;
  profileHeight: number;
  gridRows: number;
  gridCols: number;
  gridState: string[][];
  onGridCellClick: (row: number, col: number, isFlange: boolean) => void;
  showGrid: boolean;
  layers: LayerState;
}

export function DrawingArea({
  selectedBeam,
  selectedTool,
  gridSize,
  elevationZoom,
  buffer,
  elevationHeight,
  profileHeight,
  gridRows,
  gridCols,
  gridState,
  onGridCellClick,
  showGrid,
  layers
}: DrawingAreaProps) {
  const [model, setModel] = useState<SketchModel | null>(null);

  // Initialize or update model when beam changes
  useEffect(() => {
    if (!selectedBeam) {
      setModel(null);
      return;
    }

    const newModel = new SketchModel(selectedBeam, commonStyles.zoom.baseScale * elevationZoom);
    newModel.initializeGrids(gridRows, gridCols);
    setModel(newModel);
  }, [selectedBeam, elevationZoom, gridRows, gridCols]);

  if (!selectedBeam || !model) {
    return (
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <p>Select a beam to begin</p>
      </Box>
    );
  }

  // Calculate dimensions
  const length = 60; // inches (5 ft)
  const beamHeight = selectedBeam.depth * model.getScale();
  const beamWidth = length * model.getScale();

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Main elevation view */}
      <Box sx={{ 
        flex: 1,
        minHeight: 0,
        position: 'relative',
        bgcolor: '#232526',
        border: '2px solid #444',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <PaperCanvas
          model={model}
          width={beamWidth + 120}
          height={beamHeight + 120}
          selectedTool={selectedTool}
          isElevation={true}
          onGridCellClick={onGridCellClick}
          showGrid={showGrid && layers.controlGrid}
          layers={layers}
        />
      </Box>
    </Box>
  );
}