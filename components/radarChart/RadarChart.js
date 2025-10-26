import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GetRadarName } from './GetRadarData';
import styles from './RadarChart.module.css';
import zoomStyles from './zoom.module.css';
import tooltipStyles from './RadarToolTip.module.css';
import radarConfig from './RadarConfig';
import { 
  parseRadarItems, 
  groupItemsForPositioning, 
  calculateItemPosition,
  getCategoryLabels 
} from './radarDataParser';

const RadarChart = ({ items, radius, onEditClick, onCreateClick }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [tooltipData, setTooltipData] = useState({ visible: false, item: null });
  const [activeQuadrant, setActiveQuadrant] = useState(null);

  useEffect(() => {
    const padding = 20;
  const svgSize = radius * 2 + 100;
  const totalWidth = svgSize + padding * 2;

  d3.select(svgRef.current).selectAll('*').remove();

  const svg = d3.select(svgRef.current)
    .attr('width', totalWidth)
    .attr('height', svgSize)
    .append('g')
    .attr('transform', `translate(${totalWidth / 2}, ${svgSize / 2})`);

    // Add definitions
    svg.append('defs').html(`
      <radialGradient id="g">
        <stop stop-color="#00f" offset="0.1"/>
        <stop stop-color="rgba(0,0,255,0.5)" offset="0.8"/>
      </radialGradient>
      <filter id="sofGlow" width="300%" height="300%" x="-100%" y="-100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
      </filter>
    `);

    if (activeQuadrant === null) {
      drawQuadrants(svg, radius);
      drawCategoryLabels(svg, radius);
      drawRadarGrid(svg, radius);
      const normalizedItems = parseRadarItems(items);
      const groupedItems = groupItemsForPositioning(normalizedItems);
      renderItems(svg, groupedItems, radius);
    } else {
      drawSingleQuadrant(svg, radius, activeQuadrant, items);
    }

  }, [items, radius, activeQuadrant]);

  useEffect(() => {
    if (tooltipData.visible && tooltipData.item && tooltipRef.current) {
      tooltipRef.current.classList.remove(styles.blink);
      void tooltipRef.current.offsetWidth;
      tooltipRef.current.classList.add(styles.blink);
    }
  }, [tooltipData.item?.id]);

  const handleQuadrantZoom = (idx) => {
    setActiveQuadrant(activeQuadrant === idx ? null : idx);
  };

  const handleReset = () => setActiveQuadrant(null);

  // ---------------------- D3 Drawing Functions ----------------------
  const drawSingleQuadrant = (svg, radius, quadrantIndex, items) => {
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

    const categoryName = Object.keys(radarConfig.categories)[quadrantIndex];
    const categoryConfig = radarConfig.categories[categoryName];
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

    const normalizedItems = parseRadarItems(items);
    const filteredItems = normalizedItems.filter(item => item.quadrantIndex === quadrantIndex);
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
  const categories = Object.values(radarConfig.categories);
  const positions = [
    { x: -radius + 20, y: -radius + 20, anchor: 'start' },   // top-left
    { x: radius - 20, y: -radius + 20, anchor: 'end' },      // top-right
    { x: -radius + 20, y: radius - 20, anchor: 'start' },    // bottom-left
    { x: radius - 20, y: radius - 20, anchor: 'end' },       // bottom-right
  ];

  categories.forEach((cat, i) => {
    const pos = positions[i] || { x: 0, y: 0, anchor: 'middle' };
    svg.append("text")
      .attr("x", pos.x)
      .attr("y", pos.y)
      .attr("text-anchor", pos.anchor)
      .text(cat.label)
      .classed(styles.categoryLabel, true)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#00cc88");
  });
};

  const drawRadarGrid = (svg, radius) => {
    radarConfig.visual.distanceRings.forEach(multiplier => {
      svg.append("circle")
        .attr("r", radius * multiplier)
        .classed(styles.radarGridCircle, true)
        .classed(multiplier === 1 ? styles.radarGridCircleOuter : styles.radarGridCircleInner, true);
    });
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

    itemGroup
      .on('mouseover', async function () {
        d3.select(this).select('circle').attr('r', size * 2);
        d3.select(this).select('text').attr('font-size', '20px').attr('font-weight', 'bold');
        let zoomData = null;
        if (item.zoom_in) {
          const radarName = await fetchRadarName(item.zoom_in);
          zoomData = { id: item.zoom_in, name: radarName };
        }
        setTooltipData({ visible: true, item: { ...item, zoom_in: zoomData } });
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').attr('r', size);
      });

    if (item.type === 'Opportunity') drawOpportunity(itemGroup, item, x, y, size);
    else drawThreat(itemGroup, item, x, y, size);

    itemGroup.append('text')
      .attr('x', x)
      .attr('y', y - size - 5)
      .text(item.name)
      .classed(styles.chartTextNormal, true);
  };

  const drawOpportunity = (group, item, x, y, size) => {
  const color = item.color || '#00cc88';
  const impactClass = getImpactClass(item.raw?.impact);

  // Outer circle (outline)
  group.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', size)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('class', impactClass || styles.defaultImpact);

  // Inner circle (solid)
  group.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', size * 0.7)
    .attr('fill', color)
    .attr('stroke', 'none')
    .attr('class', impactClass || styles.defaultImpact);
};


  const drawThreat = (group, item, x, y, size) => {
    group.append('circle').attr('cx', x).attr('cy', y).attr('r', size).attr('fill', item.color).attr('stroke', 'none');
    const triangleSize = size * 0.6;
    const trianglePoints = [
      [x, y - triangleSize],
      [x - triangleSize * 0.866, y + triangleSize * 0.5],
      [x + triangleSize * 0.866, y + triangleSize * 0.5],
    ];
    group.append('polygon').attr('points', trianglePoints.map(p => p.join(',')).join(' ')).attr('fill', darkenColor(item.color, -20));
  };

  const fetchRadarName = async (zoom_in) => await GetRadarName(zoom_in);

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
    return `#${(0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1)}`;
  };

  // ---------------------- JSX ----------------------
  return (
    <div className={styles.radarContainer}>
      
      {/* Left Panel: Zoom + Create */}
      <div className={styles.leftPanel}>
        <button className={styles.createButton} onClick={onCreateClick}>
      Create Radar Item
    </button>
        <div className={zoomStyles.zoomControls}>
          <span className={zoomStyles.zoomTitle}>Zoom into a quadrant:</span>
          {['People & Knowledge', 'Operating Model', 'Business', 'Capabilities'].map((label, idx) => (
            <button key={idx} className={`${zoomStyles.zoomButton} ${activeQuadrant === idx ? zoomStyles.active : ''}`} onClick={() => handleQuadrantZoom(idx)}>
              {label}
            </button>
          ))}
          {activeQuadrant !== null && (
            <button className={`${zoomStyles.zoomButton} ${zoomStyles.resetButton}`} onClick={handleReset}>
              ↺ Show All
            </button>
          )}
        </div>
      </div>

      {/* Middle Panel: Radar */}
      <div className={styles.middlePanel}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Right Panel: Tooltip */}
<div className={tooltipStyles.tooltipPanel} 
     onMouseEnter={() => {}}
     onMouseLeave={() => setTooltipData({ visible: false, item: null })}
>
  {tooltipData.visible && tooltipData.item ? (
    <div ref={tooltipRef} className={tooltipStyles.tooltip}>
      <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Name:</span><span className={tooltipStyles.value}>{tooltipData.item.name}</span></div>
      <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Type:</span><span className={tooltipStyles.value}>{tooltipData.item.type}</span></div>
      <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Category:</span><span className={tooltipStyles.value}>{tooltipData.item.raw.category}</span></div>
      <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Distance:</span><span className={tooltipStyles.value}>{tooltipData.item.raw.distance}</span></div>
      <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Impact:</span><span className={tooltipStyles.value}>{tooltipData.item.raw.impact}</span></div>
      <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Tolerance:</span><span className={tooltipStyles.value}>{tooltipData.item.raw.tolerance}</span></div>
      {tooltipData.item.zoom_in && (
        <div className={tooltipStyles.row}><span className={tooltipStyles.label}>Zoom to:</span><span className={tooltipStyles.link}>{tooltipData.item.zoom_in.name}</span></div>
      )}
      {onEditClick && (
        <button className={tooltipStyles.editButton} onClick={() => onEditClick(tooltipData.item)}>
          <span className={tooltipStyles.editIcon}>✏️</span><span>Edit</span>
        </button>
      )}
    </div>
  ) : (
    <div className={tooltipStyles.tooltipPlaceholder}>Hover over items to see details</div>
  )}
</div>

    </div>
  );
};

export default RadarChart;
