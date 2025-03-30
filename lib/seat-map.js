import { Seat } from "./seat.js"

/**
 * Manages the visual representation and layout of seats
 */
export class SeatMap {
  /**
   * Create a new seat map
   * @param {Object} options - SeatMap configuration options
   * @param {Array<Seat>} options.seats - Array of seat objects
   * @param {number} options.width - Width of the map in pixels
   * @param {number} options.height - Height of the map in pixels
   * @param {Object} options.metadata - Additional custom data for the map
   */
  constructor({ seats = [], width = 800, height = 600, metadata = {} }) {
    this.seats = seats
    this.width = width
    this.height = height
    this.metadata = metadata
  }

  /**
   * Add a seat to the map
   * @param {Seat} seat - The seat to add
   * @returns {SeatMap} - The updated seat map instance
   */
  addSeat(seat) {
    if (!(seat instanceof Seat)) {
      throw new Error("Invalid seat object")
    }
    this.seats.push(seat)
    return this
  }

  /**
   * Remove a seat from the map
   * @param {string} seatId - ID of the seat to remove
   * @returns {SeatMap} - The updated seat map instance
   */
  removeSeat(seatId) {
    this.seats = this.seats.filter((seat) => seat.id !== seatId)
    return this
  }

  /**
   * Find a seat by ID
   * @param {string} seatId - ID of the seat to find
   * @returns {Seat|null} - The found seat or null
   */
  getSeatById(seatId) {
    return this.seats.find((seat) => seat.id === seatId) || null
  }

  /**
   * Find a seat by coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Seat|null} - The found seat or null
   */
  getSeatAtPosition(x, y) {
    return (
      this.seats.find((seat) => {
        const halfWidth = seat.width / 2
        const halfHeight = seat.height / 2

        return (
          x >= seat.x - halfWidth && x <= seat.x + halfWidth && y >= seat.y - halfHeight && y <= seat.y + halfHeight
        )
      }) || null
    )
  }

  /**
   * Get all seats with a specific status
   * @param {string} status - Status to filter by
   * @returns {Array<Seat>} - Array of seats with the specified status
   */
  getSeatsByStatus(status) {
    return this.seats.filter((seat) => seat.status === status)
  }

  /**
   * Generate an SVG representation of the seat map
   * @returns {string} - SVG markup
   */
  toSVG() {
    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`

    // Add background if specified
    if (this.metadata.background) {
      svg += `<rect width="100%" height="100%" fill="${this.metadata.background}" />`
    }

    // Add each seat
    this.seats.forEach((seat) => {
      const colors = {
        available: "#4CAF50",
        reserved: "#FFC107",
        sold: "#F44336",
        disabled: "#9E9E9E",
      }

      const color = colors[seat.status] || colors.available

      if (seat.shape === "rect") {
        svg += `<rect 
          x="${seat.x - seat.width / 2}" 
          y="${seat.y - seat.height / 2}" 
          width="${seat.width}" 
          height="${seat.height}" 
          rx="4" 
          fill="${color}" 
          stroke="#000" 
          stroke-width="1" 
          data-seat-id="${seat.id}"
        />`
      } else if (seat.shape === "circle") {
        svg += `<circle 
          cx="${seat.x}" 
          cy="${seat.y}" 
          r="${Math.min(seat.width, seat.height) / 2}" 
          fill="${color}" 
          stroke="#000" 
          stroke-width="1" 
          data-seat-id="${seat.id}"
        />`
      }

      // Add seat label
      svg += `<text 
        x="${seat.x}" 
        y="${seat.y}" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        fill="#000" 
        font-size="12"
      >${seat.label}</text>`
    })

    svg += "</svg>"
    return svg
  }

  /**
   * Convert the seat map to a plain object
   * @returns {Object} - Plain object representation of the seat map
   */
  toJSON() {
    return {
      seats: this.seats.map((seat) => seat.toJSON()),
      width: this.width,
      height: this.height,
      metadata: this.metadata,
    }
  }
}

