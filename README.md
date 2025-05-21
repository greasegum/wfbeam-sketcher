# WFBeam Sketcher

WFBeam Sketcher is an interactive, inspector-friendly web tool for annotating and reporting on W-beam cross-sections and elevations. It is designed for structural inspection workflows, enabling users to sketch, mark up, and export detailed beam diagrams with ease.

---

## Core Concept
WFBeam Sketcher leverages Paper.js as its 2D geometry and rendering engine. The application provides a modern, modular web UI for:
- Drawing and annotating beam cross-sections and elevations
- Interactive grid overlays for condition mapping
- Rich callouts and polygonal annotation tools
- Exporting sketches and data for reporting and archival

---

## Architecture Overview

### Core Technologies
- **Paper.js**: 2D geometry and rendering engine for interactive editing and visualization
- **React**: UI components and state management
- **TypeScript**: Type safety and maintainability

### Application Layers
1. **UI Layer**: React components for controls, toolbars, and dialogs
2. **Sketch Engine**: Paper.js for interactive drawing, grid rendering, and input handling
3. **Data Model**: Centralized state for geometry, annotations, and embellishments
4. **Export Layer**: Paper.js for high-quality vector export

---

## Feature Tree

### 1. Core Interactive Sketching (Phase 1)
- [x] Modern, modular web UI (AutoCAD-like dark theme)
- [x] Standard W-beam catalog and selection
- [x] Accurate, scalable rendering of beam cross-section and elevation
- [x] Tool palette (markup, callout tools)
- [x] Clickable, color-changing grid overlay on elevation
- [ ] Grid overlay scales and aligns with beam; user can set grid size
- [ ] Status bar with grid size field and live feedback

### 2. Annotation & Callouts (Phase 2)
- [ ] Arrow+text callout tool (attach to grid cells)
- [ ] Right-click to add/edit callouts with styled leader lines
- [ ] Polygonal outlines for contiguous loss areas
- [ ] Paintbrush/rectangle tools for fast grid editing
- [ ] Legend for grid states and callout types

### 3. Export & Data Model (Phase 3)
- [ ] Export annotated sketches to SVG, PDF, PNG
- [ ] Export/import compact JSON data model (beam, grid, callouts)
- [ ] Output includes title block, legend, and region labeling

### 4. Advanced Features (Phase 4)
- [ ] Profile lookup by field measurements (fuzzy matching)
- [ ] Historical/legacy beam catalog and reference viewer
- [ ] Time-series mode for inspection comparison
- [ ] Photo annotation references
- [ ] Export to DXF (CAD)
- [ ] CLI/automation support for batch sketch generation

### 5. Ongoing
- [ ] UI/UX polish, accessibility, and performance
- [ ] Responsive design for tablet/desktop
- [ ] Modular codebase and extensibility
- [ ] User feedback and iterative improvement

---

## Project Structure
```
wfbeam-sketcher/
├── src/                    # Source code
│   ├── assets/            # Static assets (images, icons)
│   ├── components/        # React components
│   ├── config/           # Configuration files
│   ├── data/             # Data models and constants
│   ├── managers/         # Business logic and state management
│   ├── models/           # Type definitions and interfaces
│   ├── types/            # TypeScript type declarations
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Public static files
├── docs/                 # Documentation
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## Source Code Details

### Core Files
- `App.tsx` - Main application component and layout
- `main.tsx` - Application entry point and initialization
- `index.css` - Global styles and theme variables

### Components (`/components`)
- `BeamRenderer.tsx` - Renders beam cross-sections and elevations with grid overlays
- `PaperCanvas.tsx` - Paper.js canvas wrapper with drawing tools and event handling
- `LayerControl.tsx` - Layer visibility and management controls
- `DrawingArea.tsx` - Main drawing canvas container
- `BeamSelector.tsx` - W-beam profile selection interface
- `StatusBar.tsx` - Application status and grid size controls
- `ToolPalette.tsx` - Drawing and annotation tools

### Models (`/models`)
- `SketchModel.ts` - Core data model for beam sketches, grid state, and annotations

### Managers (`/managers`)
- `DimensionManager.ts` - Handles dimension calculations and display

### Configuration (`/config`)
- `theme.ts` - Application theme and styling constants
- `dimensionStyles.ts` - Dimension line and text styling

### Types (`/types`)
- `layers.ts` - TypeScript interfaces for layer management

### Data (`/data`)
- `beamProperties.ts` - W-beam profile data and properties

### Utilities (`/utils`)
- `logger.ts` - Logging and debugging utilities

### Assets (`/assets`)
- Static assets including icons and images

---

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---

## License
MIT
