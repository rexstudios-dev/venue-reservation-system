import { ReservationSystem, generateCinemaLayout, exportToSVG } from "../../index.js"

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

// Export the cinema map and reservation system for use in browser examples
export { cinemaMap, reservationSystem }

