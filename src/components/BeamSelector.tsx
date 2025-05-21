import { Paper, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { standardBeams } from '../data/beamProperties';

interface BeamSelectorProps {
  onSelect: (beam: BeamProperties) => void;
  selectedBeam?: BeamProperties;
}

export function BeamSelector({ onSelect, selectedBeam }: BeamSelectorProps) {
  return (
    <Paper elevation={2} sx={{ width: '100%', p: 2, borderRadius: 0, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 14, letterSpacing: 1, mb: 2 }}>
        Beam Profile
      </Typography>
      <FormControl fullWidth size="small">
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
    </Paper>
  );
}