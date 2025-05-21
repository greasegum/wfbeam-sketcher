# WFBeam Sketcher – Implementation Roadmap

This roadmap outlines the phased development of WFBeam Sketcher, based on the implementation sketch and project goals. Each phase builds on the previous, ensuring a robust, inspector-friendly tool for beam annotation and reporting.

---

## **Phase 1: Core Interactive Sketching**
- [x] Modern, modular web UI (AutoCAD-like dark theme)
- [x] Standard W-beam catalog and selection
- [x] Accurate, scalable rendering of beam cross-section and elevation
- [x] Tool palette (markup, callout tools)
- [x] Clickable, color-changing grid overlay on elevation
- [ ] Grid overlay scales and aligns with beam; user can set grid size
- [ ] Status bar with grid size field and live feedback

---

## **Phase 2: Annotation & Callouts**
- [ ] Arrow+text callout tool (attach to grid cells)
- [ ] Right-click to add/edit callouts with styled leader lines
- [ ] Polygonal outlines for contiguous loss areas
- [ ] Paintbrush/rectangle tools for fast grid editing
- [ ] Legend for grid states and callout types

---

## **Phase 3: Export & Data Model**
- [ ] Export annotated sketches to SVG, PDF, PNG
- [ ] Export/import compact JSON data model (beam, grid, callouts)
- [ ] Output includes title block, legend, and region labeling

---

## **Phase 4: Advanced Features**
- [ ] Profile lookup by field measurements (fuzzy matching)
- [ ] Historical/legacy beam catalog and reference viewer
- [ ] Time-series mode for inspection comparison
- [ ] Photo annotation references
- [ ] Export to DXF (CAD)
- [ ] CLI/automation support for batch sketch generation

---

## **Ongoing**
- [ ] UI/UX polish, accessibility, and performance
- [ ] Responsive design for tablet/desktop
- [ ] Modular codebase and extensibility
- [ ] User feedback and iterative improvement

---

**Next up:**
- Grid overlay scaling and status bar with grid size control
- Then: Callout/annotation tool and advanced grid editing 