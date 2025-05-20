export interface BeamProperties {
  designation: string;
  depth: number;        // inches
  flangeWidth: number;  // inches
  webThickness: number; // inches
  flangeThickness: number; // inches
  weight: number;       // lbs/ft
}

export const standardBeams: BeamProperties[] = [
  {
    designation: "W14x43",
    depth: 13.7,
    flangeWidth: 7.995,
    webThickness: 0.305,
    flangeThickness: 0.53,
    weight: 43
  },
  {
    designation: "W14x48",
    depth: 13.8,
    flangeWidth: 8.03,
    webThickness: 0.34,
    flangeThickness: 0.595,
    weight: 48
  },
  {
    designation: "W14x53",
    depth: 13.9,
    flangeWidth: 8.06,
    webThickness: 0.37,
    flangeThickness: 0.66,
    weight: 53
  },
  {
    designation: "W14x61",
    depth: 14.0,
    flangeWidth: 8.24,
    webThickness: 0.375,
    flangeThickness: 0.645,
    weight: 61
  },
  {
    designation: "W14x68",
    depth: 14.0,
    flangeWidth: 8.385,
    webThickness: 0.415,
    flangeThickness: 0.72,
    weight: 68
  },
  {
    designation: "W14x74",
    depth: 14.1,
    flangeWidth: 10.1,
    webThickness: 0.45,
    flangeThickness: 0.785,
    weight: 74
  },
  {
    designation: "W14x82",
    depth: 14.3,
    flangeWidth: 10.1,
    webThickness: 0.51,
    flangeThickness: 0.855,
    weight: 82
  },
  {
    designation: "W14x90",
    depth: 14.0,
    flangeWidth: 14.5,
    webThickness: 0.44,
    flangeThickness: 0.71,
    weight: 90
  }
]; 