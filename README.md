# WFBeam Sketcher

WFBeam Sketcher is an interactive, inspector-friendly web tool for annotating and reporting on W-beam cross-sections and elevations. It is designed for structural inspection workflows, enabling users to sketch, mark up, and export detailed beam diagrams with ease.

---

## Core Concept
WFBeam Sketcher leverages Paper.js as its 2D geometry, rendering, and interactivity engine. The application provides a modern, modular web UI for:
- Drawing and annotating beam cross-sections and elevations
- Interactive grid overlays for condition mapping
- Rich callouts and polygonal annotation tools
- Exporting sketches and data for reporting and archival

---

## Feature Tree

### 1. Core Interactive Sketching
- Modern, modular web UI (AutoCAD-like dark theme)
- Standard W-beam catalog and selection
- Accurate, scalable rendering of beam cross-section and elevation
- Tool palette (markup, callout tools)
- Clickable, color-changing grid overlay on elevation
- Grid overlay scales and aligns with beam; user can set grid size
- Status bar with grid size field and live feedback

### 2. Annotation & Callouts
- Arrow+text callout tool (attach to grid cells)
- Right-click to add/edit callouts with styled leader lines
- Polygonal outlines for contiguous loss areas
- Paintbrush/rectangle tools for fast grid editing
- Legend for grid states and callout types

### 3. Export & Data Model
- Export annotated sketches to SVG, PDF, PNG
- Export/import compact JSON data model (beam, grid, callouts)
- Output includes title block, legend, and region labeling

### 4. Advanced Features
- Profile lookup by field measurements (fuzzy matching)
- Historical/legacy beam catalog and reference viewer
- Time-series mode for inspection comparison
- Photo annotation references
- Export to DXF (CAD)
- CLI/automation support for batch sketch generation

### 5. Ongoing
- UI/UX polish, accessibility, and performance
- Responsive design for tablet/desktop
- Modular codebase and extensibility
- User feedback and iterative improvement

---

## Technology
- **Paper.js**: 2D geometry, rendering, and interactivity
- **React**: UI components and state management
- **TypeScript**: Type safety and maintainability

---

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---

## License
MIT
