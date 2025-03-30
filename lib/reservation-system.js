import { Reservation } from "./reservation.js"
import { VenueMap } from "./venue-map.js"

/**
 * Main class that manages the entire reservation system
 */
export class ReservationSystem {
  /**
   * Create a new reservation system
   * @param {Object} options - Configuration options
   * @param {VenueMap} options.venueMap - The venue map for this reservation system
   * @param {Array<Reservation>} options.reservations - Array of existing reservations
   * @param {Object} options.settings - System settings
   */
  constructor({
    venueMap = new VenueMap({}),
    reservations = [],
    settings = {
      reservationExpiryMinutes: 15,
      allowMultipleItemsPerReservation: true,
      maxItemsPerReservation: 10,
      allowOverlappingReservations: false,
      timeSlotDurationMinutes: 60,
    },
  }) {
    this.venueMap = venueMap
    this.reservations = reservations
    this.settings = settings
    this.eventListeners = {}
  }

  /**
   * Create a new reservation
   * @param {Array<string>} itemIds - Array of item IDs to reserve
   * @param {Object} customer - Customer information
   * @param {Date} startTime - Start time of the reservation
   * @param {Date} endTime - End time of the reservation
   * @param {Object} metadata - Additional reservation data
   * @returns {Reservation} - The created reservation
   */
  createReservation(itemIds, customer, startTime, endTime, metadata = {}) {
    // Validate items are available
    const unavailableItems = itemIds.filter((id) => {
      const item = this.venueMap.getItemById(id)
      return !item || !item.isAvailable()
    })

    if (unavailableItems.length > 0) {
      throw new Error(`Items not available: ${unavailableItems.join(", ")}`)
    }

    // Validate against max items per reservation
    if (this.settings.maxItemsPerReservation && itemIds.length > this.settings.maxItemsPerReservation) {
      throw new Error(`Maximum ${this.settings.maxItemsPerReservation} items allowed per reservation`)
    }

    // Validate time slot
    if (!startTime || !endTime) {
      throw new Error("Start and end times are required")
    }

    if (startTime >= endTime) {
      throw new Error("End time must be after start time")
    }

    // Check for overlapping reservations if not allowed
    if (!this.settings.allowOverlappingReservations) {
      const overlappingReservations = this._findOverlappingReservations(itemIds, startTime, endTime)
      if (overlappingReservations.length > 0) {
        throw new Error("Overlapping reservations are not allowed")
      }
    }

    // Create expiry time for pending reservations
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.settings.reservationExpiryMinutes)

    // Create reservation
    const reservation = new Reservation({
      id: this._generateId(),
      itemIds,
      status: "pending",
      customer,
      startTime,
      endTime,
      createdAt: new Date(),
      expiresAt,
      metadata,
    })

    // Update item statuses
    itemIds.forEach((id) => {
      const item = this.venueMap.getItemById(id)
      if (item) {
        item.updateStatus("reserved")
      }
    })

    // Add to reservations
    this.reservations.push(reservation)

    // Trigger event
    this._triggerEvent("reservationCreated", reservation)

    return reservation
  }

  /**
   * Confirm a pending reservation
   * @param {string} reservationId - ID of the reservation to confirm
   * @returns {Reservation} - The updated reservation
   */
  confirmReservation(reservationId) {
    const reservation = this.getReservationById(reservationId)

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId}`)
    }

    if (reservation.status !== "pending") {
      throw new Error(`Cannot confirm reservation with status: ${reservation.status}`)
    }

    if (reservation.isExpired()) {
      throw new Error("Cannot confirm expired reservation")
    }

    // Update reservation status
    reservation.updateStatus("confirmed")

    // Update item statuses
    reservation.itemIds.forEach((id) => {
      const item = this.venueMap.getItemById(id)
      if (item) {
        item.updateStatus("occupied")
      }
    })

    // Trigger event
    this._triggerEvent("reservationConfirmed", reservation)

    return reservation
  }

  /**
   * Cancel a reservation
   * @param {string} reservationId - ID of the reservation to cancel
   * @returns {Reservation} - The updated reservation
   */
  cancelReservation(reservationId) {
    const reservation = this.getReservationById(reservationId)

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId}`)
    }

    if (reservation.status === "cancelled") {
      return reservation
    }

    // Update reservation status
    reservation.updateStatus("cancelled")

    // Update item statuses
    reservation.itemIds.forEach((id) => {
      const item = this.venueMap.getItemById(id)
      if (item) {
        item.updateStatus("available")
      }
    })

    // Trigger event
    this._triggerEvent("reservationCancelled", reservation)

    return reservation
  }

  /**
   * Find a reservation by ID
   * @param {string} reservationId - ID of the reservation to find
   * @returns {Reservation|null} - The found reservation or null
   */
  getReservationById(reservationId) {
    return this.reservations.find((res) => res.id === reservationId) || null
  }

  /**
   * Get all reservations for a customer
   * @param {string} customerId - ID of the customer
   * @returns {Array<Reservation>} - Array of reservations
   */
  getReservationsByCustomer(customerId) {
    return this.reservations.filter((res) => res.customer && res.customer.id === customerId)
  }

  /**
   * Get all reservations for a specific time range
   * @param {Date} startTime - Start of the time range
   * @param {Date} endTime - End of the time range
   * @returns {Array<Reservation>} - Array of reservations
   */
  getReservationsInTimeRange(startTime, endTime) {
    return this.reservations.filter(
      (res) =>
        res.status !== "cancelled" &&
        ((res.startTime >= startTime && res.startTime < endTime) ||
          (res.endTime > startTime && res.endTime <= endTime) ||
          (res.startTime <= startTime && res.endTime >= endTime)),
    )
  }

  /**
   * Get all reservations for a specific item
   * @param {string} itemId - ID of the item
   * @returns {Array<Reservation>} - Array of reservations
   */
  getReservationsForItem(itemId) {
    return this.reservations.filter((res) => res.status !== "cancelled" && res.itemIds.includes(itemId))
  }

  /**
   * Check if an item is available for a specific time range
   * @param {string} itemId - ID of the item
   * @param {Date} startTime - Start of the time range
   * @param {Date} endTime - End of the time range
   * @returns {boolean} - Whether the item is available
   */
  isItemAvailableForTimeRange(itemId, startTime, endTime) {
    const item = this.venueMap.getItemById(itemId)
    if (!item || item.status === "disabled" || item.status === "maintenance") {
      return false
    }

    // Check for overlapping reservations
    const overlappingReservations = this.reservations.filter(
      (res) =>
        res.status !== "cancelled" &&
        res.itemIds.includes(itemId) &&
        ((res.startTime >= startTime && res.startTime < endTime) ||
          (res.endTime > startTime && res.endTime <= endTime) ||
          (res.startTime <= startTime && res.endTime >= endTime)),
    )

    return overlappingReservations.length === 0
  }

  /**
   * Clean up expired reservations
   * @returns {number} - Number of reservations cleaned up
   */
  cleanupExpiredReservations() {
    const now = new Date()
    let count = 0

    this.reservations.forEach((reservation) => {
      if (reservation.status === "pending" && reservation.expiresAt && reservation.expiresAt < now) {
        this.cancelReservation(reservation.id)
        count++
      }
    })

    return count
  }

  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.eventListeners[event]) return
    this.eventListeners[event] = this.eventListeners[event].filter((cb) => cb !== callback)
  }

  /**
   * Find reservations that overlap with a given time range for specific items
   * @private
   * @param {Array<string>} itemIds - Array of item IDs
   * @param {Date} startTime - Start of the time range
   * @param {Date} endTime - End of the time range
   * @returns {Array<Reservation>} - Array of overlapping reservations
   */
  _findOverlappingReservations(itemIds, startTime, endTime) {
    return this.reservations.filter(
      (res) =>
        res.status !== "cancelled" &&
        res.itemIds.some((id) => itemIds.includes(id)) &&
        ((res.startTime >= startTime && res.startTime < endTime) ||
          (res.endTime > startTime && res.endTime <= endTime) ||
          (res.startTime <= startTime && res.endTime >= endTime)),
    )
  }

  /**
   * Generate a unique ID
   * @private
   * @returns {string} - Unique ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  /**
   * Trigger an event
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  _triggerEvent(event, data) {
    if (!this.eventListeners[event]) return
    this.eventListeners[event].forEach((callback) => {
      try {
        callback(data)
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err)
      }
    })
  }
}

