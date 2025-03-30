/**
 * Represents a reservation in the system
 */
export class Reservation {
    /**
     * Create a new reservation
     * @param {Object} options - Reservation configuration options
     * @param {string} options.id - Unique identifier for the reservation
     * @param {Array<string>} options.itemIds - Array of item IDs included in this reservation
     * @param {string} options.status - Status of the reservation (pending, confirmed, cancelled)
     * @param {Object} options.customer - Customer information
     * @param {Date} options.startTime - When the reservation starts
     * @param {Date} options.endTime - When the reservation ends
     * @param {Date} options.createdAt - When the reservation was created
     * @param {Date} options.expiresAt - When the reservation expires (for pending reservations)
     * @param {Object} options.metadata - Additional custom data for the reservation
     */
    constructor({
      id,
      itemIds = [],
      status = "pending",
      customer = {},
      startTime = null,
      endTime = null,
      createdAt = new Date(),
      expiresAt = null,
      metadata = {},
    }) {
      this.id = id
      this.itemIds = itemIds
      this.status = status
      this.customer = customer
      this.startTime = startTime
      this.endTime = endTime
      this.createdAt = createdAt
      this.expiresAt = expiresAt
      this.metadata = metadata
    }
  
    /**
     * Add an item to the reservation
     * @param {string} itemId - ID of the item to add
     * @returns {Reservation} - The updated reservation instance
     */
    addItem(itemId) {
      if (!this.itemIds.includes(itemId)) {
        this.itemIds.push(itemId)
      }
      return this
    }
  
    /**
     * Remove an item from the reservation
     * @param {string} itemId - ID of the item to remove
     * @returns {Reservation} - The updated reservation instance
     */
    removeItem(itemId) {
      this.itemIds = this.itemIds.filter((id) => id !== itemId)
      return this
    }
  
    /**
     * Update the status of the reservation
     * @param {string} newStatus - The new status to set
     * @returns {Reservation} - The updated reservation instance
     */
    updateStatus(newStatus) {
      const validStatuses = ["pending", "confirmed", "cancelled"]
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid reservation status: ${newStatus}`)
      }
      this.status = newStatus
      return this
    }
  
    /**
     * Check if the reservation is expired
     * @returns {boolean} - True if the reservation is expired
     */
    isExpired() {
      if (!this.expiresAt) return false
      return new Date() > this.expiresAt
    }
  
    /**
     * Convert the reservation to a plain object
     * @returns {Object} - Plain object representation of the reservation
     */
    toJSON() {
      return {
        id: this.id,
        itemIds: this.itemIds,
        status: this.status,
        customer: this.customer,
        startTime: this.startTime,
        endTime: this.endTime,
        createdAt: this.createdAt,
        expiresAt: this.expiresAt,
        metadata: this.metadata,
      }
    }
  }
  
  