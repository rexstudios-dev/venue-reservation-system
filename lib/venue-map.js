import { VenueItem } from "./venue-item.js"

/**
 * Manages the visual representation and layout of a venue
 */
export class VenueMap {
  /**
   * Create a new venue map
   * @param {Object} options - VenueMap configuration options
   * @param {Array<VenueItem>} options.items - Array of venue items
   * @param {number} options.width - Width of the map in pixels
   * @param {number} options.height - Height of the map in pixels
   * @param {string} options.backgroundImage - URL of background image (floor plan)
   * @param {Object} options.metadata - Additional custom data for the map
   */
  constructor({ items = [], width = 800, height = 600, backgroundImage = null, metadata = {} }) {
    this.items = items
    this.width = width
    this.height = height
    this.backgroundImage = backgroundImage
    this.metadata = metadata
    this.zones = metadata.zones || []
  }

  /**
   * Add an item to the map
   * @param {VenueItem} item - The item to add
   * @returns {VenueMap} - The updated venue map instance
   */
  addItem(item) {
    if (!(item instanceof VenueItem)) {
      throw new Error("Invalid venue item object")
    }
    this.items.push(item)
    return this
  }

  /**
   * Remove an item from the map
   * @param {string} itemId - ID of the item to remove
   * @returns {VenueMap} - The updated venue map instance
   */
  removeItem(itemId) {
    this.items = this.items.filter((item) => item.id !== itemId)
    return this
  }

  /**
   * Find an item by ID
   * @param {string} itemId - ID of the item to find
   * @returns {VenueItem|null} - The found item or null
   */
  getItemById(itemId) {
    return this.items.find((item) => item.id === itemId) || null
  }

  /**
   * Find an item by coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {VenueItem|null} - The found item or null
   */
  getItemAtPosition(x, y) {
    // Check items in reverse order (top to bottom in z-index)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      if (item.containsPoint(x, y)) {
        return item
      }
    }
    return null
  }

  /**
   * Get all items with a specific status
   * @param {string} status - Status to filter by
   * @returns {Array<VenueItem>} - Array of items with the specified status
   */
  getItemsByStatus(status) {
    return this.items.filter((item) => item.status === status)
  }

  /**
   * Get all items of a specific type
   * @param {string} type - Type to filter by
   * @returns {Array<VenueItem>} - Array of items with the specified type
   */
  getItemsByType(type) {
    return this.items.filter((item) => item.type === type)
  }

  /**
   * Add a zone to the map
   * @param {Object} zone - Zone definition
   * @param {string} zone.id - Unique identifier for the zone
   * @param {string} zone.name - Display name for the zone
   * @param {Array} zone.points - Array of [x, y] points defining the zone boundary
   * @param {string} zone.color - Color for the zone
   * @returns {VenueMap} - The updated venue map instance
   */
  addZone(zone) {
    this.zones.push(zone)
    return this
  }

  /**
   * Remove a zone from the map
   * @param {string} zoneId - ID of the zone to remove
   * @returns {VenueMap} - The updated venue map instance
   */
  removeZone(zoneId) {
    this.zones = this.zones.filter((zone) => zone.id !== zoneId)
    return this
  }

  /**
   * Get items within a specific zone
   * @param {string} zoneId - ID of the zone
   * @returns {Array<VenueItem>} - Array of items within the zone
   */
  getItemsInZone(zoneId) {
    const zone = this.zones.find((z) => z.id === zoneId)
    if (!zone || !zone.points || zone.points.length < 3) {
      return []
    }

    return this.items.filter((item) => {
      // Check if the item's center is within the zone polygon
      let inside = false

      for (let i = 0, j = zone.points.length - 1; i < zone.points.length; j = i++) {
        const xi = zone.points[i][0]
        const yi = zone.points[i][1]
        const xj = zone.points[j][0]
        const yj = zone.points[j][1]

        const intersect = yi > item.y !== yj > item.y && item.x < ((xj - xi) * (item.y - yi)) / (yj - yi) + xi

        if (intersect) inside = !inside
      }

      return inside
    })
  }

  /**
   * Generate an SVG representation of the venue map
   * @param {Object} options - Rendering options
   * @returns {string} - SVG markup
   */
  toSVG(options = {}) {
    const {
      showLabels = true,
      showZones = true,
      zoneOpacity = 0.2,
      colors = {
        available: "#4CAF50",
        reserved: "#FFC107",
        occupied: "#F44336",
        disabled: "#9E9E9E",
        maintenance: "#2196F3",
      },
    } = options

    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`

    // Add background image if specified
    if (this.backgroundImage) {
      svg += `<image href="${this.backgroundImage}" width="${this.width}" height="${this.height}" preserveAspectRatio="xMidYMid meet" />`
    }

    // Add zones if specified
    if (showZones && this.zones.length > 0) {
      svg += `<g class="zones">`
      this.zones.forEach((zone) => {
        if (zone.points && zone.points.length >= 3) {
          const points = zone.points.map(([x, y]) => `${x},${y}`).join(" ")
          svg += `<polygon 
            points="${points}" 
            fill="${zone.color || "#6200EA"}" 
            fill-opacity="${zoneOpacity}" 
            stroke="${zone.color || "#6200EA"}" 
            stroke-width="2" 
            data-zone-id="${zone.id}"
          />`

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

            svg += `<text 
              x="${cx}" 
              y="${cy}" 
              text-anchor="middle" 
              dominant-baseline="middle" 
              fill="${zone.color || "#6200EA"}" 
              font-size="14"
              font-weight="bold"
            >${zone.name}</text>`
          }
        }
      })
      svg += `</g>`
    }

    // Add each item
    this.items.forEach((item) => {
      svg += item.toSVG({ colors, showLabels })
    })

    svg += "</svg>"
    return svg
  }

  /**
   * Convert the venue map to a plain object
   * @returns {Object} - Plain object representation of the venue map
   */
  toJSON() {
    return {
      items: this.items.map((item) => item.toJSON()),
      width: this.width,
      height: this.height,
      backgroundImage: this.backgroundImage,
      metadata: {
        ...this.metadata,
        zones: this.zones,
      },
    }
  }

  /**
   * Load a venue map from a JSON object
   * @param {Object} json - JSON object to load from
   * @returns {VenueMap} - New venue map instance
   */
  static fromJSON(json) {
    const items = (json.items || []).map((itemData) => new VenueItem(itemData))

    return new VenueMap({
      items,
      width: json.width || 800,
      height: json.height || 600,
      backgroundImage: json.backgroundImage,
      metadata: {
        ...json.metadata,
        zones: json.metadata?.zones || [],
      },
    })
  }
}

