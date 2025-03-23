import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/router'; // For navigation
import { supabase } from '../utils/supabaseClient';
import styles from './RadarChart.module.css'; // Import the CSS Module (or use a global CSS file)

// Initialize Supabase client
//const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

 
  const RadarChart = ({ items, radius}) => {
    const svgRef = useRef();
    const [tooltipData, setTooltipData] = useState({
      text: "Zoom over to see details for each risk", // Default tooltip text
      xPos: 0, // Position for tooltip, initially set to 0
      yPos: 0, 
    });

 
    useEffect(() => {

      console.log("RadarChart.js: Rendering RadarChart.. radius being:", radius);
      console.log("RadarChart.js: Items: ", items);
      // Calculate SVG size based on radius
      const svgSize = radius * 2 + 100;
  
      // Clear previous SVG content
      d3.select(svgRef.current).selectAll('*').remove();
  
      const svg = d3.select(svgRef.current)
        .attr('width', svgSize)
        .attr('height', svgSize)
        .append('g')
        .attr('transform', `translate(${svgSize / 2}, ${svgSize / 2})`);
  

      // Define the glow filter 
      // Define the gradient and glow filter 
        svg.append('defs').html(` 
          <radialGradient id="g"> 
          <stop stop-color="#00f" offset="0.1"/> 
          <stop stop-color="rgba(0,0,255, 0.5)" offset="0.8"/> 
          </radialGradient> 
          <filter id="sofGlow" width="300%" height="300%" x="-100%" y="-100%"> 
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" /> 
          </filter> `);
    
    // Draw radar circle   
    
  // Update tooltipData once radius is available (since radius is dynamic)
  setTooltipData(prev => ({
    ...prev,
    xPos: 700, // Adjust based on your design
    yPos: radius, // Adjust based on your design
  }));

    // Draw quadrants
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
        .attr("stroke", "plum");
    }

        // Position items in each category quadrant based on distance
    const ValueCategory = {
          CATEGORY1: "People and Knowledge",
          CATEGORY2: "Operating Model",
          CATEGORY3: "Business",
          CATEGORY4: "Capabilities"
        };

    // Dynamically generate the categoryLabels using the ValueCategory object
const categoryLabels = Object.values(ValueCategory).map((category, index) => {
  // You can use the index to apply unique x, y, and anchor values
  const positions = [
    { x: radius - 60, y: radius + 20, anchor: "start" }, // Bottom-right quadrant
    { x: -radius + 68, y: radius + 20, anchor: "end" }, // Bottom-left quadrant
    { x: -radius + 105, y: -radius - 10, anchor: "end" }, // Top-left quadrant
    { x: radius - 88, y: -radius - 10, anchor: "start" }, // Top-right quadrant
  ];

  return {
    text: category,  // Use the category value from ValueCategory
    ...positions[index], // Spread the respective position from positions array
  };
});

// Adjust the "People and Knowledge" label specifically
const peopleAndKnowledgeLabel = categoryLabels.find(label => label.text === "People and Knowledge");
if (peopleAndKnowledgeLabel) {
  peopleAndKnowledgeLabel.x = radius - 120; // Move further left to ensure full text visibility
  peopleAndKnowledgeLabel.anchor = "start"; // Ensure text aligns to the left
}

    
    categoryLabels.forEach(label => {
      svg.append("text")
        .attr("x", label.x)
        .attr("y", label.y)
        .attr("text-anchor", label.anchor)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("font-family", "Orbitron, sans-serif") 
        .text(label.text);
    });

    // Draw concentric circles (light blue for radar grid)
    [0.25, 0.5, 0.75, 1].forEach(d => {
      svg.append("circle")
        .attr("r", radius * d)
        .attr("fill", "none")
        .attr("stroke", "plum") // Light blue for radar grid circles
        .attr("stroke-width", d === 1 ? 5 : 1);
    });

    // Draw radial lines 
    const numberOfLines = 16; // Number of radial lines (can be adjusted as needed) 
    for (let i = 0; i < numberOfLines; i++) { const angle = (Math.PI * 2 / numberOfLines) * i; const x = radius * Math.cos(angle); const y = radius * Math.sin(angle); svg.append("line") .attr("x1", 0) .attr("y1", 0) 
    .attr("x2", x) 
    .attr("y2", y) 
    .attr("stroke", "plum") 
    .attr("stroke-width", 0.4); }


      
    // Group items by category and distance
    const groupedItems = items.reduce((acc, item) => {
      const key = `${item.category}-${item.distance}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    console.log("Grouped Items: ", groupedItems);

    // Map distance to radius
    const distanceToRadius = {
      Detected: radius,
      Assessing: radius * 0.75,
      Assessed: radius * 0.5,
      Responding: radius * 0.25,
    };

    const categoryToIndex = {};
    Object.keys(ValueCategory).forEach((key, index) => {
    categoryToIndex[ValueCategory[key]] = index;
}   );

    Object.entries(groupedItems).forEach(([key, items]) => {
      const [category, distance] = key.split('-');
      const categoryIndex = categoryToIndex[category];
      const angleOffset = (Math.PI / 2) * categoryIndex;
      const distRadius = distanceToRadius[distance] || radius;
      
      console.log(`Check Param . CategoryIndex: ${categoryIndex}, category : ${category}, Offset: ${angleOffset}, Distance: ${distance}, Radius: ${distRadius}`);
      console.log (`Check ValueCategory ${Object.keys(ValueCategory).indexOf("Business")}`);
      // Calculate equal-angle spacing for items at the same distance
      const angleStep = (Math.PI / 2) / (items.length + 1);
      items.forEach((item, index) => {
        const angle = angleOffset + angleStep * (index + 1);
        const x = distRadius * Math.cos(angle);
        const y = distRadius * Math.sin(angle);

        console.log(`index: ${index}, Angle step: ${angleStep}, Angle Offset: ${angleOffset}, Item: ${item.name}, Position: (${x}, ${y}), Impact: ${item.impact}, Tolerance: ${item.tolerance}`);

        const color = getColorByImpact(item.impact);
        const size = getSizeByTolerance(item.tolerance);

         // Determine circle style based on item.type
         let circleStyle = {};
         if (item.type === 'Risk') {
           circleStyle = {
             fill: color,
             stroke: 'none',
           };
         } else if (item.type === 'Opportunity') {
           circleStyle = {
             fill: 'none',
             stroke: color,
             strokeWidth: 3,
           };
         }
        // Append group for each item
        const itemGroup = svg.append('g')
          .on('mouseover', async function () {
            console.log(`Mouse over: ${item.name}, zoom_in id: ${item.zoom_in}`);

          
            d3.select(this).select('circle') .attr('r', size * 2) // Optional: Add a black stroke to highlight 
            
            d3.select(this).select('text')
              .attr('font-size', '20px') // Adjust this value as needed
              .attr('font-weight', 'bold'); // Optional: Make the text bold

            // Fetch the radar name based on zoom_in
            let tooltipText = `Title: ${item.name}<br/>Category: ${item.category}<br/>Type: ${item.type}<br/>Description: ${item.detect}<br/>Impact: ${item.impact}<br/>Tolerance: ${item.tolerance}<br/>Distance: ${item.distance}<br/>`;

            if (item.zoom_in) {
              const radar = await fetchRadarName(item.zoom_in);
              tooltipText += `<br/>Zoom in into radar: <a href='/radars/ui/${radar}?radarId=${item.zoom_in}' target='_blank' style='color: blue;'>${radar}</a>`;
            } else {
              tooltipText += `<br/>Zoom In Not Selected`;
            }

            // Update the tooltip data (fixed position for the tooltip)
            setTooltipData({
              xPos: 700,  // Fixed to the right of the circle
              yPos: radius + 0,       // Adjust the position relative to the circle
              text: tooltipText
            });
          })
          .on('mouseout', function () {
            console.log(`Mouse out: ${item.name}`);
            // Revert to original color on mouseout 
            d3.select(this).select('circle') 
            .attr('r', size)

            // Clear tooltip data on mouseout
            // setTooltipData(null);
          })
          
        // Draw item circle
       const itemCircle = itemGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', size)
          .attr('fill', color)
          .attr('fill', circleStyle.fill) // Use the determined fill color
          .attr('stroke', circleStyle.stroke) // Use the determined stroke color
          .attr('stroke-width', circleStyle.strokeWidth); 

          if (item.type === 'Risk') {
            const triangleSize = size * 0.6; // Size of the triangle relative to the circle
            const trianglePoints = [
              [x, y - triangleSize], // Top point
              [x - triangleSize * 0.866, y + triangleSize * 0.5], // Bottom-left point
              [x + triangleSize * 0.866, y + triangleSize * 0.5], // Bottom-right point
            ];
          
            // Draw the triangle
            itemGroup.append('polygon')
              .attr('points', trianglePoints.map(point => point.join(',')).join(' '))
              .attr('fill', darkenColor(color, -20)) // Slightly darker color
              .attr('stroke', 'none');
          }
          // Add glow effect if item type is "Opportunity" 
          if (item.type === 'Opportunity') 
            { 
              itemGroup.append('circle')
              .attr('cx', x)
              .attr('cy', y)
              .attr('r', size * 0.7) // Smaller radius for the inner circle
              .attr('fill', color) // Fill with the same color
              .attr('stroke', 'none');
              //itemCircle.attr('filter', 'url(#sofGlow)'); // Apply the glow filter for Opportunity circles
            }

        // Draw item name
        itemGroup.append('text')
          .attr('x', x)
          .attr('y', y - size - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#333')
          .text(item.name)
          .classed(styles.chartTextNormal, true);
      });
    });
  }, [items, radius, useRouter])

  // Function to fetch radar name by zoom_in
  const fetchRadarName = async (zoom_in) => {
    console.log(`Fetching radar name for zoom_in: ${zoom_in}`);
    try {
      const { data, error } = await supabase
        .from('projection_radars_list')
        .select('name')
        .eq('id', zoom_in)
        .single();

      if (error) {
        console.error("Error fetching radar name:", error.message);
        return 'Error fetching radar';
      }

      console.log("Radar name found: ", data?.name);
      return data?.name || 'No name available';
    } catch (error) {
      console.error("Unexpected error:", error);
      return 'Error fetching radar';
    }
  };

 // Function to display tooltip
 const renderTooltip = () => {
  if (!tooltipData) return null;

  const { text, xPos, yPos } = tooltipData;

  // Split text into lines
  const tooltipLines = text.split('<br/>').map((line, index) => {
    // Check if the line contains a link
    if (line.includes('<a href=')) {
      const linkMatch = line.match(/<a href='(.*?)'.*?>(.*?)<\/a>/);
      if (linkMatch) {
        const [, href, anchorText] = linkMatch;
        return (
          <div key={index} className={styles['tooltip-pair']}>
            <span className={styles['tooltip-key']}>Zoom in into radar:</span>{' '}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              {anchorText}
            </a>
          </div>
        );
      }
    }

    // For key-value pairs
    if (line.includes(':')) {
      const [key, value] = line.split(':', 2);
      return (
        <div key={index} className={styles['tooltip-pair']}>
          <span className={styles['tooltip-key']}>{key.trim()}:</span>{' '}
          <span className={styles['tooltip-value']}>{value.trim()}</span>
        </div>
      );
    }

    // Fallback for plain text lines
    return (
      <div key={index} className={styles['tooltip-pair']}>
        {line}
      </div>
    );
  });

  return (
    <div
      className={styles.tooltip}
      style={{
        position: 'absolute',
        top: `${yPos - 140}px`,
        left: `${xPos + 15}px`,
        visibility: tooltipData ? 'visible' : 'hidden',
      }}
    >
      {tooltipLines}
    </div>
  );
};





  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      {renderTooltip()}
    </div>
  );
};

// Helper functions for impact and tolerance
const getColorByImpact = (impact) => {
  console.log(`Getting color for impact: ${impact}`);
  switch (impact) {
    case 'Low':
      return '#77DD77';
    case 'Medium':
      return '#FFD580';
    case 'High':
      return '#FF6961';
    default:
      return 'steelblue';
  }
};

const getSizeByTolerance = (tolerance) => {
  console.log(`Getting size for tolerance: ${tolerance}`);
  switch (tolerance) {
    case 'Low':
      return 14;
    case 'Medium':
      return 10;
    case 'High':
      return 7;
    default:
      return 10;
  }
};

// Helper function to darken a color
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