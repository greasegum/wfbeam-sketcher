import { useState, useEffect } from 'react'
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BeamSelector } from './components/BeamSelector'
import { ToolPalette } from './components/ToolPalette'
import { DrawingArea } from './components/DrawingArea'
import { StatusBar } from './components/StatusBar'
import type { BeamProperties } from './data/beamProperties'
import { standardBeams } from './data/beamProperties'
import { logger } from './utils/logger'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181a1b',
      paper: '#232526',
    },
    primary: {
      main: '#00bfff', // cyan/blue accent
    },
    secondary: {
      main: '#ffb300', // gold accent
    },
    text: {
      primary: '#fff',
      secondary: '#b0b0b0',
    },
    divider: '#333',
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
})

function App() {
  const [selectedBeam, setSelectedBeam] = useState<BeamProperties | undefined>(undefined)
  const [selectedTool, setSelectedTool] = useState<string>('grid')
  const [gridSize, setGridSize] = useState<number>(0.25)
  const [elevationZoom, setElevationZoom] = useState<number>(1.0)
  const [profileZoom, setProfileZoom] = useState<number>(1.0)
  const [buffer, setBuffer] = useState<number>(40) // px margin for annotation
  const [elevationHeight, setElevationHeight] = useState<number>(320)
  const [profileHeight, setProfileHeight] = useState<number>(320)

  useEffect(() => {
    if (!selectedBeam && standardBeams.length > 0) {
      setSelectedBeam(standardBeams[0])
    }
  }, [selectedBeam])

  const handleBeamSelect = (beam: BeamProperties) => {
    logger.info('Beam selected', { beam: beam.designation })
    setSelectedBeam(beam)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" disableGutters sx={{ height: '100vh', bgcolor: 'background.default', pb: 6 }}>
        <Box sx={{ display: 'flex', height: '100vh', pb: 6 }}>
          {/* Left Panel: Tool Palette + Beam Selector */}
          <Box sx={{ width: 340, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <ToolPalette selectedTool={selectedTool} onSelectTool={setSelectedTool} />
            <BeamSelector onSelect={handleBeamSelect} selectedBeam={selectedBeam} />
          </Box>
          {/* Drawing Area */}
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', alignItems: 'stretch', justifyContent: 'center', bgcolor: 'background.paper', p: 2, pb: 8 }}>
            <DrawingArea
              selectedBeam={selectedBeam}
              selectedTool={selectedTool}
              gridSize={gridSize}
              elevationZoom={elevationZoom}
              profileZoom={profileZoom}
              buffer={buffer}
              elevationHeight={elevationHeight}
              profileHeight={profileHeight}
              setElevationHeight={setElevationHeight}
              setProfileHeight={setProfileHeight}
            />
          </Box>
        </Box>
        <StatusBar
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          elevationZoom={elevationZoom}
          onElevationZoomChange={setElevationZoom}
          profileZoom={profileZoom}
          onProfileZoomChange={setProfileZoom}
          buffer={buffer}
          onBufferChange={setBuffer}
        />
      </Container>
    </ThemeProvider>
  )
}

export default App
