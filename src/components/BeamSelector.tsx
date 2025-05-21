import { Paper, Typography, Select, MenuItem, FormControl, InputLabel, Box, Checkbox, FormControlLabel } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { standardBeams } from '../data/beamProperties';
import { PaperCanvas } from './PaperCanvas';
import { SketchModel } from '../models/SketchModel';
import { useEffect, useState } from 'react';

interface BeamSelectorProps {
  onSelect: (beam: BeamProperties) => void;
  selectedBeam?: BeamProperties;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
}

export function BeamSelector({ onSelect, selectedBeam, showGrid, onShowGridChange }: BeamSelectorProps) {
  const [model, setModel] = useState<SketchModel | null>(null);

  // Initialize or update model when beam changes
  useEffect(() => {
    if (!selectedBeam) {
      setModel(null);
      return;
    }

    // Calculate scale to fit cross-section in view
    const availableHeight = 200 - 80; // Container height minus margins
    const scaleToFit = Math.floor(availableHeight / selectedBeam.depth);
    
    const newModel = new SketchModel(selectedBeam, scaleToFit);
    setModel(newModel);
  }, [selectedBeam]);

  return (
    <Paper elevation={2} sx={{ 
      width: '100%', 
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 0, 
      bgcolor: 'background.paper',
      overflow: 'hidden'
    }}>
      {/* Beam Selection Controls */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 14, letterSpacing: 1, mb: 2 }}>
          Beam Profile
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="beam-select-label">Select W-Beam</InputLabel>
          <Select
            labelId="beam-select-label"
            value={selectedBeam?.designation || ''}
            label="Select W-Beam"
            onChange={(e) => {
              const beam = standardBeams.find(b => b.designation === e.target.value);
              if (beam) onSelect(beam);
            }}
            sx={{ 
              bgcolor: 'background.paper',
              '& .MuiSelect-select': {
                py: 1
              }
            }}
          >
            {standardBeams.map((beam) => (
              <MenuItem key={beam.designation} value={beam.designation}>
                {beam.designation} — {beam.depth}" × {beam.flangeWidth}" ({beam.weight} lb/ft)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={showGrid}
              onChange={(e) => onShowGridChange(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Show Grid
            </Typography>
          }
        />
      </Box>

      {/* Cross Section View */}
      {selectedBeam && model && (
        <Box sx={{ 
          height: 200,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}>
          <PaperCanvas
            model={model}
            width={selectedBeam.flangeWidth * model.getScale() + 80}
            height={selectedBeam.depth * model.getScale() + 80}
            selectedTool=""
            isElevation={false}
            showGrid={showGrid}
          />
        </Box>
      )}
    </Paper>
  );
}