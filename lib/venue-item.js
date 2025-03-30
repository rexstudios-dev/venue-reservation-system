/**
 * Represents a reservable item in a venue (seat, table, booth, etc.)
 */
export class VenueItem {
    /**
     * Create a new venue item
     * @param {Object} options - Item configuration options
     * @param {string} options.id - Unique identifier for the item
     * @param {string} options.label - Display label for the item
     * @param {number} options.x - X coordinate position
     * @param {number} options.y - Y coordinate position
     * @param {number} options.rotation - Rotation angle in degrees
     * @param {string} options.status - Current status of the item
     * @param {string} options.type - Type of item (seat, table, booth, etc.)
     * @param {string} options.shape - Shape of the item (rect, circle, polygon, custom)
     * @param {Array} options.points - Points for polygon or custom shapes
     * @param {number} options.capacity - How many people can use this item
     * @param {Object} options.metadata - Additional custom data
     */
    constructor({
      id,
      label,
      x = 0,
      y = 0,
      rotation = 0,
      status = "available",
      type = "seat",
      shape = "rect",
      points = [],
      capacity = 1,
      metadata = {},
    }) {
      this.id = id
      this.label = label
      this.x = x
      this.y = y
      this.rotation = rotation
      this.status = status
      this.type = type
      this.shape = shape
      this.points = points
      this.capacity = capacity
      this.metadata = metadata
  
      // Default dimensions based on type
      if (!metadata.width && !metadata.height) {
        switch (type) {
          case "table":
            this.width = metadata.width || 60
            this.height = metadata.height || 60
            break
          case "booth":
            this.width = metadata.width || 80
            this.height = metadata.height || 40
            break
          default: // seat, chair, etc.
            this.width = metadata.width || 30
            this.height = metadata.height || 30
        }
      } else {
        this.width = metadata.width || 30
        this.height = metadata.height || 30
      }
    }
  
    /**
     * Update the status of the item
     * @param {string} newStatus - The new status to set
     * @returns {VenueItem} - The updated item instance
     */
    updateStatus(newStatus) {
      const validStatuses = ["available", "reserved", "occupied", "disabled", "maintenance"]
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid item status: ${newStatus}`)
      }
      this.status = newStatus
      return this
    }
  
    /**
     * Check if the item is available for reservation
     * @returns {boolean} - True if the item is available
     */
    isAvailable() {
      return this.status === "available"
    }
  
    /**
     * Update the position of the item
     * @param {number} x - New X coordinate
     * @param {number} y - New Y coordinate
     * @param {number} rotation - New rotation angle in degrees (optional)
     * @returns {VenueItem} - The updated item instance
     */
    updatePosition(x, y, rotation = null) {
      this.x = x
      this.y = y
      if (rotation !== null) {
        this.rotation = rotation
      }
      return this
    }
  
    /**
     * Check if a point is inside this item
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean} - True if the point is inside the item
     */
    containsPoint(x, y) {
      // For rotated items, transform the point to the item's coordinate system
      if (this.rotation !== 0) {
        const radians = (this.rotation * Math.PI) / 180
        const cos = Math.cos(-radians)
        const sin = Math.sin(-radians)
  
        // Translate point to origin
        const dx = x - this.x
        const dy = y - this.y
  
        // Rotate point
        const rx = dx * cos - dy * sin
        const ry = dx * sin + dy * cos
  
        // Check against non-rotated shape
        return this._containsPointNoRotation(rx + this.x, ry + this.y)
      }
  
      return this._containsPointNoRotation(x, y)
    }
  
    /**
     * Check if a point is inside this item (without considering rotation)
     * @private
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean} - True if the point is inside the item
     */
    _containsPointNoRotation(x, y) {
      switch (this.shape) {
        case "rect":
          return (
            x >= this.x - this.width / 2 &&
            x <= this.x + this.width / 2 &&
            y >= this.y - this.height / 2 &&
            y <= this.y + this.height / 2
          )
  
        case "circle":
          const radius = Math.min(this.width, this.height) / 2
          const dx = x - this.x
          const dy = y - this.y
          return dx * dx + dy * dy <= radius * radius
  
        case "polygon":
          return this._pointInPolygon(x, y, this.points)
  
        default:
          return false
      }
    }
  
    /**
     * Check if a point is inside a polygon
     * @private
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @param {Array} points - Array of [x, y] points defining the polygon
     * @returns {boolean} - True if the point is inside the polygon
     */
    _pointInPolygon(x, y, points) {
      let inside = false
  
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0] + this.x
        const yi = points[i][1] + this.y
        const xj = points[j][0] + this.x
        const yj = points[j][1] + this.y
  
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
  
        if (intersect) inside = !inside
      }
  
      return inside
    }
  
    /**
     * Convert the item to a plain object
     * @returns {Object} - Plain object representation of the item
     */
    toJSON() {
      return {
        id: this.id,
        label: this.label,
        x: this.x,
        y: this.y,
        rotation: this.rotation,
        status: this.status,
        type: this.type,
        shape: this.shape,
        points: this.points,
        width: this.width,
        height: this.height,
        capacity: this.capacity,
        metadata: this.metadata,
      }
    }
  
    /**
     * Get SVG representation of this item
     * @param {Object} options - Rendering options
     * @returns {string} - SVG markup for this item
     */
    toSVG(options = {}) {
      const {
        colors = {
          available: "#4CAF50",
          reserved: "#FFC107",
          occupied: "#F44336",
          disabled: "#9E9E9E",
          maintenance: "#2196F3",
        },
        showLabels = true,
      } = options
  
      const color = colors[this.status] || colors.available
      let svg = ""
  
      // Apply rotation transform if needed
      const transform = this.rotation !== 0 ? `transform="rotate(${this.rotation} ${this.x} ${this.y})"` : ""
  
      switch (this.shape) {
        case "rect":
          svg += `<rect 
            x="${this.x - this.width / 2}" 
            y="${this.y - this.height / 2}" 
            width="${this.width}" 
            height="${this.height}" 
            rx="4" 
            fill="${color}" 
            stroke="#000" 
            stroke-width="1" 
            data-item-id="${this.id}"
            ${transform}
          />`
          break
  
        case "circle":
          svg += `<circle 
            cx="${this.x}" 
            cy="${this.y}" 
            r="${Math.min(this.width, this.height) / 2}" 
            fill="${color}" 
            stroke="#000" 
            stroke-width="1" 
            data-item-id="${this.id}"
          />`
          break
  
        case "polygon":
          const points = this.points.map(([x, y]) => `${x + this.x},${y + this.y}`).join(" ")
          svg += `<polygon 
            points="${points}" 
            fill="${color}" 
            stroke="#000" 
            stroke-width="1" 
            data-item-id="${this.id}"
            ${transform}
          />`
          break
  
        case "custom":
          // For custom shapes, use the provided SVG path
          if (this.metadata.svgPath) {
            svg += `<path 
              d="${this.metadata.svgPath}" 
              transform="translate(${this.x}, ${this.y}) ${this.rotation !== 0 ? `rotate(${this.rotation})` : ""}" 
              fill="${color}" 
              stroke="#000" 
              stroke-width="1" 
              data-item-id="${this.id}"
            />`
          }
          break
      }
  
      // Add special rendering for specific types
      if (this.type === "table" && this.shape === "circle") {
        // Add a smaller inner circle for tables
        svg += `<circle 
          cx="${this.x}" 
          cy="${this.y}" 
          r="${Math.min(this.width, this.height) / 4}" 
          fill="#FFF" 
          stroke="#000" 
          stroke-width="1"
        />`
      }
  
      // Add label if needed
      if (showLabels) {
        svg += `<text 
          x="${this.x}" 
          y="${this.y}" 
          text-anchor="middle" 
          dominant-baseline="middle" 
          fill="#000" 
          font-size="12"
          ${transform}
        >${this.label}</text>`
      }
  
      return svg
    }
  }
  
  