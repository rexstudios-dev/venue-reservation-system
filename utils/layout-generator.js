import { Seat } from "../lib/seat.js"
import { SeatMap } from "../lib/seat-map.js"

/**
 * Generate a grid layout of seats
 * @param {Object} options - Layout options
 * @param {number} options.rows - Number of rows
 * @param {number} options.columns - Number of columns
 * @param {number} options.rowSpacing - Spacing between rows
 * @param {number} options.columnSpacing - Spacing between columns
 * @param {number} options.seatWidth - Width of each seat
 * @param {number} options.seatHeight - Height of each seat
 * @param {string} options.rowLabels - String of characters to use as row labels (e.g., "ABCDEFGHIJ")
 * @param {Function} options.seatLabelFormatter - Function to format seat labels (default: rowLabel + columnNumber)
 * @param {Array<Object>} options.disabledSeats - Array of {row, column} objects for seats that should be disabled
 * @returns {SeatMap} - Generated seat map
 */
export function generateSeatLayout({
  rows = 10,
  columns = 10,
  rowSpacing = 50,
  columnSpacing = 40,
  seatWidth = 30,
  seatHeight = 30,
  rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  seatLabelFormatter = null,
  disabledSeats = [],
}) {
  const seats = []
  const mapWidth = columns * columnSpacing
  const mapHeight = rows * rowSpacing

  // Default label formatter
  if (!seatLabelFormatter) {
    seatLabelFormatter = (rowIndex, colIndex) => {
      const rowLabel = rowLabels[rowIndex] || rowIndex + 1
      return `${rowLabel}${colIndex + 1}`
    }
  }

  // Create disabled seats lookup for faster checking
  const disabledLookup = {}
  disabledSeats.forEach(({ row, column }) => {
    disabledLookup[`${row},${column}`] = true
  })

  // Generate seats
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let colIndex = 0; colIndex < columns; colIndex++) {
      // Calculate position
      const x = colIndex * columnSpacing + columnSpacing / 2
      const y = rowIndex * rowSpacing + rowSpacing / 2

      // Generate label
      const label = seatLabelFormatter(rowIndex, colIndex)

      // Check if seat should be disabled
      const isDisabled = disabledLookup[`${rowIndex},${colIndex}`]

      // Create seat
      const seat = new Seat({
        id: `seat_${rowIndex}_${colIndex}`,
        label,
        x,
        y,
        status: isDisabled ? "disabled" : "available",
        type: "standard",
        metadata: {
          row: rowIndex,
          column: colIndex,
          width: seatWidth,
          height: seatHeight,
        },
      })

      seats.push(seat)
    }
  }

  // Create and return seat map
  return new SeatMap({
    seats,
    width: mapWidth,
    height: mapHeight,
    metadata: {
      layout: "grid",
      rows,
      columns,
    },
  })
}

/**
 * Generate a theater layout with curved rows
 * @param {Object} options - Layout options
 * @param {number} options.rows - Number of rows
 * @param {Array<number>} options.seatsPerRow - Array specifying number of seats in each row
 * @param {number} options.rowSpacing - Spacing between rows
 * @param {number} options.seatWidth - Width of each seat
 * @param {number} options.seatHeight - Height of each seat
 * @param {string} options.rowLabels - String of characters to use as row labels
 * @param {number} options.curvature - How curved the rows should be (0-1)
 * @returns {SeatMap} - Generated seat map
 */
export function generateTheaterLayout({
  rows = 10,
  seatsPerRow = null,
  rowSpacing = 50,
  seatWidth = 30,
  seatHeight = 30,
  rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  curvature = 0.3,
}) {
  const seats = []

  // If seatsPerRow not provided, create default with increasing seats per row
  if (!seatsPerRow) {
    seatsPerRow = []
    for (let i = 0; i < rows; i++) {
      seatsPerRow.push(10 + Math.floor(i * 0.5))
    }
  }

  // Find the maximum width needed
  const maxSeats = Math.max(...seatsPerRow)
  const mapWidth = maxSeats * seatWidth * 1.5
  const mapHeight = rows * rowSpacing * 1.2

  // Generate seats
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const numSeats = seatsPerRow[rowIndex]
    const rowLabel = rowLabels[rowIndex] || (rowIndex + 1).toString()

    // Calculate row y-position (from bottom to top)
    const y = mapHeight - (rowIndex + 1) * rowSpacing

    // Calculate the width of this row
    const rowWidth = numSeats * seatWidth * 1.2

    for (let seatIndex = 0; seatIndex < numSeats; seatIndex++) {
      // Calculate the seat's position in a curved row
      const relativePos = seatIndex / (numSeats - 1) - 0.5 // -0.5 to 0.5

      // Apply curvature
      const x = mapWidth / 2 + relativePos * rowWidth
      const curveOffset = Math.abs(relativePos) * curvature * rowSpacing * rowIndex
      const curvedY = y + curveOffset

      // Create seat
      const seat = new Seat({
        id: `seat_${rowIndex}_${seatIndex}`,
        label: `${rowLabel}${seatIndex + 1}`,
        x,
        y: curvedY,
        status: "available",
        type: "standard",
        metadata: {
          row: rowIndex,
          seatIndex,
          width: seatWidth,
          height: seatHeight,
        },
      })

      seats.push(seat)
    }
  }

  // Create and return seat map
  return new SeatMap({
    seats,
    width: mapWidth,
    height: mapHeight,
    metadata: {
      layout: "theater",
      rows,
      seatsPerRow,
    },
  })
}

