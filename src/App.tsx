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
  const [buffer, setBuffer] = useState<number>(40)
  const [elevationHeight, setElevationHeight] = useState<number>(320)
  const [profileHeight, setProfileHeight] = useState<number>(320)

  // Grid state for elevation overlay
  const length = 60; // 5ft
  const rows = selectedBeam ? Math.floor(selectedBeam.depth / gridSize) : 0;
  const cols = Math.floor(length / gridSize);
  const [grid, setGrid] = useState<string[][]>([]);
  useEffect(() => {
    if (rows > 0 && cols > 0) {
      setGrid(Array(rows).fill(null).map(() => Array(cols).fill('rgba(0,191,255,0.15)')))
    }
  }, [rows, cols, selectedBeam, gridSize])

  const handleGridCellClick = (row: number, col: number) => {
    setGrid(prev => {
      const next = prev.map(arr => arr.slice())
      // Cycle through colors
      const states = [
        'rgba(0,191,255,0.15)', // intact
        'rgba(255,193,7,0.25)', // corroded
        'rgba(255,87,34,0.25)', // section loss
        'rgba(244,67,54,0.35)'  // perforated
      ]
      const idx = states.indexOf(prev[row][col])
      next[row][col] = states[(idx + 1) % states.length]
      return next
    })
  }

  const handleBeamSelect = (beam: BeamProperties) => {
    logger.info('Beam selected', { beam: beam.designation })
    setSelectedBeam(beam)
  }

  // Zoom controls for elevation only
  const handleZoomIn = () => setElevationZoom(z => Math.min(z + 0.1, 5))
  const handleZoomOut = () => setElevationZoom(z => Math.max(z - 0.1, 0.1))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" disableGutters sx={{ height: '100vh', bgcolor: 'background.default', pb: 6 }}>
        <Box sx={{ display: 'flex', height: '100vh', pb: 6 }}>
          {/* Left Panel: Tool Palette + Beam Selector */}
          <Box sx={{ width: 340, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <ToolPalette selectedTool={selectedTool} onSelectTool={setSelectedTool} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
            <BeamSelector onSelect={handleBeamSelect} selectedBeam={selectedBeam} />
          </Box>
          {/* Drawing Area */}
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', alignItems: 'stretch', justifyContent: 'center', bgcolor: 'background.paper', p: 2, pb: 8 }}>
            <DrawingArea
              selectedBeam={selectedBeam}
              selectedTool={selectedTool}
              gridSize={gridSize}
              elevationZoom={elevationZoom}
              buffer={buffer}
              elevationHeight={elevationHeight}
              profileHeight={profileHeight}
              setElevationHeight={setElevationHeight}
              setProfileHeight={setProfileHeight}
              gridRows={rows}
              gridCols={cols}
              gridState={grid}
              onGridCellClick={handleGridCellClick}
            />
          </Box>
        </Box>
        <StatusBar
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          elevationZoom={elevationZoom}
          onElevationZoomChange={setElevationZoom}
          buffer={buffer}
          onBufferChange={setBuffer}
        />
      </Container>
    </ThemeProvider>
  )
}

export default App
