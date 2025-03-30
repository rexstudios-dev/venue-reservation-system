import { ReservationSystem, generateConferenceLayout, exportToSVG } from "../index.js"

// Create different conference room layouts
const classroomLayout = generateConferenceLayout({
  width: 800,
  height: 600,
  layout: "classroom",
  capacity: 40,
})

const theaterLayout = generateConferenceLayout({
  width: 800,
  height: 600,
  layout: "theater",
  capacity: 60,
})

const boardroomLayout = generateConferenceLayout({
  width: 800,
  height: 600,
  layout: "boardroom",
  capacity: 16,
})

const ushapeLayout = generateConferenceLayout({
  width: 800,
  height: 600,
  layout: "ushape",
  capacity: 24,
})

// Create a reservation system with the classroom layout initially
const reservationSystem = new ReservationSystem({
  venueMap: classroomLayout,
  settings: {
    reservationExpiryMinutes: 60,
    allowMultipleItemsPerReservation: true,
    timeSlotDurationMinutes: 60 * 4, // 4-hour slots
  },
})

// In a browser environment, you would do:
/*
// Get the canvas element
const canvas = document.getElementById('conference-map');

// Track the current layout
let currentLayout = 'classroom';
let currentVenueMap = classroomLayout;

// Render the initial layout
const renderer = renderToCanvas(currentVenueMap, canvas, {
  interactive: true,
  onClick: (item) => {
    if (item.status === 'available') {
      // Toggle item selection
      if (selectedItems.includes(item.id)) {
        // Deselect
        item.status = 'available';
        selectedItems = selectedItems.filter(id => id !== item.id);
      } else {
        // Select
        item.status = 'reserved';
        selectedItems.push(item.id);
      }
      
      // Update the UI
      renderer.render();
      updateSelectedItemsDisplay();
    }
  },
  onHover: (item) => {
    if (item) {
      document.getElementById('item-info').textContent = 
        `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${item.label} - ${item.status}`;
    } else {
      document.getElementById('item-info').textContent = '';
    }
  }
});

// Handle layout change
document.getElementById('layout-selector').addEventListener('change', (event) => {
  const newLayout = event.target.value;
  
  // Clear selections
  selectedItems = [];
  
  // Update the current layout
  switch (newLayout) {
    case 'classroom':
      currentVenueMap = classroomLayout;
      break;
    case 'theater':
      currentVenueMap = theaterLayout;
      break;
    case 'boardroom':
      currentVenueMap = boardroomLayout;
      break;
    case 'ushape':
      currentVenueMap = ushapeLayout;
      break;
  }
  
  currentLayout = newLayout;
  
  // Update the reservation system
  reservationSystem.venueMap = currentVenueMap;
  
  // Update the canvas
  renderer.updateVenueMap(currentVenueMap);
  
  // Update the UI
  updateSelectedItemsDisplay();
  updateCapacityInfo();
});

// Function to update capacity info
function updateCapacityInfo() {
  const availableItems = currentVenueMap.getItemsByStatus('available');
  const totalCapacity = availableItems.reduce((sum, item) => sum + (item.capacity || 1), 0);
  
  document.getElementById('capacity-info').textContent = 
    `Total capacity: ${totalCapacity} people`;
}

// Handle reservation form submission
document.getElementById('reservation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  
  if (selectedItems.length === 0) {
    alert('Please select at least one item');
    return;
  }
  
  const organizationName = document.getElementById('organization-name').value;
  const contactName = document.getElementById('contact-name').value;
  const contactEmail = document.getElementById('contact-email').value;
  
  const dateInput = document.getElementById('reservation-date').value;
  const timeInput = document.getElementById('reservation-time').value;
  
  if (!dateInput || !timeInput) {
    alert('Please select a date and time');
    return;
  }
  
  // Create date objects
  const startTime = new Date(`${dateInput}T${timeInput}`);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 4); // 4-hour reservation
  
  try {
    const reservation = reservationSystem.createReservation(
      selectedItems,
      {
        id: 'org' + Date.now(),
        name: organizationName,
        contactName: contactName,
        email: contactEmail
      },
      startTime,
      endTime,
      {
        layout: currentLayout,
        attendees: document.getElementById('attendees').value,
        equipment: document.getElementById('equipment').value,
        catering: document.getElementById('catering').checked
      }
    );
    
    // Show confirmation
    document.getElementById('booking-section').style.display = 'none';
    document.getElementById('confirmation-section').style.display = 'block';
    document.getElementById('confirmation-id').textContent = reservation.id;
    document.getElementById('confirmation-items').textContent = selectedItems.length;
    document.getElementById('confirmation-time').textContent = formatDateTime(startTime);
    document.getElementById('confirmation-layout').textContent = currentLayout;
    
    // Clear selection
    selectedItems = [];
    
    // Update the canvas
    renderer.updateVenueMap(reservationSystem.venueMap);
    
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Helper function to format date and time
function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

// Function to update the selected items display
function updateSelectedItemsDisplay() {
  const selectedItemsElement = document.getElementById('selected-items');
  
  if (selectedItems.length === 0) {
    selectedItemsElement.textContent = 'No items selected';
    document.getElementById('book-button').disabled = true;
  } else {
    selectedItemsElement.textContent = `${selectedItems.length} items selected`;
    document.getElementById('book-button').disabled = false;
  }
}
*/

// For demonstration in Node.js
console.log(`Conference layouts created successfully:`)
console.log(`- Classroom: ${classroomLayout.items.filter((item) => item.type === "table").length} tables`)
console.log(`- Theater: ${theaterLayout.items.filter((item) => item.type === "chair").length} chairs`)
console.log(`- Boardroom: ${boardroomLayout.items.filter((item) => item.type === "chair").length} chairs`)
console.log(`- U-shape: ${ushapeLayout.items.filter((item) => item.type === "table").length} tables`)

// Create a sample reservation
try {
  const startTime = new Date()
  startTime.setDate(startTime.getDate() + 1) // Tomorrow
  startTime.setHours(9, 0) // 9:00 AM

  const endTime = new Date(startTime)
  endTime.setHours(endTime.getHours() + 4) // 4-hour reservation

  // Get all tables in the classroom layout
  const tables = classroomLayout.items
    .filter((item) => item.type === "table" && item.status === "available")
    .slice(0, 5) // First 5 tables

  const tableIds = tables.map((table) => table.id)

  const reservation = reservationSystem.createReservation(
    tableIds,
    {
      id: "org789",
      name: "Acme Corporation",
      contactName: "Bob Johnson",
      email: "bob@acme.com",
    },
    startTime,
    endTime,
    {
      layout: "classroom",
      attendees: 10,
      equipment: "Projector, whiteboard",
      catering: true,
    },
  )

  console.log("Conference reservation created successfully")
  console.log(`Reservation ID: ${reservation.id}`)
  console.log(`Tables: ${tableIds.length}`)
  console.log(`Time: ${startTime.toLocaleString()} - ${endTime.toLocaleString()}`)

  // Confirm the reservation
  reservationSystem.confirmReservation(reservation.id)

  // Export the current conference map to SVG
  const svg = exportToSVG(classroomLayout, {
    includeLegend: true,
    includeLabels: true,
  })

  console.log("Conference SVG generated successfully")
} catch (error) {
  console.error("Error:", error.message)
}

