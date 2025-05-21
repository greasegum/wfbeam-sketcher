export interface LayerDefinition {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  description?: string;
}

export type LayerId = 
  | 'baseBeam'      // The basic beam geometry
  | 'dimensions'    // Basic dimensions (depth, width, ordinates)
  | 'controlGrid'   // Measurement/control grid
  | 'conditions'    // Condition markup (corrosion, section loss, etc.)
  | 'annotations'   // User annotations and callouts
  | 'hatching';     // Material hatching (for cross-section)

export const defaultLayers: LayerDefinition[] = [
  {
    id: 'baseBeam',
    name: 'Beam Geometry',
    visible: true,
    order: 0,
    description: 'Basic beam outline and geometry'
  },
  {
    id: 'dimensions',
    name: 'Dimensions',
    visible: true,
    order: 1,
    description: 'Basic dimensional annotations'
  },
  {
    id: 'controlGrid',
    name: 'Control Grid',
    visible: false,
    order: 2,
    description: 'Measurement and control grid'
  },
  {
    id: 'conditions',
    name: 'Conditions',
    visible: true,
    order: 3,
    description: 'Condition markup and assessment'
  },
  {
    id: 'annotations',
    name: 'Annotations',
    visible: true,
    order: 4,
    description: 'User annotations and callouts'
  },
  {
    id: 'hatching',
    name: 'Material Hatching',
    visible: true,
    order: 5,
    description: 'Material cross-section hatching'
  }
]; 