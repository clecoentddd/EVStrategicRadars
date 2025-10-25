// radarDataParser.js
// Transforms raw data into normalized format for the radar chart

import radarConfig from './RadarConfig';
import styles from './RadarChart.module.css'; // import CSS module here

/**
 * Parses raw items into normalized radar data
 * @param {Array} rawItems - Raw items from the database
 * @returns {Array} Normalized items for radar rendering
 */
export const parseRadarItems = (rawItems) => {
  return rawItems.map(item => normalizeItem(item));
};

/**
 * Normalizes a single item
 */
const normalizeItem = (rawItem) => {
  const category = radarConfig.categories[rawItem.category];
  const distance = radarConfig.distances[rawItem.distance];
  const impact = radarConfig.impacts[rawItem.impact] || radarConfig.impacts[radarConfig.defaults.impact];
  const tolerance = radarConfig.tolerances[rawItem.tolerance] || radarConfig.tolerances[radarConfig.defaults.tolerance];

  if (!category) console.warn(`Unknown category: ${rawItem.category}`);
  if (!distance) console.warn(`Unknown distance: ${rawItem.distance}`);

  // Map opportunityClass to the CSS module class
  let opportunityClass = styles.opportunityLow; // default
  switch (impact.opportunityClass) {
    case 'opportunityLow':
      opportunityClass = styles.opportunityLow;
      break;
    case 'opportunityMedium':
      opportunityClass = styles.opportunityMedium;
      break;
    case 'opportunityHigh':
      opportunityClass = styles.opportunityHigh;
      break;
    default:
      opportunityClass = styles.opportunityLow;
  }

  return {
    id: rawItem.id,
    name: rawItem.name,
    type: rawItem.type,
    zoom_in: rawItem.zoom_in,

    quadrantIndex: category?.quadrantIndex ?? 0,
    radiusMultiplier: distance?.radiusMultiplier ?? 1.0,

    color: impact.color,      // still keep color if needed for threats
    size: tolerance.radius,
    opportunityClass,         // now fully CSS module-safe

    raw: {
      category: rawItem.category,
      distance: rawItem.distance,
      impact: rawItem.impact,
      tolerance: rawItem.tolerance
    }
  };
};

/**
 * Groups items by quadrant and distance for positioning
 * @param {Array} normalizedItems - Items from parseRadarItems
 * @returns {Object} Grouped items keyed by "quadrantIndex-radiusMultiplier"
 */
export const groupItemsForPositioning = (normalizedItems) => {
  return normalizedItems.reduce((acc, item) => {
    const key = `${item.quadrantIndex}-${item.radiusMultiplier}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

/**
 * Calculate position for an item within its group
 * @param {Object} item - Normalized item
 * @param {number} indexInGroup - Index within the group
 * @param {number} totalInGroup - Total items in the group
 * @param {number} radius - Chart radius
 * @returns {Object} {x, y} coordinates
 */
export const calculateItemPosition = (item, indexInGroup, totalInGroup, radius) => {
  const quadrantAngleStart = (Math.PI / 2) * item.quadrantIndex;
  const angleStep = (Math.PI / 2) / (totalInGroup + 1);
  const angle = quadrantAngleStart + angleStep * (indexInGroup + 1);
  const distRadius = radius * item.radiusMultiplier;

  return {
    x: distRadius * Math.cos(angle),
    y: distRadius * Math.sin(angle)
  };
};

/**
 * Get category labels with positions
 * @param {number} radius - Chart radius
 * @returns {Array} Category label data
 */
export const getCategoryLabels = (radius) => {
  return Object.entries(radarConfig.categories).map(([categoryName, config]) => {
    const { quadrantIndex, label, labelPosition } = config;

    let x, y;
    switch (quadrantIndex) {
      case 0: // Bottom right
        x = radius + (labelPosition.offsetX || 0);
        y = radius + (labelPosition.offsetY || 0);
        break;
      case 1: // Bottom left
        x = -radius + (labelPosition.offsetX || 0);
        y = radius + (labelPosition.offsetY || 0);
        break;
      case 2: // Top left
        x = -radius + (labelPosition.offsetX || 0);
        y = -radius + (labelPosition.offsetY || 0);
        break;
      case 3: // Top right
        x = radius + (labelPosition.offsetX || 0);
        y = -radius + (labelPosition.offsetY || 0);
        break;
      default:
        x = 0;
        y = 0;
    }

    return {
      text: label,
      x,
      y,
      anchor: labelPosition.anchor || 'middle'
    };
  });
};

export default {
  parseRadarItems,
  groupItemsForPositioning,
  calculateItemPosition,
  getCategoryLabels
};
