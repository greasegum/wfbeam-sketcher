import { List, ListItemButton, ListItemText, Typography, Paper } from '@mui/material';
import type { BeamProperties } from '../data/beamProperties';
import { standardBeams } from '../data/beamProperties';

interface BeamSelectorProps {
  onSelect: (beam: BeamProperties) => void;
  selectedBeam?: BeamProperties;
}

export function BeamSelector({ onSelect, selectedBeam }: BeamSelectorProps) {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        width: '100%',
        borderRadius: 0,
        mb: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
        Standard W-Beams
      </Typography>
      <List dense disablePadding>
        {standardBeams.map((beam) => (
          <ListItemButton
            key={beam.designation}
            onClick={() => onSelect(beam)}
            selected={selectedBeam?.designation === beam.designation}
            sx={{
              minHeight: 36,
              maxHeight: 36,
              px: 2,
              py: 0,
              fontSize: 13,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemText
              primary={
                <span style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block' }}>
                  {beam.designation} — Depth: {beam.depth}" | Flange: {beam.flangeWidth}" | {beam.weight} lb/ft
                </span>
              }
              primaryTypographyProps={{
                style: {
                  fontSize: 13,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
} 