import { renderToCanvas } from "../../index.js"
import { classroomLayout, theaterLayout, boardroomLayout, ushapeLayout, reservationSystem } from "./index.js"

// This file demonstrates how to use the conference room reservation system in a browser environment

// Initialize variables to track selected items
let selectedItems = []
let currentLayout = "classroom"
let currentVenueMap = classroomLayout

// Function to initialize the conference room booking interface
export function initConferenceBooking(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Create the UI elements
  container.innerHTML = `
    <div class="conference-booking">
      <h2>Conference Room Reservation</h2>
      
      <div class="layout-selector">
        <label for="layout-selector">Room Layout:</label>
        <select id="layout-selector">
          <option value="classroom">Classroom Style</option>
          <option value="theater">Theater Style</option>
          <option value="boardroom">Boardroom Style</option>
          <option value="ushape">U-Shape Style</option>
        </select>
      </div>
      
      <div class="capacity-info" id="capacity-info"></div>
      
      <div class="legend">
        <div class="item-type"><span class="item available"></span> Available</div>
        <div class="item-type"><span class="item reserved"></span> Selected</div>
        <div class="item-type"><span class="item occupied"></span> Occupied</div>
        <div class="item-type"><span class="item disabled"></span> Fixed</div>
      </div>
      
      <div class="map-container">
        <canvas id="conference-map" width="800" height="600"></canvas>
      </div>
      
      <div class="item-info" id="item-info"></div>
      
      <div class="booking-section" id="booking-section">
        <div class="selected-items">
          <p>Selected Items: <span id="selected-items">No items selected</span></p>
        </div>
        
        <div class="reservation-form">
          <div class="form-group">
            <label for="organization-name">Organization Name:</label>
            <input type="text" id="organization-name" required>
          </div>
          
          <div class="form-group">
            <label for="contact-name">Contact Name:</label>
            <input type="text" id="contact-name" required>
          </div>
          
          <div class="form-group">
            <label for="contact-email">Email:</label>
            <input type="email" id="contact-email" required>
          </div>
          
          <div class="form-group">
            <label for="attendees">Number of Attendees:</label>
            <input type="number" id="attendees" min="1" value="10" required>
          </div>
          
          <div class="form-group">
            <label for="reservation-date">Date:</label>
            <input type="date" id="reservation-date" required>
          </div>
          
          <div class="form-group">
            <label for="reservation-time">Start Time:</label>
            <input type="time" id="reservation-time" required>
          </div>
          
          <div class="form-group">
            <label for="equipment">Equipment Needed:</label>
            <input type="text" id="equipment" placeholder="Projector, whiteboard, etc.">
          </div>
          
          <div class="form-group checkbox">
            <input type="checkbox" id="catering">
            <label for="catering">Catering Required</label>
          </div>
          
          <button type="button" id="book-button" disabled>Book Conference Room</button>
        </div>
      </div>
      
      <div class="confirmation-section" id="confirmation-section" style="display: none;">
        <h3>Reservation Confirmed!</h3>
        <p>Reservation ID: <span id="confirmation-id"></span></p>
        <p>Items Reserved: <span id="confirmation-items"></span></p>
        <p>Date & Time: <span id="confirmation-time"></span></p>
        <p>Layout: <span id="confirmation-layout"></span></p>
        <button id="new-booking-button">Make Another Reservation</button>
      </div>
    </div>
  `

  // Add CSS styles
  const style = document.createElement("style")
  style.textContent = `
    .conference-booking {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .layout-selector {
      margin: 20px 0;
      display: flex;
      align-items: center;
    }
    
    .layout-selector label {
      margin-right: 10px;
      font-weight: bold;
    }
    
    .layout-selector select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .capacity-info {
      margin-bottom: 10px;
      font-weight: bold;
      color: #2196F3;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    
    .item-type {
      display: flex;
      align-items: center;
      margin: 0 10px;
    }
    
    .item {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      border-radius: 3px;
    }
    
    .item.available {
      background-color: #4CAF50;
    }
    
    .item.reserved {
      background-color: #FFC107;
    }
    
    .item.occupied {
      background-color: #F44336;
    }
    
    .item.disabled {
      background-color: #9E9E9E;
    }
    
    .map-container {
      margin: 20px 0;
      overflow: auto;
      border: 1px solid #ddd;
    }
    
    .item-info {
      text-align: center;
      min-height: 20px;
      margin-bottom: 20px;
    }
    
    .booking-section {
      margin-top: 20px;
    }
    
    .selected-items {
      margin-bottom: 20px;
      font-weight: bold;
    }
    
    .reservation-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .form-group.checkbox {
      display: flex;
      align-items: center;
    }
    
    .form-group.checkbox input {
      width: auto;
      margin-right: 10px;
    }
    
    .form-group.checkbox label {
      margin-bottom: 0;
    }
    
    button {
      grid-column: span 2;
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:disabled {
      background-color: #ddd;
      cursor: not-allowed;
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
  const canvas = document.getElementById("conference-map")

  // Set default date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  document.getElementById("reservation-date").valueAsDate = tomorrow

  // Render the initial layout
  const renderer = renderToCanvas(currentVenueMap, canvas, {
    interactive: true,
    onClick: (item) => {
      if (item.status === "available") {
        // Toggle item selection
        if (selectedItems.includes(item.id)) {
          // Deselect
          item.status = "available"
          selectedItems = selectedItems.filter((id) => id !== item.id)
        } else {
          // Select
          item.status = "reserved"
          selectedItems.push(item.id)
        }

        // Update the UI
        renderer.render()
        updateSelectedItemsDisplay()
      }
    },
    onHover: (item) => {
      if (item) {
        document.getElementById("item-info").textContent =
          `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${item.label} - ${item.status}`
      } else {
        document.getElementById("item-info").textContent = ""
      }
    },
  })

  // Update capacity info
  updateCapacityInfo()

  // Handle layout change
  document.getElementById("layout-selector").addEventListener("change", (event) => {
    const newLayout = event.target.value

    // Clear selections
    selectedItems = []

    // Update the current layout
    switch (newLayout) {
      case "classroom":
        currentVenueMap = classroomLayout
        break
      case "theater":
        currentVenueMap = theaterLayout
        break
      case "boardroom":
        currentVenueMap = boardroomLayout
        break
      case "ushape":
        currentVenueMap = ushapeLayout
        break
    }

    currentLayout = newLayout

    // Update the reservation system
    reservationSystem.venueMap = currentVenueMap

    // Update the canvas
    renderer.updateVenueMap(currentVenueMap)

    // Update the UI
    updateSelectedItemsDisplay()
    updateCapacityInfo()
  })

  // Handle reservation form submission
  document.getElementById("book-button").addEventListener("click", () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item")
      return
    }

    const organizationName = document.getElementById("organization-name").value
    const contactName = document.getElementById("contact-name").value
    const contactEmail = document.getElementById("contact-email").value

    const dateInput = document.getElementById("reservation-date").value
    const timeInput = document.getElementById("reservation-time").value

    if (!organizationName || !contactName || !contactEmail || !dateInput || !timeInput) {
      alert("Please fill in all required fields")
      return
    }

    // Create date objects
    const startTime = new Date(`${dateInput}T${timeInput}`)
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 4) // 4-hour reservation

    try {
      const reservation = reservationSystem.createReservation(
        selectedItems,
        {
          id: "org" + Date.now(),
          name: organizationName,
          contactName: contactName,
          email: contactEmail,
        },
        startTime,
        endTime,
        {
          layout: currentLayout,
          attendees: document.getElementById("attendees").value,
          equipment: document.getElementById("equipment").value,
          catering: document.getElementById("catering").checked,
        },
      )

      // Show confirmation
      document.getElementById("booking-section").style.display = "none"
      document.getElementById("confirmation-section").style.display = "block"
      document.getElementById("confirmation-id").textContent = reservation.id
      document.getElementById("confirmation-items").textContent = selectedItems.length
      document.getElementById("confirmation-time").textContent = formatDateTime(startTime)
      document.getElementById("confirmation-layout").textContent = currentLayout

      // Clear selection
      selectedItems = []

      // Update the canvas
      renderer.updateVenueMap(reservationSystem.venueMap)
    } catch (error) {
      alert("Error: " + error.message)
    }
  })

  // Handle new booking button
  document.getElementById("new-booking-button").addEventListener("click", () => {
    document.getElementById("confirmation-section").style.display = "none"
    document.getElementById("booking-section").style.display = "block"
    document.getElementById("organization-name").value = ""
    document.getElementById("contact-name").value = ""
    document.getElementById("contact-email").value = ""
    document.getElementById("attendees").value = "10"
    document.getElementById("equipment").value = ""
    document.getElementById("catering").checked = false
  })

  // Function to update capacity info
  function updateCapacityInfo() {
    const availableItems = currentVenueMap.getItemsByStatus("available")
    const totalCapacity = availableItems.reduce((sum, item) => sum + (item.capacity || 1), 0)

    document.getElementById("capacity-info").textContent = `Total capacity: ${totalCapacity} people`
  }

  // Helper function to format date and time
  function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  // Function to update the selected items display
  function updateSelectedItemsDisplay() {
    const selectedItemsElement = document.getElementById("selected-items")

    if (selectedItems.length === 0) {
      selectedItemsElement.textContent = "No items selected"
      document.getElementById("book-button").disabled = true
    } else {
      selectedItemsElement.textContent = `${selectedItems.length} items selected`
      document.getElementById("book-button").disabled = false
    }
  }
}

// If this script is loaded directly in a browser, initialize the booking interface
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initConferenceBooking("conference-booking-container")
  })
}

