import { ReservationSystem, generateRestaurantLayout, exportToSVG } from "../index.js"

// Create a restaurant layout with custom tables
const restaurantMap = generateRestaurantLayout({
  width: 800,
  height: 600,
  customTables: [
    // Window section
    { id: "table_w1", label: "W1", x: 100, y: 100, shape: "rect", capacity: 2, section: "window" },
    { id: "table_w2", label: "W2", x: 100, y: 200, shape: "rect", capacity: 2, section: "window" },
    { id: "table_w3", label: "W3", x: 100, y: 300, shape: "rect", capacity: 2, section: "window" },
    { id: "table_w4", label: "W4", x: 100, y: 400, shape: "rect", capacity: 2, section: "window" },
    { id: "table_w5", label: "W5", x: 100, y: 500, shape: "rect", capacity: 2, section: "window" },

    // Center section - round tables
    { id: "table_c1", label: "C1", x: 300, y: 150, shape: "circle", capacity: 4, section: "center" },
    { id: "table_c2", label: "C2", x: 400, y: 150, shape: "circle", capacity: 4, section: "center" },
    { id: "table_c3", label: "C3", x: 500, y: 150, shape: "circle", capacity: 4, section: "center" },
    { id: "table_c4", label: "C4", x: 300, y: 300, shape: "circle", capacity: 6, width: 80, section: "center" },
    { id: "table_c5", label: "C5", x: 400, y: 300, shape: "circle", capacity: 6, width: 80, section: "center" },
    { id: "table_c6", label: "C6", x: 500, y: 300, shape: "circle", capacity: 6, width: 80, section: "center" },
    { id: "table_c7", label: "C7", x: 300, y: 450, shape: "circle", capacity: 4, section: "center" },
    { id: "table_c8", label: "C8", x: 400, y: 450, shape: "circle", capacity: 4, section: "center" },
    { id: "table_c9", label: "C9", x: 500, y: 450, shape: "circle", capacity: 4, section: "center" },

    // Bar section - high tables
    { id: "bar_1", label: "B1", x: 700, y: 100, shape: "rect", width: 40, height: 40, capacity: 2, section: "bar" },
    { id: "bar_2", label: "B2", x: 700, y: 200, shape: "rect", width: 40, height: 40, capacity: 2, section: "bar" },
    { id: "bar_3", label: "B3", x: 700, y: 300, shape: "rect", width: 40, height: 40, capacity: 2, section: "bar" },
    { id: "bar_4", label: "B4", x: 700, y: 400, shape: "rect", width: 40, height: 40, capacity: 2, section: "bar" },
    { id: "bar_5", label: "B5", x: 700, y: 500, shape: "rect", width: 40, height: 40, capacity: 2, section: "bar" },
  ],
})

// Create a reservation system
const reservationSystem = new ReservationSystem({
  venueMap: restaurantMap,
  settings: {
    reservationExpiryMinutes: 30,
    timeSlotDurationMinutes: 90,
    allowOverlappingReservations: false,
  },
})

// In a browser environment, you would do:
/*
// Get the canvas element
const canvas = document.getElementById('restaurant-map');

// Render the restaurant map
const renderer = renderToCanvas(restaurantMap, canvas, {
  interactive: true,
  onClick: (table) => {
    if (table.status === 'available' && table.type === 'table') {
      // Show reservation form for this table
      showReservationForm(table);
    }
  },
  onHover: (item) => {
    if (item && item.type === 'table') {
      document.getElementById('table-info').textContent = 
        `Table ${item.label} - Capacity: ${item.capacity} - ${item.status}`;
    } else {
      document.getElementById('table-info').textContent = '';
    }
  }
});

// Function to show reservation form
function showReservationForm(table) {
  const form = document.getElementById('reservation-form');
  form.style.display = 'block';
  
  document.getElementById('table-id').value = table.id;
  document.getElementById('table-label').textContent = table.label;
  document.getElementById('table-capacity').textContent = table.capacity;
  document.getElementById('party-size').max = table.capacity;
  
  // Set available time slots
  populateTimeSlots(table.id);
}

// Function to populate time slots
function populateTimeSlots(tableId) {
  const timeSlotSelect = document.getElementById('time-slot');
  timeSlotSelect.innerHTML = '';
  
  // Get current date
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Generate time slots for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    
    // Create option group for this day
    const group = document.createElement('optgroup');
    group.label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    // Generate time slots from 11:00 to 21:00 with 90-minute intervals
    for (let hour = 11; hour <= 21; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 21 && minute === 30) continue; // Skip 21:30
        
        const startTime = new Date(date);
        startTime.setHours(hour, minute);
        
        // Skip times in the past
        if (startTime <= now) continue;
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 90);
        
        // Check if the table is available for this time slot
        const isAvailable = reservationSystem.isItemAvailableForTimeRange(tableId, startTime, endTime);
        
        if (isAvailable) {
          const option = document.createElement('option');
          option.value = startTime.toISOString();
          option.dataset.endTime = endTime.toISOString();
          option.textContent = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          group.appendChild(option);
        }
      }
    }
    
    if (group.children.length > 0) {
      timeSlotSelect.appendChild(group);
    }
  }
}

// Handle reservation form submission
document.getElementById('reservation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  
  const tableId = document.getElementById('table-id').value;
  const customerName = document.getElementById('customer-name').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const partySize = parseInt(document.getElementById('party-size').value);
  
  const timeSlotSelect = document.getElementById('time-slot');
  const selectedOption = timeSlotSelect.options[timeSlotSelect.selectedIndex];
  
  if (!selectedOption) {
    alert('Please select a time slot');
    return;
  }
  
  const startTime = new Date(selectedOption.value);
  const endTime = new Date(selectedOption.dataset.endTime);
  
  try {
    const reservation = reservationSystem.createReservation(
      [tableId],
      {
        id: 'customer' + Date.now(),
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      },
      startTime,
      endTime,
      {
        partySize,
        specialRequests: document.getElementById('special-requests').value
      }
    );
    
    // Show confirmation
    document.getElementById('reservation-form').style.display = 'none';
    document.getElementById('confirmation-section').style.display = 'block';
    document.getElementById('confirmation-id').textContent = reservation.id;
    document.getElementById('confirmation-table').textContent = restaurantMap.getItemById(tableId).label;
    document.getElementById('confirmation-time').textContent = formatDateTime(startTime);
    document.getElementById('confirmation-party').textContent = partySize;
    
    // Update the canvas
    renderer.updateVenueMap(reservationSystem.venueMap);
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

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
*/

// For demonstration in Node.js
console.log(
  `Restaurant layout created with ${restaurantMap.items.filter((item) => item.type === "table").length} tables`,
)

// Create a sample reservation
try {
  const startTime = new Date()
  startTime.setHours(19, 0) // 7:00 PM

  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + 90) // 90-minute reservation

  const reservation = reservationSystem.createReservation(
    ["table_c4"], // Center table for 6 people
    {
      id: "customer456",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
    },
    startTime,
    endTime,
    {
      partySize: 5,
      specialRequests: "Birthday celebration, please prepare a cake",
    },
  )

  console.log("Restaurant reservation created successfully")
  console.log(`Reservation ID: ${reservation.id}`)
  console.log(`Table: ${restaurantMap.getItemById("table_c4").label}`)
  console.log(`Time: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`)
  console.log(`Party size: 5`)

  // Confirm the reservation
  reservationSystem.confirmReservation(reservation.id)

  // Export the current restaurant map to SVG
  const svg = exportToSVG(restaurantMap, {
    includeLegend: true,
    includeLabels: true,
    showZones: true,
  })

  console.log("Restaurant SVG generated successfully")
} catch (error) {
  console.error("Error:", error.message)
}

