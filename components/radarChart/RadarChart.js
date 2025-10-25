import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { supabase } from '../../utils/supabaseClient';
import styles from './RadarChart.module.css';
import RadarTooltip from './RadarToolTip';

const RadarChart = ({ items, radius, onEditClick }) => {
  const svgRef = useRef();
  const [tooltipData, setTooltipData] = useState({
    text: 'Zoom over to see details for each risk',
    xPos: 0,
    yPos: 0,
  });

  useEffect(() => {
    const svgSize = radius * 2 + 100;
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', svgSize)
      .attr('height', svgSize)
      .append('g')
      .attr('transform', `translate(${svgSize / 2}, ${svgSize / 2})`);

    // Add glow and gradient
    svg.append('defs').html(`
      <radialGradient id="g">
        <stop stop-color="#00f" offset="0.1"/>
        <stop stop-color="rgba(0,0,255, 0.5)" offset="0.8"/>
      </radialGradient>
      <filter id="sofGlow" width="300%" height="300%" x="-100%" y="-100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
      </filter>
    `);

    setTooltipData(prev => ({
      ...prev,
      xPos: 700,
      yPos: radius,
    }));

    // Quadrant backgrounds
    const quadrantColors = ['black', '#232b2b', 'black', '#232b2b'];
    for (let i = 0; i < 4; i++) {
      svg.append("path")
        .attr("d", d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
          .startAngle((Math.PI / 2) * i)
          .endAngle((Math.PI / 2) * (i + 1))
        )
        .attr("fill", quadrantColors[i])
        .attr("stroke", "#228B22");
    }

    const ValueCategory = {
      CATEGORY1: "People and Knowledge",
      CATEGORY2: "Operating Model",
      CATEGORY3: "Business",
      CATEGORY4: "Capabilities"
    };

    const positions = [
      { x: radius - 60, y: radius + 20, anchor: "start" },
      { x: -radius + 68, y: radius + 20, anchor: "end" },
      { x: -radius + 105, y: -radius - 10, anchor: "end" },
      { x: radius - 88, y: -radius - 10, anchor: "start" },
    ];

    const categoryLabels = Object.values(ValueCategory).map((category, index) => ({
      text: category,
      ...positions[index],
    }));

    const peopleLabel = categoryLabels.find(l => l.text === "People and Knowledge");
    if (peopleLabel) {
      peopleLabel.x = radius - 120;
      peopleLabel.anchor = "start";
    }

    categoryLabels.forEach(label => {
      svg.append("text")
        .attr("x", label.x)
        .attr("y", label.y)
        .attr("text-anchor", label.anchor)
        .text(label.text)
        .classed(styles.categoryLabel, true);
    });

    // Radar grid circles
    [0.25, 0.5, 0.75, 1].forEach(d => {
      svg.append("circle")
        .attr("r", radius * d)
        .classed(styles.radarGridCircle, true)
        .classed(d === 1 ? styles.radarGridCircleOuter : styles.radarGridCircleInner, true);
    });

    // Radial lines
    const numberOfLines = 16;
    for (let i = 0; i < numberOfLines; i++) {
      const angle = (Math.PI * 2 / numberOfLines) * i;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .classed(styles.radialLine, true);
    }

    const groupedItems = items.reduce((acc, item) => {
      const key = `${item.category}-${item.distance}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const distanceToRadius = {
      Detected: radius,
      Assessing: radius * 0.75,
      Assessed: radius * 0.5,
      Responding: radius * 0.25,
    };

    const categoryToIndex = {};
    Object.keys(ValueCategory).forEach((key, index) => {
      categoryToIndex[ValueCategory[key]] = index;
    });

    Object.entries(groupedItems).forEach(([key, items]) => {
      const [category, distance] = key.split('-');
      const categoryIndex = categoryToIndex[category];
      const angleOffset = (Math.PI / 2) * categoryIndex;
      const distRadius = distanceToRadius[distance] || radius;
      const angleStep = (Math.PI / 2) / (items.length + 1);

      items.forEach((item, index) => {
        const angle = angleOffset + angleStep * (index + 1);
        const x = distRadius * Math.cos(angle);
        const y = distRadius * Math.sin(angle);
        const size = getSizeByTolerance(item.tolerance);

        // Append group first
        const itemGroup = svg.append('g');

        // Event listeners
        itemGroup.on('mouseover', async function () {
          d3.select(this).select('circle').attr('r', size * 2);
          d3.select(this).select('text').attr('font-size', '20px').attr('font-weight', 'bold');

          let zoomData = null;
          if (item.zoom_in) {
            const radarName = await fetchRadarName(item.zoom_in);
            zoomData = { id: item.zoom_in, name: radarName };
          }

          setTooltipData({
            xPos: 700,
            yPos: radius,
            itemData: {
              ...item,
              zoom_in: zoomData
            }
          });
        }).on('mouseout', function () {
          d3.select(this).select('circle').attr('r', size);
        });

        // Draw circle or opportunity
        if (item.type === 'Opportunity') {
          const className = getOpportunityClass(item.impact);
          itemGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', size)
            .attr('class', className);
        } else {
          const color = getColorByImpact(item.impact);
          itemGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', size)
            .attr('fill', color)
            .attr('stroke', 'none');

          // Triangle for threats
          const triangleSize = size * 0.6;
          const trianglePoints = [
            [x, y - triangleSize],
            [x - triangleSize * 0.866, y + triangleSize * 0.5],
            [x + triangleSize * 0.866, y + triangleSize * 0.5],
          ];
          itemGroup.append('polygon')
            .attr('points', trianglePoints.map(p => p.join(',')).join(' '))
            .attr('fill', darkenColor(color, -20));
        }

        // Optional: glow inner ring
        if (item.type === 'Opportunity') {
          itemGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', size * 0.7)
            .classed(getClassByImpact(item.impact), true)
            .attr('stroke', 'none');
        }

        // Add label
        itemGroup.append('text')
          .attr('x', x)
          .attr('y', y - size - 5)
          .text(item.name)
          .classed(styles.chartTextNormal, true);
      });
    });

  }, [items, radius]);

  const fetchRadarName = async (zoom_in) => {
    try {
      const { data, error } = await supabase
        .from('projection_organisation_list')
        .select('name')
        .eq('id', zoom_in)
        .single();
      if (error) {
        console.error("Error fetching radar name:", error.message);
        return 'Error fetching organisation';
      }
      return data?.name || 'No name available';
    } catch (error) {
      console.error("Unexpected error:", error);
      return 'Error fetching organisation';
    }
  };

  const renderTooltip = () => (
    <RadarTooltip tooltipData={tooltipData} onEditClick={onEditClick} />
  );

  return (
    <div className={styles.wrapper}>
      <svg ref={svgRef}></svg>
      {renderTooltip()}
    </div>
  );
};

// 🔧 Helper Functions
const getClassByImpact = (impact) => {
  switch (impact) {
    case 'Low': return styles.lowImpact;
    case 'Medium': return styles.mediumImpact;
    case 'High': return styles.highImpact;
    default: return styles.defaultImpact;
  }
};

const getOpportunityClass = (impact) => {
  switch (impact) {
    case 'Low': return styles.opportunityLow;
    case 'Medium': return styles.opportunityMedium;
    case 'High': return styles.opportunityHigh;
    default: return styles.opportunityMedium;
  }
};

const getSizeByTolerance = (tolerance) => {
  switch (tolerance) {
    case 'Low': return 14;
    case 'Medium': return 10;
    case 'High': return 7;
    default: return 10;
  }
};

const getColorByImpact = (impact) => {
  switch (impact) {
    case 'Low': return '#77DD77';
    case 'Medium': return '#FFD580';
    case 'High': return '#FF6961';
    default: return 'steelblue';
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
