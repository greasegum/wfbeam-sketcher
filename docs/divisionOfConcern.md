# WFBeam Sketch App: Architecture, Roadmap, and Feature Plan

## Project Overview

A web-first application for generating professional PDF sketches of wide flange beam profiles for bridge inspection. The app enables parametric depiction of section loss, annotation, and profile suggestion from measured field data. It is designed as a hybrid of CAD-like drawing precision and interactive field note convenience.

## Technology Stack

* **React**: UI component rendering and state management
* **Verve (or alternative animation lib)**: Gesture handling, UI transitions, animation feedback
* **Paper.js**: Canvas-based rendering engine for beam sketches, geometric calculations
* **Maker.js**: Backend geometry generation for printable/exportable vectors
* **Fuzzy logic module**: Beam profile suggestion from approximate field measurements
* **Tailwind CSS (or similar)**: Styling and responsive layout

## Architecture Overview

### 1. Application Layers

* **UI Layer (React + Verve)**

  * Controls, toolbars, menus, modal dialogs
  * Animation and gesture response
* **Sketch Engine (Paper.js + React integration)**

  * Grid rendering and input handling
  * Path management for beam outlines and section loss
  * Annotation layers, callouts, and embellishments
* **Data Model**

  * Centralized SketchModel holds geometry, annotations, embellishments
  * ProfileCatalog holds reference data for historical rolled sections
* **Export/Render Layer (Maker.js)**

  * Vector construction for high-resolution export
  * Line weight, hatch, font controls for PDF output

### 2. Data Flow

* User interacts via UI → React state updates
* SketchModel reflects changes and notifies Paper.js
* Paper.js redraws canvas intelligently
* On export, SketchModel → Maker.js for clean SVG/PDF output
* Future: Save/load JSON state for persistence and collaboration

## Features

### Prototype Scope (MVP)

* Load beam profile from visual catalog
* Grid overlay on beam
* User toggles grid cells to represent condition states
* Callout annotations via right-click on grid
* PDF export with linework and dimension labels

### Feature Roadmap

#### Phase 2

* **Section loss drawing**

  * Automatic polygon generation from selected grid cells
  * Line weight differentiation and fill control
* **Callouts**

  * Custom text, arrow direction, styling
  * Attached to grid cells or beam features

#### Phase 3

* **Beam catalog search**

  * Input rough dimensions (depth, flange width)
  * Return approximate matches from profile database using fuzzy match
* **Editable embellishments**

  * Add rivets, centerlines, bearings, backwalls, diaphragms
  * Anchored to relative positions on beam geometry

#### Phase 4

* **Parametric profile creation**

  * Define new beam types from templates
  * Generate scalable profiles for future reuse
* **User accounts / cloud sync**

  * Save drawings across sessions
  * Share with collaborators

## Modules and Division of Responsibility

| Module               | Responsibility                                                  |
| -------------------- | --------------------------------------------------------------- |
| `UI`                 | Renders forms, controls, palettes (React)                       |
| `SketchModel`        | Central app state for drawing, annotations, embellishments      |
| `PaperCanvas`        | Renders interactive drawing canvas (Paper.js)                   |
| `GeometryUtils`      | Performs shape detection, polygon generation, alignment         |
| `ExportEngine`       | Converts SketchModel to vector export (Maker.js)                |
| `CatalogEngine`      | Loads and queries beam profile data                             |
| `InteractionHandler` | Binds gestures and input to sketch updates (Verve / React refs) |

## UI Features

* **Main Toolbar**

  * Profile selector
  * Zoom/pan controls
  * Grid visibility toggle
  * Export button

* **Annotation Palette**

  * Callout editor
  * Embellishment selector
  * Fill and hatch selector

* **Measurement Entry Modal**

  * User inputs depth, flange widths
  * Fuzzy matcher returns candidate profiles with preview

## Strategy: Web-First with Print-Grade Output

We prioritize web deployment for accessibility and responsiveness. PDF output is rendered via vector pipeline to match engineering standards for printed inspection reports.

Paper.js ensures robust canvas interaction and shape logic, while Maker.js guarantees final render quality. React manages application state, UI logic, and interaction orchestration. Verve is used to soften UI interactions and reinforce responsive, fluid editing behavior.

## Notes on Future Extensibility

* Grid-based section loss logic can evolve into full mesh editor
* Embellishments are data-driven vector components, so adding new types is low-friction
* Callout system can be linked to inspection tags or codes (future integration with spec books)
* Possibility for field tablet mode with simplified UI for in-situ sketching

## Challenges and Pitfalls

* Precision alignment between Paper.js and exported vector models (must reconcile coordinate systems)
* Managing z-ordering and interaction layers in canvas efficiently
* Ensuring accurate print scaling and true dimensions
* WebGL acceleration or offloading for high-resolution rendering may be required at scale

## Summary

This project combines a disciplined architectural approach with a focused domain application. It's part sketchpad, part technical documentation tool, and part knowledge-preservation device. By keeping the stack modular and data-driven, we enable rich extensibility without sacrificing field usability.

Next: Build core grid sketching logic and finalize initial profile catalog for ingestion.
