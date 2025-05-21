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
  },
  grid: {
    lines: {
      stroke: 'rgba(255,255,255,0.15)',  // Subtle grid lines
      strokeWidth: 0.5,
    },
    web: {
      intact: 'rgba(0,191,255,0.05)',    // Almost invisible when intact
      corroded: 'rgba(255,193,7,0.6)',   // Amber, more visible
      section_loss: 'rgba(255,87,34,0.7)', // Deep orange, very visible
      perforated: 'rgba(244,67,54,0.8)',  // Red, most visible
    },
    flange: {
      intact: 'rgba(0,191,255,0.05)',    // Almost invisible when intact
      corroded: 'rgba(255,193,7,0.6)',   // Amber, more visible
      section_loss: 'rgba(255,87,34,0.7)', // Deep orange, very visible
      perforated: 'rgba(244,67,54,0.8)',  // Red, most visible
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
    width: 72,
  },
  buffer: {
    min: 20,
    max: 100,
    step: 5,
  },
  grid: {
    web: {
      minSize: 0.5,    // Web grid 0.5" to 3"
      maxSize: 3.0,
      step: 0.5,
    },
    flange: {
      minSize: 1.0,    // Flange marks 1" to 6"
      maxSize: 6.0,
      step: 1.0,
    }
  },
  zoom: {
    min: 0.1,
    max: 5,
    step: 0.1,
  },
}; 