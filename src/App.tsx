import { useState, useEffect } from 'react'
import { Box, Container, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import { BeamSelector } from './components/BeamSelector'
import { ToolPalette } from './components/ToolPalette'
import { DrawingArea } from './components/DrawingArea'
import { StatusBar } from './components/StatusBar'
import type { BeamProperties } from './data/beamProperties'
import { standardBeams } from './data/beamProperties'
import { logger } from './utils/logger'
import { theme, commonStyles, colors } from './config/theme'

function App() {
  const [selectedBeam, setSelectedBeam] = useState<BeamProperties | undefined>(undefined)
  const [selectedTool, setSelectedTool] = useState<string>('grid')
  const [webGridSize, setWebGridSize] = useState<number>(1.0)
  const [flangeGridSize, setFlangeGridSize] = useState<number>(2.0)
  const [elevationZoom, setElevationZoom] = useState<number>(1.0)
  const [buffer, setBuffer] = useState<number>(commonStyles.buffer.min)
  const [elevationHeight, setElevationHeight] = useState<number>(320)
  const [profileHeight, setProfileHeight] = useState<number>(320)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // Grid state for web area
  const length = 60; // 5ft
  const webRows = selectedBeam ? Math.floor((selectedBeam.depth - 2 * selectedBeam.flangeThickness) / webGridSize) : 0;
  const webCols = Math.floor(length / webGridSize);
  const [webGrid, setWebGrid] = useState<string[][]>([]);

  // Grid state for flanges
  const flangeCols = Math.floor(length / flangeGridSize);
  const [topFlangeGrid, setTopFlangeGrid] = useState<string[]>([]);
  const [bottomFlangeGrid, setBottomFlangeGrid] = useState<string[]>([]);

  // Initialize web grid
  useEffect(() => {
    if (webRows > 0 && webCols > 0) {
      setWebGrid(Array.from({ length: webRows }, () => 
        Array.from({ length: webCols }, () => colors.grid.web.intact)
      ));
    } else {
      setWebGrid([]);
    }
  }, [webRows, webCols, selectedBeam, webGridSize]);

  // Initialize flange grids
  useEffect(() => {
    if (flangeCols > 0) {
      setTopFlangeGrid(Array.from({ length: flangeCols }, () => colors.grid.flange.intact));
      setBottomFlangeGrid(Array.from({ length: flangeCols }, () => colors.grid.flange.intact));
    } else {
      setTopFlangeGrid([]);
      setBottomFlangeGrid([]);
    }
  }, [flangeCols, selectedBeam, flangeGridSize]);

  const handleGridCellClick = (row: number, col: number, isFlange: boolean) => {
    if (isFlange) {
      // Handle flange grid clicks
      const isTopFlange = row === 0;
      const states = [
        colors.grid.flange.intact,
        colors.grid.flange.corroded,
        colors.grid.flange.section_loss,
        colors.grid.flange.perforated
      ];
      
      if (isTopFlange) {
        setTopFlangeGrid(prev => {
          const next = [...prev];
          const idx = states.indexOf(prev[col]);
          next[col] = states[(idx + 1) % states.length];
          return next;
        });
      } else {
        setBottomFlangeGrid(prev => {
          const next = [...prev];
          const idx = states.indexOf(prev[col]);
          next[col] = states[(idx + 1) % states.length];
          return next;
        });
      }
    } else {
      // Handle web grid clicks
      setWebGrid(prev => {
        const next = prev.map(arr => arr.slice());
        const states = [
          colors.grid.web.intact,
          colors.grid.web.corroded,
          colors.grid.web.section_loss,
          colors.grid.web.perforated
        ];
        const idx = states.indexOf(prev[row][col]);
        next[row][col] = states[(idx + 1) % states.length];
        return next;
      });
    }
  };

  const handleBeamSelect = (beam: BeamProperties) => {
    logger.info('Beam selected', { beam: beam.designation })
    setSelectedBeam(beam)
  }

  // Zoom controls for elevation only
  const handleZoomIn = () => setElevationZoom(z => Math.min(z + commonStyles.zoom.step, commonStyles.zoom.max))
  const handleZoomOut = () => setElevationZoom(z => Math.max(z - commonStyles.zoom.step, commonStyles.zoom.min))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}>
        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Sidebar */}
          <Box sx={{
            width: isMobile ? '100%' : (isSidebarOpen ? commonStyles.sidebar.width : commonStyles.sidebar.collapsedWidth),
            height: '100%',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            position: isMobile ? 'absolute' : 'relative',
            zIndex: 2,
            display: isMobile && !isSidebarOpen ? 'none' : 'flex',
            flexDirection: 'column'
          }}>
            <BeamSelector onSelect={handleBeamSelect} selectedBeam={selectedBeam} />
            <ToolPalette 
              selectedTool={selectedTool} 
              onSelectTool={setSelectedTool} 
              onZoomIn={handleZoomIn} 
              onZoomOut={handleZoomOut} 
            />
          </Box>

          {/* Drawing Area */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <DrawingArea
              selectedBeam={selectedBeam}
              selectedTool={selectedTool}
              webGridSize={webGridSize}
              flangeGridSize={flangeGridSize}
              elevationZoom={elevationZoom}
              buffer={buffer}
              elevationHeight={elevationHeight}
              profileHeight={profileHeight}
              setElevationHeight={setElevationHeight}
              setProfileHeight={setProfileHeight}
              gridRows={webRows}
              gridCols={webCols}
              gridState={webGrid}
              topFlangeGrid={topFlangeGrid}
              bottomFlangeGrid={bottomFlangeGrid}
              onGridCellClick={handleGridCellClick}
            />
          </Box>
        </Box>

        {/* Status Bar */}
        <Box sx={{
          height: commonStyles.statusBar.height,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <StatusBar
            webGridSize={webGridSize}
            onWebGridSizeChange={setWebGridSize}
            flangeGridSize={flangeGridSize}
            onFlangeGridSizeChange={setFlangeGridSize}
            elevationZoom={elevationZoom}
            onElevationZoomChange={setElevationZoom}
            buffer={buffer}
            onBufferChange={setBuffer}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
