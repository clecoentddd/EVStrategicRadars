// radarConfig.js
// Central configuration for the radar chart

export const radarConfig = {
  // Visual settings
  visual: {
    numberOfRadialLines: 16,
    distanceRings: [0.25, 0.5, 0.75, 1],
    quadrantColors: ['black', '#232b2b', 'black', '#232b2b'],
    gridColor: '#228B22',
  },

  // Category definitions - maps raw category names to quadrants
  categories: {
    'People and Knowledge': {
      quadrantIndex: 0,
      label: 'People and Knowledge',
      labelPosition: { offsetX: -120, offsetY: 20, anchor: 'start' }
    },
    'Operating Model': {
      quadrantIndex: 1,
      label: 'Operating Model',
      labelPosition: { offsetX: 68, offsetY: 20, anchor: 'end' }
    },
    'Business': {
      quadrantIndex: 2,
      label: 'Business',
      labelPosition: { offsetX: 105, offsetY: -10, anchor: 'end' }
    },
    'Capabilities': {
      quadrantIndex: 3,
      label: 'Capabilities',
      labelPosition: { offsetX: -88, offsetY: -10, anchor: 'start' }
    }
  },

  // Distance/maturity mapping - maps raw distance names to ring positions
  distances: {
    'Detected': { ringIndex: 3, radiusMultiplier: 1.0 },
    'Assessing': { ringIndex: 2, radiusMultiplier: 0.75 },
    'Assessed': { ringIndex: 1, radiusMultiplier: 0.5 },
    'Responding': { ringIndex: 0, radiusMultiplier: 0.25 }
  },

  // Impact styling
  impacts: {
    'Low': {
      color: '#77DD77',
      opportunityClass: 'opportunityLow'
    },
    'Medium': {
      color: '#FFD580',
      opportunityClass: 'opportunityMedium'
    },
    'High': {
      color: '#FF6961',
      opportunityClass: 'opportunityHigh'
    }
  },

  // Tolerance sizing
  tolerances: {
    'Low': { radius: 14 },
    'Medium': { radius: 10 },
    'High': { radius: 7 }
  },

  // Default values
  defaults: {
    impact: 'Medium',
    tolerance: 'Medium',
    color: 'steelblue',
    size: 10
  }
};

export default radarConfig;