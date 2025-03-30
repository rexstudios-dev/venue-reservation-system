/**
 * Represents a single seat in the reservation system
 */
export class Seat {
    /**
     * Create a new seat
     * @param {Object} options - Seat configuration options
     * @param {string} options.id - Unique identifier for the seat
     * @param {string} options.label - Display label for the seat (e.g., "A1", "B2")
     * @param {number} options.x - X coordinate position
     * @param {number} options.y - Y coordinate position
     * @param {string} options.status - Current status of the seat (available, reserved, sold, disabled)
     * @param {string} options.type - Type of seat (standard, vip, accessible, etc.)
     * @param {Object} options.metadata - Additional custom data for the seat
     */
    constructor({ id, label, x = 0, y = 0, status = "available", type = "standard", metadata = {} }) {
      this.id = id
      this.label = label
      this.x = x
      this.y = y
      this.status = status
      this.type = type
      this.metadata = metadata
      this.width = metadata.width || 30
      this.height = metadata.height || 30
      this.shape = metadata.shape || "rect"
    }
  
    /**
     * Update the status of the seat
     * @param {string} newStatus - The new status to set
     * @returns {Seat} - The updated seat instance
     */
    updateStatus(newStatus) {
      const validStatuses = ["available", "reserved", "sold", "disabled"]
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid seat status: ${newStatus}`)
      }
      this.status = newStatus
      return this
    }
  
    /**
     * Check if the seat is available for reservation
     * @returns {boolean} - True if the seat is available
     */
    isAvailable() {
      return this.status === "available"
    }
  
    /**
     * Update the position of the seat
     * @param {number} x - New X coordinate
     * @param {number} y - New Y coordinate
     * @returns {Seat} - The updated seat instance
     */
    updatePosition(x, y) {
      this.x = x
      this.y = y
      return this
    }
  
    /**
     * Convert the seat to a plain object
     * @returns {Object} - Plain object representation of the seat
     */
    toJSON() {
      return {
        id: this.id,
        label: this.label,
        x: this.x,
        y: this.y,
        status: this.status,
        type: this.type,
        metadata: this.metadata,
        width: this.width,
        height: this.height,
        shape: this.shape,
      }
    }
  }
  
  