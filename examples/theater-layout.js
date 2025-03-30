import { ReservationSystem, generateTheaterLayout } from "../index.js"

// Generate a theater layout with curved rows
const theaterLayout = generateTheaterLayout({
  rows: 12,
  seatsPerRow: [10, 12, 14, 16, 18, 20, 20, 22, 22, 24, 24, 26],
  rowSpacing: 35,
  curvature: 0.4,
})

// Create a reservation system
const reservationSystem = new ReservationSystem({
  seatMap: theaterLayout,
})

// In a browser environment, you would do:
/*
const canvas = document.getElementById('seat-map-canvas');

// Render to canvas with interactivity
const renderer = renderToCanvas(theaterLayout, canvas, {
  interactive: true,
  onClick: (seat) => {
    if (seat.status === 'available') {
      // Handle seat selection
      console.log(`Selected seat ${seat.label}`);
      
      // You might add the seat to a selection array
      selectedSeats.push(seat.id);
      
      // Update the UI
      seat.status = 'reserved';
      renderer.render();
    }
  },
  onHover: (seat) => {
    if (seat) {
      // Update tooltip or info panel
      document.getElementById('seat-info').textContent = 
        `Seat ${seat.label} - ${seat.status}`;
    }
  }
});

// Create reservation button handler
document.getElementById('create-reservation').addEventListener('click', () => {
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat');
    return;
  }
  
  try {
    const reservation = reservationSystem.createReservation(
      selectedSeats,
      {
        id: 'customer' + Date.now(),
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value
      }
    );
    
    alert(`Reservation created! ID: ${reservation.id}`);
    
    // Clear selection
    selectedSeats = [];
    
    // Update the canvas
    renderer.updateSeatMap(reservationSystem.seatMap);
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
*/

// For demonstration in Node.js
console.log(`Theater layout created with ${theaterLayout.seats.length} seats`)
console.log(`First row has ${theaterLayout.metadata.seatsPerRow[0]} seats`)
console.log(`Last row has ${theaterLayout.metadata.seatsPerRow[theaterLayout.metadata.seatsPerRow.length - 1]} seats`)

