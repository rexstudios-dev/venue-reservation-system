# Conference Room Reservation System Example

This example demonstrates how to use the Venue Reservation System library to create a conference room reservation system with multiple layout options.

## Features

- Multiple room layout options (classroom, theater, boardroom, U-shape)
- Interactive item selection with visual feedback
- Capacity calculation based on selected layout
- Equipment and catering options
- Organization and contact information tracking
- Reservation confirmation with details

## Files

- `index.js` - Core implementation of the conference room reservation system
- `browser-example.js` - Browser-specific implementation with UI components

## Usage

### Node.js Example

```javascript
import { 
  ReservationSystem, 
  generateConferenceLayout 
} from 'venue-reservation-system';

// Create a conference room layout
const classroomLayout = generateConferenceLayout({
  width: 800,
  height: 600,
  layout: 'classroom',
  capacity: 40
});

// Create a reservation system
const reservationSystem = new ReservationSystem({ 
  venueMap: classroomLayout,
  settings: {
    timeSlotDurationMinutes: 240 // 4-hour slots
  }
});

// Create a reservation
const startTime = new Date('2023-06-20T09:00:00');
const endTime = new Date('2023-06-20T13:00:00');

// Get all available tables
const tables = classroomLayout.items.filter(item => 
  item.type === 'table' && item.status === 'available'
).slice(0, 5); // First 5 tables

const tableIds = tables.map(table => table.id);

const reservation = reservationSystem.createReservation(
  tableIds,
  {
    id: 'org123',
    name: 'Acme Corporation',
    contactName: 'John Doe',
    email: 'john@acme.com'
  },
  startTime,
  endTime,
  {
    layout: 'classroom',
    attendees: 10,
    equipment: 'Projector, whiteboard',
    catering: true
  }
);

console.log(`Reservation created: ${reservation.id}`);

