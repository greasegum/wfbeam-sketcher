import { createTheme, type ThemeOptions } from '@mui/material';

// Color palette definition
export const colors = {
  primary: {
    main: '#00bfff', // cyan/blue accent
    light: '#33ccff',
    dark: '#0099cc',
  },
  secondary: {
    main: '#ffb300', // gold accent
    light: '#ffc233',
    dark: '#cc8f00',
  },
  background: {
    default: '#181a1b',
    paper: '#232526',
  },
  text: {
    primary: '#fff',
    secondary: '#b0b0b0',
  },
  divider: '#333',
  beam: {
    stroke: '#ffffff',      // High contrast white for beam outlines
    strokeWidth: 1.5,       // Thicker lines for better visibility
    hatching: {
      stroke: 'rgba(255,255,255,0.3)', // Semi-transparent white for hatching
      strokeWidth: 0.5,
      spacing: 3,           // Pixels between hatch lines
      angle: 45            // Degrees for hatching
    }
  },
  grid: {
    lines: {
      stroke: 'rgba(255,255,255,0.15)',  // Subtle grid lines
      strokeWidth: 0.5,
    },
    web: {
      intact: 'rgba(0,191,255,0.05)',    // Almost invisible when intact
      corroded: 'rgba(255,180,0,0.8)',   // Bright amber/gold
      section_loss: 'rgba(255,60,0,0.8)', // Bright orange-red
      perforated: 'rgba(220,20,60,0.8)',  // Crimson red
    },
    flange: {
      intact: 'rgba(0,191,255,0.05)',    // Almost invisible when intact
      corroded: 'rgba(255,180,0,0.8)',   // Bright amber/gold
      section_loss: 'rgba(255,60,0,0.8)', // Bright orange-red
      perforated: 'rgba(220,20,60,0.8)',  // Crimson red
    }
  },
};

// Theme configuration
export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...colors,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
};

// Create and export the theme
export const theme = createTheme(themeOptions);

// Export common style configurations
export const commonStyles = {
  sidebar: {
    width: 280,
    collapsedWidth: 0,
  },
  statusBar: {
    height: 48,
  },
  toolPalette: {
    width: 56,
  },
  layerControl: {
    width: 280,
  },
  buffer: {
    min: 20,
    max: 100,
    step: 10,
  },
  grid: {
    web: {
      minSize: 0.5,    // Web grid 0.5" to 3"
      maxSize: 2.0,
      step: 0.5,
    },
    flange: {
      minSize: 1.0,    // Flange marks 1" to 6"
      maxSize: 4.0,
      step: 1.0,
    }
  },
  zoom: {
    min: 0.25,  // 1:4 scale
    max: 4,      // 4:1 scale
    step: 0.25, // Step by standard scale factors
    baseScale: 20, // 20px per inch base scale
  },
};

// Add scale ratios for display
export const scaleRatios = {
  0.125: '1:8',
  0.25: '1:4',
  0.5: '1:2',
  1: '1:1',
  2: '2:1',
  4: '4:1'
}; 