import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GetRadarName } from './GetRadarData';
import styles from './RadarChart.module.css';
import radarConfig from './radarConfig';
import { 
  parseRadarItems, 
  groupItemsForPositioning, 
  calculateItemPosition,
  getCategoryLabels 
} from './radarDataParser';

const RadarChart = ({ items, radius, onEditClick, onCreateClick }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    item: null,
  });
  const [activeQuadrant, setActiveQuadrant] = useState(null); // null = show all

  useEffect(() => {
    const svgSize = radius * 2 + 100;
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', svgSize)
      .attr('height', svgSize)
      .append('g')
      .attr('transform', `translate(${svgSize / 2}, ${svgSize / 2})`);

    // Add definitions (gradients, filters)
    svg.append('defs').html(`
      <radialGradient id="g">
        <stop stop-color="#00f" offset="0.1"/>
        <stop stop-color="rgba(0,0,255, 0.5)" offset="0.8"/>
      </radialGradient>
      <filter id="sofGlow" width="300%" height="300%" x="-100%" y="-100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
      </filter>
    `);

    if (activeQuadrant === null) {
      // Draw full radar
      drawQuadrants(svg, radius);
      drawCategoryLabels(svg, radius);
      drawRadarGrid(svg, radius);
      
      const normalizedItems = parseRadarItems(items);
      const groupedItems = groupItemsForPositioning(normalizedItems);
      renderItems(svg, groupedItems, radius);
    } else {
      // Draw single quadrant zoomed
      drawSingleQuadrant(svg, radius, activeQuadrant, items);
    }

  }, [items, radius, activeQuadrant]);

  // Trigger blink animation when tooltip item changes
  useEffect(() => {
    if (tooltipData.visible && tooltipData.item && tooltipRef.current) {
      tooltipRef.current.classList.remove(styles.blink);
      void tooltipRef.current.offsetWidth;
      tooltipRef.current.classList.add(styles.blink);
    }
  }, [tooltipData.item?.id]);

  const handleQuadrantZoom = (quadrantIndex) => {
    if (activeQuadrant === quadrantIndex) {
      setActiveQuadrant(null);
    } else {
      setActiveQuadrant(quadrantIndex);
    }
  };

  const handleReset = () => {
    setActiveQuadrant(null);
  };

  const drawSingleQuadrant = (svg, radius, quadrantIndex, items) => {
    // Draw single quadrant as a wedge (path), not full circle
    svg.append("path")
      .attr("d", d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle((Math.PI / 2) * quadrantIndex)
        .endAngle((Math.PI / 2) * (quadrantIndex + 1))
      )
      .attr("fill", radarConfig.visual.quadrantColors[quadrantIndex % 2])
      .attr("stroke", radarConfig.visual.gridColor)
      .attr("stroke-width", 3);

    // Draw label for this quadrant
    const categoryName = Object.keys(radarConfig.categories)[quadrantIndex];
    const categoryConfig = radarConfig.categories[categoryName];
    
    // Position label at the center of the quadrant arc
    const labelAngle = (Math.PI / 2) * quadrantIndex + (Math.PI / 4);
    const labelRadius = radius + 40;
    const labelX = labelRadius * Math.cos(labelAngle);
    const labelY = labelRadius * Math.sin(labelAngle);
    
    svg.append("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .text(categoryConfig.label)
      .classed(styles.categoryLabel, true)
      .style("font-size", "16px");

    // Draw radar grid (partial rings within quadrant)
    radarConfig.visual.distanceRings.forEach(multiplier => {
      svg.append("path")
        .attr("d", d3.arc()
          .innerRadius(radius * multiplier)
          .outerRadius(radius * multiplier)
          .startAngle((Math.PI / 2) * quadrantIndex)
          .endAngle((Math.PI / 2) * (quadrantIndex + 1))
        )
        .attr("fill", "none")
        .attr("stroke", radarConfig.visual.gridColor)
        .attr("stroke-opacity", 0.5)
        .classed(
          multiplier === 1 ? styles.radarGridCircleOuter : styles.radarGridCircleInner,
          true
        );
    });

    // Draw radial lines within quadrant
    const linesInQuadrant = 5;
    for (let i = 0; i <= linesInQuadrant; i++) {
      const angle = (Math.PI / 2) * quadrantIndex + (Math.PI / 2) * (i / linesInQuadrant);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .classed(styles.radialLine, true);
    }

    // Filter and render items for this quadrant only
    const normalizedItems = parseRadarItems(items);
    const filteredItems = normalizedItems.filter(item => item.quadrantIndex === quadrantIndex);
    
    // Keep items in their normal quadrant positions
    const groupedItems = groupItemsForPositioning(filteredItems);
    
    Object.entries(groupedItems).forEach(([key, itemsInGroup]) => {
      itemsInGroup.forEach((item, index) => {
        const position = calculateItemPosition(item, index, itemsInGroup.length, radius);
        renderSingleItem(svg, item, position);
      });
    });
  };

  const drawQuadrants = (svg, radius) => {
    radarConfig.visual.quadrantColors.forEach((color, i) => {
      svg.append("path")
        .attr("d", d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
          .startAngle((Math.PI / 2) * i)
          .endAngle((Math.PI / 2) * (i + 1))
        )
        .attr("fill", color)
        .attr("stroke", radarConfig.visual.gridColor);
    });
  };

  const drawCategoryLabels = (svg, radius) => {
    const labels = getCategoryLabels(radius);
    labels.forEach(label => {
      svg.append("text")
        .attr("x", label.x)
        .attr("y", label.y)
        .attr("text-anchor", label.anchor)
        .text(label.text)
        .classed(styles.categoryLabel, true);
    });
  };

  const drawRadarGrid = (svg, radius) => {
    // Concentric circles
    radarConfig.visual.distanceRings.forEach(multiplier => {
      svg.append("circle")
        .attr("r", radius * multiplier)
        .classed(styles.radarGridCircle, true)
        .classed(
          multiplier === 1 ? styles.radarGridCircleOuter : styles.radarGridCircleInner, 
          true
        );
    });

    // Radial lines
    for (let i = 0; i < radarConfig.visual.numberOfRadialLines; i++) {
      const angle = (Math.PI * 2 / radarConfig.visual.numberOfRadialLines) * i;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .classed(styles.radialLine, true);
    }
  };

  const renderItems = (svg, groupedItems, radius) => {
    Object.entries(groupedItems).forEach(([key, items]) => {
      items.forEach((item, index) => {
        const position = calculateItemPosition(item, index, items.length, radius);
        renderSingleItem(svg, item, position);
      });
    });
  };

  const renderSingleItem = (svg, item, position) => {
    const { x, y } = position;
    const size = item.size;

    const itemGroup = svg.append('g');

    // Event listeners
    itemGroup
      .on('mouseover', async function () {
        d3.select(this).select('circle').attr('r', size * 2);
        d3.select(this).select('text').attr('font-size', '20px').attr('font-weight', 'bold');

        let zoomData = null;
        if (item.zoom_in) {
          const radarName = await fetchRadarName(item.zoom_in);
          zoomData = { id: item.zoom_in, name: radarName };
        }

        setTooltipData({
          visible: true,
          item: {
            ...item,
            zoom_in: zoomData
          }
        });
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').attr('r', size);
        // Don't hide tooltip immediately - let user move to tooltip panel
      });

    // Draw item based on type
    if (item.type === 'Opportunity') {
      drawOpportunity(itemGroup, item, x, y, size);
    } else {
      drawThreat(itemGroup, item, x, y, size);
    }

    // Add label
    itemGroup.append('text')
      .attr('x', x)
      .attr('y', y - size - 5)
      .text(item.name)
      .classed(styles.chartTextNormal, true);
  };

  const drawOpportunity = (group, item, x, y, size) => {
    // Outer circle with opportunity styling
    group.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', size)
      .attr('class', item.opportunityClass);

    // Inner glow circle
    group.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', size * 0.7)
      .classed(getImpactClass(item.raw.impact), true)
      .attr('stroke', 'none');
  };

  const drawThreat = (group, item, x, y, size) => {
    // Outer circle
    group.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', size)
      .attr('fill', item.color)
      .attr('stroke', 'none');

    // Triangle overlay
    const triangleSize = size * 0.6;
    const trianglePoints = [
      [x, y - triangleSize],
      [x - triangleSize * 0.866, y + triangleSize * 0.5],
      [x + triangleSize * 0.866, y + triangleSize * 0.5],
    ];
    group.append('polygon')
      .attr('points', trianglePoints.map(p => p.join(',')).join(' '))
      .attr('fill', darkenColor(item.color, -20));
  };

 const fetchRadarName = async (zoom_in) => {
  return await GetRadarName(zoom_in);
};
  return (
    <div className={styles.radarContainer}>
      {/* Radar SVG */}
      <div className={styles.radarWrapper}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Tooltip Panel */}
      <div 
        className={styles.tooltipPanel}
        onMouseEnter={() => {
          // Keep tooltip visible when hovering over it
        }}
        onMouseLeave={() => {
          // Hide tooltip when leaving the panel
          setTooltipData({ visible: false, item: null });
        }}
      >
        {tooltipData.visible && tooltipData.item ? (
          <div ref={tooltipRef} className={styles.tooltip}>
            <div className={styles.row}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{tooltipData.item.name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{tooltipData.item.type}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Category:</span>
              <span className={styles.value}>{tooltipData.item.raw.category}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Distance:</span>
              <span className={styles.value}>{tooltipData.item.raw.distance}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Impact:</span>
              <span className={styles.value}>{tooltipData.item.raw.impact}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Tolerance:</span>
              <span className={styles.value}>{tooltipData.item.raw.tolerance}</span>
            </div>
            {tooltipData.item.zoom_in && (
              <div className={styles.row}>
                <span className={styles.label}>Zoom to:</span>
                <span className={styles.link}>{tooltipData.item.zoom_in.name}</span>
              </div>
            )}
            {onEditClick && (
              <button 
                className={styles.editButton}
                onClick={() => onEditClick(tooltipData.item)}
              >
                <span className={styles.editIcon}>✏️</span>
                <span>Edit</span>
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tooltipPlaceholder}>
            <span className={styles.mutedText}>
              Hover over items to see details
            </span>
          </div>
        )}

        {/* Zoom Controls - Below tooltip */}
        <div className={styles.zoomControls}>
          {onCreateClick && (
            <button 
              className={styles.createButton}
              onClick={onCreateClick}
            >
              + Create Risk Item
            </button>
          )}
          
          <div className={styles.zoomTitle}>Filter by Category:</div>
          
          <button 
            className={`${styles.zoomButton} ${activeQuadrant === 0 ? styles.active : ''}`}
            onClick={() => handleQuadrantZoom(0)}
          >
            People & Knowledge
          </button>
          <button 
            className={`${styles.zoomButton} ${activeQuadrant === 1 ? styles.active : ''}`}
            onClick={() => handleQuadrantZoom(1)}
          >
            Operating Model
          </button>
          <button 
            className={`${styles.zoomButton} ${activeQuadrant === 2 ? styles.active : ''}`}
            onClick={() => handleQuadrantZoom(2)}
          >
            Business
          </button>
          <button 
            className={`${styles.zoomButton} ${activeQuadrant === 3 ? styles.active : ''}`}
            onClick={() => handleQuadrantZoom(3)}
          >
            Capabilities
          </button>
          
          {activeQuadrant !== null && (
            <button 
              className={`${styles.zoomButton} ${styles.resetButton}`}
              onClick={handleReset}
            >
              ↺ Show All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 🔧 Helper Functions
const getImpactClass = (impact) => {
  switch (impact) {
    case 'Low': return styles.lowImpact;
    case 'Medium': return styles.mediumImpact;
    case 'High': return styles.highImpact;
    default: return styles.defaultImpact;
  }
};

const darkenColor = (color, percent) => {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

export default RadarChart;