import { renderToCanvas } from "../../index.js"
import { cinemaMap, reservationSystem } from "./index.js"

// This file demonstrates how to use the cinema reservation system in a browser environment

// Initialize variables to track selected seats
let selectedSeats = []

// Function to initialize the cinema booking interface
export function initCinemaBooking(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Create the UI elements
  container.innerHTML = `
    <div class="cinema-booking">
      <h2>Movie Seat Booking</h2>
      <div class="movie-info">
        <h3 id="movie-title">The Matrix Resurrections</h3>
        <p>Select your seats for the show at <select id="movie-time">
          <option data-start-time="${getTimeString(1)}" data-end-time="${getTimeString(3)}">5:00 PM</option>
          <option data-start-time="${getTimeString(3)}" data-end-time="${getTimeString(5)}">7:00 PM</option>
          <option data-start-time="${getTimeString(5)}" data-end-time="${getTimeString(7)}">9:00 PM</option>
        </select></p>
      </div>
      
      <div class="legend">
        <div class="seat-type"><span class="seat available"></span> Available</div>
        <div class="seat-type"><span class="seat reserved"></span> Selected</div>
        <div class="seat-type"><span class="seat occupied"></span> Occupied</div>
        <div class="seat-type"><span class="seat disabled"></span> Disabled</div>
      </div>
      
      <div class="screen">SCREEN</div>
      
      <div class="seat-map-container">
        <canvas id="cinema-map" width="800" height="600"></canvas>
      </div>
      
      <div class="seat-info" id="seat-info"></div>
      
      <div class="booking-section" id="booking-section">
        <div class="selected-seats">
          <p>Selected Seats: <span id="selected-seats">No seats selected</span></p>
          <p>Total Price: <span id="total-price">$0.00</span></p>
        </div>
        
        <div class="customer-info">
          <input type="text" id="customer-name" placeholder="Your Name" required>
          <input type="email" id="customer-email" placeholder="Your Email" required>
        </div>
        
        <button id="book-button" disabled>Book Seats</button>
      </div>
      
      <div class="confirmation-section" id="confirmation-section" style="display: none;">
        <h3>Booking Confirmed!</h3>
        <p>Reservation ID: <span id="confirmation-id"></span></p>
        <p>Seats: <span id="confirmation-seats"></span></p>
        <p>Time: <span id="confirmation-time"></span></p>
        <button id="new-booking-button">Make Another Booking</button>
      </div>
    </div>
  `

  // Add CSS styles
  const style = document.createElement("style")
  style.textContent = `
    .cinema-booking {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    
    .seat-type {
      display: flex;
      align-items: center;
      margin: 0 10px;
    }
    
    .seat {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      border-radius: 3px;
    }
    
    .seat.available {
      background-color: #4CAF50;
    }
    
    .seat.reserved {
      background-color: #FFC107;
    }
    
    .seat.occupied {
      background-color: #F44336;
    }
    
    .seat.disabled {
      background-color: #9E9E9E;
    }
    
    .screen {
      background-color: #ddd;
      color: #333;
      text-align: center;
      padding: 10px;
      margin: 20px 0;
      border-radius: 5px;
      font-weight: bold;
    }
    
    .seat-map-container {
      margin: 20px 0;
      overflow: auto;
      border: 1px solid #ddd;
    }
    
    .seat-info {
      text-align: center;
      min-height: 20px;
      margin-bottom: 20px;
    }
    
    .booking-section {
      margin-top: 20px;
    }
    
    .selected-seats {
      margin-bottom: 20px;
    }
    
    .customer-info {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .customer-info input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    button {
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
  const canvas = document.getElementById("cinema-map")

  // Render the cinema map
  const renderer = renderToCanvas(cinemaMap, canvas, {
    interactive: true,
    onClick: (seat) => {
      if (seat.status === "available") {
        // Toggle seat selection
        if (selectedSeats.includes(seat.id)) {
          // Deselect
          seat.status = "available"
          selectedSeats = selectedSeats.filter((id) => id !== seat.id)
        } else {
          // Select
          seat.status = "reserved"
          selectedSeats.push(seat.id)
        }

        // Update the UI
        renderer.render()
        updateSelectedSeatsDisplay()
      }
    },
    onHover: (seat) => {
      if (seat) {
        document.getElementById("seat-info").textContent =
          `Seat ${seat.label} - ${seat.status} - ${seat.metadata.category}`
      } else {
        document.getElementById("seat-info").textContent = ""
      }
    },
  })

  // Handle reservation form submission
  document.getElementById("book-button").addEventListener("click", () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat")
      return
    }

    const customerName = document.getElementById("customer-name").value
    const customerEmail = document.getElementById("customer-email").value

    if (!customerName || !customerEmail) {
      alert("Please enter your name and email")
      return
    }

    // Get the selected movie time
    const movieTimeSelect = document.getElementById("movie-time")
    const selectedOption = movieTimeSelect.options[movieTimeSelect.selectedIndex]
    const startTime = new Date(selectedOption.dataset.startTime)
    const endTime = new Date(selectedOption.dataset.endTime)

    try {
      const reservation = reservationSystem.createReservation(
        selectedSeats,
        {
          id: "customer" + Date.now(),
          name: customerName,
          email: customerEmail,
        },
        startTime,
        endTime,
        {
          movieTitle: document.getElementById("movie-title").textContent,
          ticketPrice: calculateTotalPrice(selectedSeats),
        },
      )

      // Show confirmation
      document.getElementById("booking-section").style.display = "none"
      document.getElementById("confirmation-section").style.display = "block"
      document.getElementById("confirmation-id").textContent = reservation.id
      document.getElementById("confirmation-seats").textContent = selectedSeats
        .map((id) => {
          const seat = cinemaMap.getItemById(id)
          return seat ? seat.label : id
        })
        .join(", ")
      document.getElementById("confirmation-time").textContent = formatDateTime(startTime)

      // Clear selection
      selectedSeats = []

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
    document.getElementById("customer-name").value = ""
    document.getElementById("customer-email").value = ""
    updateSelectedSeatsDisplay()
  })

  // Helper function to calculate total price
  function calculateTotalPrice(seatIds) {
    return seatIds.reduce((total, seatId) => {
      const seat = cinemaMap.getItemById(seatId)
      const category = seat?.metadata?.category
      const prices = {
        premium: 15.99,
        standard: 12.99,
        economy: 9.99,
      }
      return total + (prices[category] || 12.99)
    }, 0)
  }

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

  // Function to update the selected seats display
  function updateSelectedSeatsDisplay() {
    const selectedSeatsElement = document.getElementById("selected-seats")
    const totalPriceElement = document.getElementById("total-price")

    if (selectedSeats.length === 0) {
      selectedSeatsElement.textContent = "No seats selected"
      totalPriceElement.textContent = "$0.00"
      document.getElementById("book-button").disabled = true
    } else {
      selectedSeatsElement.textContent = selectedSeats
        .map((id) => {
          const seat = cinemaMap.getItemById(id)
          return seat ? seat.label : id
        })
        .join(", ")
      const totalPrice = calculateTotalPrice(selectedSeats)
      totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`
      document.getElementById("book-button").disabled = false
    }
  }

  // Helper function to get time string for demo
  function getTimeString(hoursFromNow) {
    const date = new Date()
    date.setHours(date.getHours() + hoursFromNow)
    return date.toISOString()
  }
}

// If this script is loaded directly in a browser, initialize the booking interface
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initCinemaBooking("cinema-booking-container")
  })
}

