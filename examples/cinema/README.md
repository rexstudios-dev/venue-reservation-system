# Cinema Reservation System Example

This example demonstrates how to use the Venue Reservation System library to create a cinema seat booking system.

## Features

- Interactive seat selection with visual feedback
- Different seat categories (premium, standard, economy) with different pricing
- Multiple showtimes support
- Curved row layout for realistic cinema representation
- Reservation confirmation with details
- SVG export for printing or sharing

## Files

- `index.js` - Core implementation of the cinema reservation system
- `browser-example.js` - Browser-specific implementation with UI components

## Usage

### Node.js Example

```javascript
import { 
  ReservationSystem, 
  generateCinemaLayout 
} from 'venue-reservation-system';

// Create a cinema layout
const cinemaMap = generateCinemaLayout({
  rows: 10,
  seatsPerRow: [10, 12, 14, 16, 18, 20, 20, 22, 22, 24],
  rowSpacing: 40,
  curvature: 0.3
});

// Create a reservation system
const reservationSystem = new ReservationSystem({ venueMap: cinemaMap });

// Create a reservation
const reservation = reservationSystem.createReservation(
  ['seat_A1', 'seat_A2', 'seat_A3'],
  {
    id: 'customer123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  new Date('2023-06-15T19:00:00'),
  new Date('2023-06-15T21:00:00'),
  {
    movieTitle: 'The Matrix',
    ticketPrice: 45.97
  }
);

console.log(`Reservation created: ${reservation.id}`);

