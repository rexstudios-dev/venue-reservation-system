/**
 * Seat Reservation System API
 * A flexible JavaScript library for managing seat reservations with visual representation
 * @author Rex Dev (rexstudios-dev)
 */

// Core classes
export { VenueItem } from './lib/venue-item.js';
export { Reservation } from './lib/reservation.js';
export { ReservationSystem } from './lib/reservation-system.js';
export { VenueMap } from './lib/venue-map.js';

// Layout generators
export { 
  generateCinemaLayout,
  generateRestaurantLayout,
  generateConferenceLayout
} from './utils/venue-generators.js';

// Utilities
export { exportToSVG, renderToCanvas } from './utils/renderers.js';
export { validateReservation } from './utils/validators.js';

// Constants
export { SEAT_STATUSES, SEAT_TYPES } from './constants/index.js';
