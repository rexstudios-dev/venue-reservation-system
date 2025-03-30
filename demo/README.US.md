# Reservation System Demo

This demo shows a basic implementation of the seat/table reservation system for different types of venues (movie theaters, restaurants, conference rooms).

## Contents

- `index.html` - HTML user interface
- `venue-reservation.js` - Simplified implementation of the reservations API
- `app.js` - Application logic for the demo

## Features

- Interactive display of seats/tables
- Three types of predefined layouts:
- Cinema (with curved rows of seats)
- Restaurant (with tables of different shapes and sizes)
- Conference room (with different configurations: classroom, theater, boardroom, U-shape)
- Selecting and deselecting elements
- Reservation form with validation
- Reservation confirmation
- Ability to make multiple reservations

## How to run the demo

1. Simply open the `index.html` file in any modern web browser
2. No web server or additional installation required

## Usage

1. Select the venue type using the buttons at the top
2. Click on the available seats or tables (green) to Select them
3. Fill out the form with your information
4. Click "Book Now" to create a reservation
5. After confirming, you can make a new reservation

## Personalization

### Modifying Layouts

You can modify the predefined layouts by editing the functions in `app.js`:

```javascript
// To modify the cinema layout
function initCinemaLayout() {
currentVenueMap = window.VenueReservationSystem.generateCinemaLayout({
rows: 8, // Number of rows
seatsPerRow: [10, 12, 14, 16, 16, 14, 12, 10], // Seats per row
rowSpacing: 40, // Space between rows
curvature: 0.3 // Row curvature (0-1)
});
// ...
}