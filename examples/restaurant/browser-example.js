import { renderToCanvas } from "../../index.js"
import { restaurantMap, reservationSystem } from "./index.js"

// This file demonstrates how to use the restaurant reservation system in a browser environment

// Function to initialize the restaurant booking interface
export function initRestaurantBooking(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Create the UI elements
  container.innerHTML = `
    <div class="restaurant-booking">
      <h2>Restaurant Table Reservation</h2>
      
      <div class="legend">
        <div class="table-type"><span class="table available"></span> Available</div>
        <div class="table-type"><span class="table reserved"></span> Reserved</div>
        <div class="table-type"><span class="table occupied"></span> Occupied</div>
      </div>
      
      <div class="map-container">
        <canvas id="restaurant-map" width="800" height="600"></canvas>
      </div>
      
      <div class="table-info" id="table-info"></div>
      
      <div class="reservation-form" id="reservation-form" style="display: none;">
        <h3>Reserve Table <span id="table-label"></span></h3>
        <p>Capacity: <span id="table-capacity"></span> people</p>
        
        <input type="hidden" id="table-id">
        
        <div class="form-group">
          <label for="customer-name">Your Name:</label>
          <input type="text" id="customer-name" required>
        </div>
        
        <div class="form-group">
          <label for="customer-email">Email:</label>
          <input type="email" id="customer-email" required>
        </div>
        
        <div class="form-group">
          <label for="customer-phone">Phone:</label>
          <input type="tel" id="customer-phone" required>
        </div>
        
        <div class="form-group">
          <label for="party-size">Party Size:</label>
          <input type="number" id="party-size" min="1" max="10" value="2" required>
        </div>
        
        <div class="form-group">
          <label for="time-slot">Select Time:</label>
          <select id="time-slot" required></select>
        </div>
        
        <div class="form-group">
          <label for="special-requests">Special Requests:</label>
          <textarea id="special-requests" rows="3"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" id="cancel-button">Cancel</button>
          <button type="button" id="reserve-button">Reserve Table</button>
        </div>
      </div>
      
      <div class="confirmation-section" id="confirmation-section" style="display: none;">
        <h3>Reservation Confirmed!</h3>
        <p>Reservation ID: <span id="confirmation-id"></span></p>
        <p>Table: <span id="confirmation-table"></span></p>
        <p>Date & Time: <span id="confirmation-time"></span></p>
        <p>Party Size: <span id="confirmation-party"></span></p>
        <button id="new-reservation-button">Make Another Reservation</button>
      </div>
    </div>
  `

  // Add CSS styles
  const style = document.createElement("style")
  style.textContent = `
    .restaurant-booking {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    
    .table-type {
      display: flex;
      align-items: center;
      margin: 0 10px;
    }
    
    .table {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      border-radius: 50%;
    }
    
    .table.available {
      background-color: #4CAF50;
    }
    
    .table.reserved {
      background-color: #FFC107;
    }
    
    .table.occupied {
      background-color: #F44336;
    }
    
    .map-container {
      margin: 20px 0;
      overflow: auto;
      border: 1px solid #ddd;
    }
    
    .table-info {
      text-align: center;
      min-height: 20px;
      margin-bottom: 20px;
      font-weight: bold;
    }
    
    .reservation-form {
      margin-top: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    #cancel-button {
      background-color: #f44336;
    }
    
    .confirmation-section {
      margin-top: 20px;
      padding: 20px;
      background-color: #f0f8ff;
      border-radius: 4px;
    }
  `
  document.head.appendChild(style)

  // Get the canvas element
  const canvas = document.getElementById("restaurant-map")

  // Render the restaurant map
  const renderer = renderToCanvas(restaurantMap, canvas, {
    interactive: true,
    onClick: (table) => {
      if (table.status === "available" && table.type === "table") {
        // Show reservation form for this table
        showReservationForm(table)
      }
    },
    onHover: (item) => {
      if (item && item.type === "table") {
        document.getElementById("table-info").textContent =
          `Table ${item.label} - Capacity: ${item.capacity} - ${item.status}`
      } else {
        document.getElementById("table-info").textContent = ""
      }
    },
  })

  // Function to show reservation form
  function showReservationForm(table) {
    const form = document.getElementById("reservation-form")
    form.style.display = "block"

    document.getElementById("table-id").value = table.id
    document.getElementById("table-label").textContent = table.label
    document.getElementById("table-capacity").textContent = table.capacity
    document.getElementById("party-size").max = table.capacity

    // Set available time slots
    populateTimeSlots(table.id)
  }

  // Function to populate time slots
  function populateTimeSlots(tableId) {
    const timeSlotSelect = document.getElementById("time-slot")
    timeSlotSelect.innerHTML = ""

    // Get current date
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Generate time slots for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(date.getDate() + day)

      // Create option group for this day
      const group = document.createElement("optgroup")
      group.label = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })

      // Generate time slots from 11:00 to 21:00 with 90-minute intervals
      for (let hour = 11; hour <= 21; hour++) {
        for (const minute of [0, 30]) {
          if (hour === 21 && minute === 30) continue // Skip 21:30

          const startTime = new Date(date)
          startTime.setHours(hour, minute)

          // Skip times in the past
          if (startTime <= now) continue

          const endTime = new Date(startTime)
          endTime.setMinutes(endTime.getMinutes() + 90)

          // Check if the table is available for this time slot
          const isAvailable = reservationSystem.isItemAvailableForTimeRange(tableId, startTime, endTime)

          if (isAvailable) {
            const option = document.createElement("option")
            option.value = startTime.toISOString()
            option.dataset.endTime = endTime.toISOString()
            option.textContent = startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            group.appendChild(option)
          }
        }
      }

      if (group.children.length > 0) {
        timeSlotSelect.appendChild(group)
      }
    }
  }

  // Handle cancel button
  document.getElementById("cancel-button").addEventListener("click", () => {
    document.getElementById("reservation-form").style.display = "none"
  })

  // Handle reserve button
  document.getElementById("reserve-button").addEventListener("click", () => {
    const tableId = document.getElementById("table-id").value
    const customerName = document.getElementById("customer-name").value
    const customerEmail = document.getElementById("customer-email").value
    const customerPhone = document.getElementById("customer-phone").value
    const partySize = Number.parseInt(document.getElementById("party-size").value)

    const timeSlotSelect = document.getElementById("time-slot")
    const selectedOption = timeSlotSelect.options[timeSlotSelect.selectedIndex]

    if (!selectedOption) {
      alert("Please select a time slot")
      return
    }

    if (!customerName || !customerEmail || !customerPhone) {
      alert("Please fill in all required fields")
      return
    }

    const startTime = new Date(selectedOption.value)
    const endTime = new Date(selectedOption.dataset.endTime)

    try {
      const reservation = reservationSystem.createReservation(
        [tableId],
        {
          id: "customer" + Date.now(),
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        startTime,
        endTime,
        {
          partySize,
          specialRequests: document.getElementById("special-requests").value,
        },
      )

      // Show confirmation
      document.getElementById("reservation-form").style.display = "none"
      document.getElementById("confirmation-section").style.display = "block"
      document.getElementById("confirmation-id").textContent = reservation.id
      document.getElementById("confirmation-table").textContent = restaurantMap.getItemById(tableId).label
      document.getElementById("confirmation-time").textContent = formatDateTime(startTime)
      document.getElementById("confirmation-party").textContent = partySize

      // Update the canvas
      renderer.updateVenueMap(reservationSystem.venueMap)
    } catch (error) {
      alert("Error: " + error.message)
    }
  })

  // Handle new reservation button
  document.getElementById("new-reservation-button").addEventListener("click", () => {
    document.getElementById("confirmation-section").style.display = "none"
    document.getElementById("customer-name").value = ""
    document.getElementById("customer-email").value = ""
    document.getElementById("customer-phone").value = ""
    document.getElementById("party-size").value = "2"
    document.getElementById("special-requests").value = ""
  })

  // Helper function to format date and time
  function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }
}

// If this script is loaded directly in a browser, initialize the booking interface
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initRestaurantBooking("restaurant-booking-container")
  })
}

