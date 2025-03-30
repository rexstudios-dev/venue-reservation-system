/**
 * Export a venue map to SVG
 * @param {VenueMap} venueMap - The venue map to export
 * @param {Object} options - Export options
 * @param {boolean} options.includeLegend - Whether to include a legend
 * @param {boolean} options.includeLabels - Whether to include item labels
 * @param {boolean} options.showZones - Whether to show zones
 * @param {Object} options.colors - Custom colors for different item statuses
 * @returns {string} - SVG markup
 */
export function exportToSVG(
    venueMap,
    {
      includeLegend = true,
      includeLabels = true,
      showZones = true,
      zoneOpacity = 0.2,
      colors = {
        available: "#4CAF50",
        reserved: "#FFC107",
        occupied: "#F44336",
        disabled: "#9E9E9E",
        maintenance: "#2196F3",
      },
    },
  ) {
    return venueMap.toSVG({
      showLabels: includeLabels,
      showZones,
      zoneOpacity,
      colors,
    })
  }
  
  /**
   * Render a venue map to a canvas element
   * @param {VenueMap} venueMap - The venue map to render
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   * @param {Object} options - Render options
   * @param {boolean} options.interactive - Whether the canvas should be interactive
   * @param {Function} options.onClick - Click handler for items
   * @param {Function} options.onHover - Hover handler for items
   * @returns {Object} - Controller object with methods to update the rendering
   */
  export function renderToCanvas(
    venueMap,
    canvas,
    {
      interactive = true,
      onClick = null,
      onHover = null,
      colors = {
        available: "#4CAF50",
        reserved: "#FFC107",
        occupied: "#F44336",
        disabled: "#9E9E9E",
        maintenance: "#2196F3",
        hover: "#2196F3",
      },
      showLabels = true,
      showZones = true,
      zoneOpacity = 0.2,
    },
  ) {
    const ctx = canvas.getContext("2d")
    let hoveredItem = null
  
    // Set canvas size
    canvas.width = venueMap.width
    canvas.height = venueMap.height
  
    // Function to render the venue map
    function render() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      // Draw background if specified
      if (venueMap.backgroundImage) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          renderItems() // Render items after background loads
        }
        img.src = venueMap.backgroundImage
      } else {
        renderItems()
      }
    }
  
    // Function to render all items
    function renderItems() {
      // Draw zones if enabled
      if (showZones && venueMap.zones && venueMap.zones.length > 0) {
        venueMap.zones.forEach((zone) => {
          if (zone.points && zone.points.length >= 3) {
            ctx.fillStyle = zone.color || "#6200EA"
            ctx.globalAlpha = zoneOpacity
            ctx.strokeStyle = zone.color || "#6200EA"
            ctx.lineWidth = 2
  
            ctx.beginPath()
            ctx.moveTo(zone.points[0][0], zone.points[0][1])
            for (let i = 1; i < zone.points.length; i++) {
              ctx.lineTo(zone.points[i][0], zone.points[i][1])
            }
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
  
            // Reset alpha
            ctx.globalAlpha = 1
  
            // Add zone label
            if (zone.name) {
              // Calculate centroid for label placement
              let cx = 0,
                cy = 0
              zone.points.forEach(([x, y]) => {
                cx += x
                cy += y
              })
              cx /= zone.points.length
              cy /= zone.points.length
  
              ctx.fillStyle = zone.color || "#6200EA"
              ctx.font = "bold 14px Arial"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(zone.name, cx, cy)
            }
          }
        })
      }
  
      // Draw each item
      venueMap.items.forEach((item) => {
        // Determine color
        let color = colors[item.status] || colors.available
  
        // If this is the hovered item, use hover color
        if (hoveredItem && hoveredItem.id === item.id) {
          color = colors.hover
        }
  
        // Save context for rotation
        ctx.save()
  
        // Apply rotation if needed
        if (item.rotation !== 0) {
          ctx.translate(item.x, item.y)
          ctx.rotate((item.rotation * Math.PI) / 180)
          ctx.translate(-item.x, -item.y)
        }
  
        ctx.fillStyle = color
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
  
        // Draw item shape
        switch (item.shape) {
          case "rect":
            ctx.beginPath()
            ctx.rect(item.x - item.width / 2, item.y - item.height / 2, item.width, item.height)
            ctx.fill()
            ctx.stroke()
            break
  
          case "circle":
            const radius = Math.min(item.width, item.height) / 2
            ctx.beginPath()
            ctx.arc(item.x, item.y, radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
  
            // Add special rendering for tables
            if (item.type === "table" && item.shape === "circle") {
              ctx.fillStyle = "#FFF"
              ctx.beginPath()
              ctx.arc(item.x, item.y, radius / 2, 0, Math.PI * 2)
              ctx.fill()
              ctx.stroke()
            }
            break
  
          case "polygon":
            if (item.points && item.points.length >= 3) {
              ctx.beginPath()
              ctx.moveTo(item.points[0][0] + item.x, item.points[0][1] + item.y)
              for (let i = 1; i < item.points.length; i++) {
                ctx.lineTo(item.points[i][0] + item.x, item.points[i][1] + item.y)
              }
              ctx.closePath()
              ctx.fill()
              ctx.stroke()
            }
            break
        }
  
        // Draw item label
        if (showLabels && item.label) {
          ctx.fillStyle = "#000"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(item.label, item.x, item.y)
        }
  
        // Restore context
        ctx.restore()
      })
    }
  
    // Initial render
    render()
  
    // Set up interactivity if enabled
    if (interactive) {
      // Find item at position
      function getItemAtPosition(x, y) {
        return venueMap.getItemAtPosition(x, y)
      }
  
      // Handle mouse move
      canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
  
        const item = getItemAtPosition(x, y)
  
        // Update hovered item
        if (item !== hoveredItem) {
          hoveredItem = item
          render()
  
          // Call onHover callback if provided
          if (onHover) {
            onHover(item)
          }
        }
      })
  
      // Handle mouse leave
      canvas.addEventListener("mouseleave", () => {
        hoveredItem = null
        render()
      })
  
      // Handle click
      canvas.addEventListener("click", (event) => {
        if (!onClick) return
  
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
  
        const item = getItemAtPosition(x, y)
  
        if (item) {
          onClick(item)
        }
      })
    }
  
    // Return controller object
    return {
      render,
      updateVenueMap: (newVenueMap) => {
        venueMap = newVenueMap
        render()
      },
    }
  }
  
  