# Restaurant Reservation System Example

This example demonstrates how to use the Venue Reservation System library to create a restaurant table reservation system.

## Features

- Interactive table selection with visual feedback
- Different table types (rectangular, circular) with varying capacities
- Section-based organization (window, center, bar)
- Time slot availability checking
- Party size validation
- Special requests handling
- Reservation confirmation with details

## Files

- `index.js` - Core implementation of the restaurant reservation system
- `browser-example.js` - Browser-specific implementation with UI components

## Usage

### Node.js Example

```javascript
import { 
  ReservationSystem, 
  generateRestaurantLayout 
} from 'venue-reservation-system';

// Create a restaurant layout with custom tables
const restaurantMap = generateRestaurantLayout({
  width: 800,
  height: 600,
  customTables: [
    { id: 'table_1', label: '1', x: 100, y: 100, shape: 'rect', capacity: 2, section: 'window' },
    { id: 'table_2', label: '2', x: 200, y: 100, shape: 'circle', capacity: 4, section: 'main' },
    // Add more tables...
  ]
});

// Create a reservation system
const reservationSystem = new ReservationSystem({ 
  venueMap: restaurantMap,
  settings: {
    timeSlotDurationMinutes: 90,
    allowOverlappingReservations: false
  }
});

// Create a reservation
const startTime = new Date('2023-06-15T19:00:00');
const endTime = new Date('2023-06-15T20:30:00');

const reservation = reservationSystem.createReservation(
  ['table_2'],
  {
    id: 'customer123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234'
  },
  startTime,
  endTime,
  {
    partySize: 3,
    specialRequests: 'Window seat preferred'
  }
);

console.log(`Reservation created: ${reservation.id}`);

