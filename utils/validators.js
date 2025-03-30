/**
 * Validate a reservation
 * @param {Reservation} reservation - The reservation to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.requireCustomerName - Whether customer name is required
 * @param {boolean} options.requireCustomerEmail - Whether customer email is required
 * @param {boolean} options.requireCustomerPhone - Whether customer phone is required
 * @returns {Object} - Validation result with isValid and errors properties
 */
export function validateReservation(
    reservation,
    { requireCustomerName = true, requireCustomerEmail = true, requireCustomerPhone = false },
  ) {
    const errors = []
  
    // Check if reservation has seats
    if (!reservation.seatIds || reservation.seatIds.length === 0) {
      errors.push("Reservation must include at least one seat")
    }
  
    // Validate customer information
    if (!reservation.customer) {
      errors.push("Customer information is required")
    } else {
      if (requireCustomerName && !reservation.customer.name) {
        errors.push("Customer name is required")
      }
  
      if (requireCustomerEmail && !reservation.customer.email) {
        errors.push("Customer email is required")
      } else if (reservation.customer.email && !isValidEmail(reservation.customer.email)) {
        errors.push("Customer email is invalid")
      }
  
      if (requireCustomerPhone && !reservation.customer.phone) {
        errors.push("Customer phone is required")
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    }
  }
  
  /**
   * Validate an email address
   * @private
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  