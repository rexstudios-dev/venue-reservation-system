import { ReservationSystem, generateCinemaLayout, exportToSVG } from "../index.js"

// Create a cinema layout
const cinemaMap = generateCinemaLayout({
  rows: 12,
  seatsPerRow: [10, 12, 14, 16, 18, 20, 20, 22, 22, 24, 24, 26],
  rowSpacing: 35,
  curvature: 0.4,
})

// Create a reservation system
const reservationSystem = new ReservationSystem({
  venueMap: cinemaMap,
  settings: {
    reservationExpiryMinutes: 15,
    maxItemsPerReservation: 8,
  },
})

// Set up event listeners
reservationSystem.on("reservationCreated", (reservation) => {
  console.log(`New reservation created: ${reservation.id}`)
  console.log(`Seats: ${reservation.itemIds.join(", ")}`)
  console.log(`Customer: ${reservation.customer.name}`)
  console.log(`Start time: ${reservation.startTime}`)
  console.log(`End time: ${reservation.endTime}`)
})

reservationSystem.on("reservationConfirmed", (reservation) => {
  console.log(`Reservation confirmed: ${reservation.id}`)
})

reservationSystem.on("reservationCancelled", (reservation) => {
  console.log(`Reservation cancelled: ${reservation.id}`)
})

// In a browser environment, you would do:
/*
// Get the canvas element
const canvas = document.getElementById('cinema-map');

// Render the cinema map
const renderer = renderToCanvas(cinemaMap, canvas, {
  interactive: true,
  onClick: (seat) => {
    if (seat.status === 'available') {
      // Toggle seat selection
      if (selectedSeats.includes(seat.id)) {
        // Deselect
        seat.status = 'available';
        selectedSeats = selectedSeats.filter(id => id !== seat.id);
      } else {
        // Select
        seat.status = 'reserved';
        selectedSeats.push(seat.id);
      }
      
      // Update the UI
      renderer.render();
      updateSelectedSeatsDisplay();
    }
  },
  onHover: (seat) => {
    if (seat) {
      document.getElementById('seat-info').textContent = 
        `Seat ${seat.label} - ${seat.status} - ${seat.metadata.category}`;
    } else {
      document.getElementById('seat-info').textContent = '';
    }
  }
});

// Handle reservation form submission
document.getElementById('reservation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat');
    return;
  }
  
  const customerName = document.getElementById('customer-name').value;
  const customerEmail = document.getElementById('customer-email').value;
  
  if (!customerName || !customerEmail) {
    alert('Please enter your name and email');
    return;
  }
  
  // Get the selected movie time (assuming it's a select element)
  const movieTimeSelect = document.getElementById('movie-time');
  const selectedOption = movieTimeSelect.options[movieTimeSelect.selectedIndex];
  const startTime = new Date(selectedOption.dataset.startTime);
  const endTime = new Date(selectedOption.dataset.endTime);
  
  try {
    const reservation = reservationSystem.createReservation(
      selectedSeats,
      {
        id: 'customer' + Date.now(),
        name: customerName,
        email: customerEmail
      },
      startTime,
      endTime,
      {
        movieTitle: document.getElementById('movie-title').textContent,
        ticketPrice: calculateTotalPrice(selectedSeats)
      }
    );
    
    // Show confirmation
    document.getElementById('booking-section').style.display = 'none';
    document.getElementById('confirmation-section').style.display = 'block';
    document.getElementById('confirmation-id').textContent = reservation.id;
    document.getElementById('confirmation-seats').textContent = selectedSeats.join(', ');
    document.getElementById('confirmation-time').textContent = formatDateTime(startTime);
    
    // Clear selection
    selectedSeats = [];
    
    // Update the canvas
    renderer.updateVenueMap(reservationSystem.venueMap);
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Helper function to calculate total price
function calculateTotalPrice(seatIds) {
  return seatIds.reduce((total, seatId) => {
    const seat = cinemaMap.getItemById(seatId);
    const category = seat.metadata.category;
    const prices = {
      'premium': 15.99,
      'standard': 12.99,
      'economy': 9.99
    };
    return total + (prices[category] || 12.99);
  }, 0);
}

// Helper function to format date and time
function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

// Function to update the selected seats display
function updateSelectedSeatsDisplay() {
  const selectedSeatsElement = document.getElementById('selected-seats');
  const totalPriceElement = document.getElementById('total-price');
  
  if (selectedSeats.length === 0) {
    selectedSeatsElement.textContent = 'No seats selected';
    totalPriceElement.textContent = '$0.00';
    document.getElementById('book-button').disabled = true;
  } else {
    selectedSeatsElement.textContent = selectedSeats.join(', ');
    const totalPrice = calculateTotalPrice(selectedSeats);
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    document.getElementById('book-button').disabled = false;
  }
}
*/

// For demonstration in Node.js
console.log(`Cinema layout created with ${cinemaMap.items.length} seats`)

// Create a sample reservation
try {
  const startTime = new Date()
  startTime.setHours(startTime.getHours() + 1)

  const endTime = new Date(startTime)
  endTime.setHours(endTime.getHours() + 2)

  const reservation = reservationSystem.createReservation(
    ["seat_A1", "seat_A2", "seat_A3"],
    {
      id: "customer123",
      name: "John Doe",
      email: "john@example.com",
    },
    startTime,
    endTime,
    {
      movieTitle: "The Matrix",
      ticketPrice: 45.97,
    },
  )

  console.log("Reservation created successfully")
  console.log(`Reservation ID: ${reservation.id}`)

  // Confirm the reservation
  reservationSystem.confirmReservation(reservation.id)

  // Export the current seat map to SVG
  const svg = exportToSVG(cinemaMap, {
    includeLegend: true,
    includeLabels: true,
    showZones: true,
  })

  console.log("SVG generated successfully")
} catch (error) {
  console.error("Error:", error.message)
}

