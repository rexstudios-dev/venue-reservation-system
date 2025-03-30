import { ReservationSystem, generateConferenceLayout, exportToSVG } from "../../index.js"

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

// Set up event listeners
reservationSystem.on("reservationCreated", (reservation) => {
  console.log(`New conference reservation created: ${reservation.id}`)
  console.log(`Items: ${reservation.itemIds.length}`)
  console.log(`Organization: ${reservation.customer.name}`)
  console.log(`Time: ${reservation.startTime} - ${reservation.endTime}`)
  console.log(`Layout: ${reservation.metadata.layout}`)
})

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

  // Confirm the reservation\
  reservationSystem.confirmReservation(reservation.id)
  reservation.id
  )

  // Export the current conference map to SVG
  const svg = exportToSVG(classroomLayout, {
    includeLegend: true,
    includeLabels: true,
  })

  console.log("Conference SVG generated successfully")
} catch (error) {
  console.error("Error:", error.message)
}

// Export the layouts and reservation system for use in browser examples
export { classroomLayout, theaterLayout, boardroomLayout, ushapeLayout, reservationSystem }

