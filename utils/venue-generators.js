import { VenueItem } from "../lib/venue-item.js"
import { VenueMap } from "../lib/venue-map.js"

/**
 * Generate a cinema layout with curved rows of seats
 * @param {Object} options - Layout options
 * @param {number} options.rows - Number of rows
 * @param {Array<number>} options.seatsPerRow - Array specifying number of seats in each row
 * @param {number} options.rowSpacing - Spacing between rows
 * @param {number} options.seatWidth - Width of each seat
 * @param {number} options.seatHeight - Height of each seat
 * @param {string} options.rowLabels - String of characters to use as row labels
 * @param {number} options.curvature - How curved the rows should be (0-1)
 * @returns {VenueMap} - Generated venue map
 */
export function generateCinemaLayout({
  rows = 10,
  seatsPerRow = null,
  rowSpacing = 50,
  seatWidth = 30,
  seatHeight = 30,
  rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  curvature = 0.3,
}) {
  const items = []

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
      const seat = new VenueItem({
        id: `seat_${rowLabel}${seatIndex + 1}`,
        label: `${rowLabel}${seatIndex + 1}`,
        x,
        y: curvedY,
        status: "available",
        type: "seat",
        shape: "rect",
        metadata: {
          row: rowIndex,
          seatIndex,
          width: seatWidth,
          height: seatHeight,
          category: rowIndex < 3 ? "premium" : rowIndex < 7 ? "standard" : "economy",
        },
      })

      items.push(seat)
    }
  }

  // Add screen
  const screen = new VenueItem({
    id: "screen",
    label: "SCREEN",
    x: mapWidth / 2,
    y: mapHeight - rows * rowSpacing - 50,
    status: "disabled",
    type: "screen",
    shape: "rect",
    metadata: {
      width: mapWidth * 0.8,
      height: 20,
    },
  })

  items.push(screen)

  // Create zones for different seat categories
  const zones = [
    {
      id: "premium",
      name: "Premium",
      color: "#FF5722",
      points: [
        [mapWidth * 0.1, mapHeight - 3 * rowSpacing - 20],
        [mapWidth * 0.9, mapHeight - 3 * rowSpacing - 20],
        [mapWidth * 0.9, mapHeight],
        [mapWidth * 0.1, mapHeight],
      ],
    },
    {
      id: "standard",
      name: "Standard",
      color: "#2196F3",
      points: [
        [mapWidth * 0.1, mapHeight - 7 * rowSpacing - 20],
        [mapWidth * 0.9, mapHeight - 7 * rowSpacing - 20],
        [mapWidth * 0.9, mapHeight - 3 * rowSpacing - 20],
        [mapWidth * 0.1, mapHeight - 3 * rowSpacing - 20],
      ],
    },
    {
      id: "economy",
      name: "Economy",
      color: "#4CAF50",
      points: [
        [mapWidth * 0.1, mapHeight - rows * rowSpacing - 20],
        [mapWidth * 0.9, mapHeight - rows * rowSpacing - 20],
        [mapWidth * 0.9, mapHeight - 7 * rowSpacing - 20],
        [mapWidth * 0.1, mapHeight - 7 * rowSpacing - 20],
      ],
    },
  ]

  // Create and return venue map
  return new VenueMap({
    items,
    width: mapWidth,
    height: mapHeight,
    metadata: {
      layout: "cinema",
      rows,
      seatsPerRow,
      zones,
    },
  })
}

/**
 * Generate a restaurant layout with tables
 * @param {Object} options - Layout options
 * @param {number} options.width - Width of the restaurant
 * @param {number} options.height - Height of the restaurant
 * @param {number} options.numTables - Number of tables to generate
 * @param {Array<Object>} options.customTables - Custom table configurations
 * @returns {VenueMap} - Generated venue map
 */
export function generateRestaurantLayout({ width = 800, height = 600, numTables = 20, customTables = [] }) {
  const items = []

  // Add custom tables if provided
  if (customTables && customTables.length > 0) {
    customTables.forEach((tableConfig, index) => {
      const table = new VenueItem({
        id: tableConfig.id || `table_${index + 1}`,
        label: tableConfig.label || `${index + 1}`,
        x: tableConfig.x,
        y: tableConfig.y,
        rotation: tableConfig.rotation || 0,
        status: tableConfig.status || "available",
        type: "table",
        shape: tableConfig.shape || "circle",
        capacity: tableConfig.capacity || 4,
        metadata: {
          width: tableConfig.width || 60,
          height: tableConfig.height || 60,
          section: tableConfig.section || "main",
        },
      })

      items.push(table)

      // Add chairs around the table if it's a regular table
      if (tableConfig.shape !== "booth" && tableConfig.addChairs !== false) {
        const chairDistance = Math.max(tableConfig.width || 60, tableConfig.height || 60) * 0.75
        const numChairs = tableConfig.capacity || 4

        for (let i = 0; i < numChairs; i++) {
          const angle = (i * 2 * Math.PI) / numChairs + ((tableConfig.rotation || 0) * Math.PI) / 180
          const chairX = tableConfig.x + chairDistance * Math.cos(angle)
          const chairY = tableConfig.y + chairDistance * Math.sin(angle)

          const chair = new VenueItem({
            id: `chair_${tableConfig.id || index + 1}_${i + 1}`,
            label: "",
            x: chairX,
            y: chairY,
            rotation: (angle * 180) / Math.PI + 90,
            status: "disabled", // Chairs are usually not directly reservable
            type: "chair",
            shape: "rect",
            metadata: {
              width: 20,
              height: 20,
              tableId: tableConfig.id || `table_${index + 1}`,
            },
          })

          items.push(chair)
        }
      }
    })
  } else {
    // Generate random tables if no custom tables provided
    const sections = [
      { name: "window", weight: 0.3, minX: width * 0.05, maxX: width * 0.25, minY: height * 0.05, maxY: height * 0.95 },
      { name: "main", weight: 0.5, minX: width * 0.3, maxX: width * 0.7, minY: height * 0.05, maxY: height * 0.95 },
      { name: "bar", weight: 0.2, minX: width * 0.75, maxX: width * 0.95, minY: height * 0.05, maxY: height * 0.95 },
    ]

    const tableShapes = ["circle", "rect"]
    const tableCapacities = [2, 4, 6, 8]

    for (let i = 0; i < numTables; i++) {
      // Select a section based on weights
      let sectionIndex = 0
      const rand = Math.random()
      let cumulativeWeight = 0

      for (let j = 0; j < sections.length; j++) {
        cumulativeWeight += sections[j].weight
        if (rand <= cumulativeWeight) {
          sectionIndex = j
          break
        }
      }

      const section = sections[sectionIndex]

      // Generate random position within the section
      const x = section.minX + Math.random() * (section.maxX - section.minX)
      const y = section.minY + Math.random() * (section.maxY - section.minY)

      // Select random table properties
      const shape = tableShapes[Math.floor(Math.random() * tableShapes.length)]
      const capacity = tableCapacities[Math.floor(Math.random() * tableCapacities.length)]
      const tableSize = 30 + capacity * 5 // Size based on capacity

      const table = new VenueItem({
        id: `table_${i + 1}`,
        label: `${i + 1}`,
        x,
        y,
        rotation: Math.floor(Math.random() * 360),
        status: "available",
        type: "table",
        shape,
        capacity,
        metadata: {
          width: tableSize,
          height: shape === "rect" ? tableSize * 0.6 : tableSize,
          section: section.name,
        },
      })

      items.push(table)
    }
  }

  // Add walls and features
  const walls = [
    // Outer walls
    new VenueItem({
      id: "wall_outer",
      label: "",
      x: 0,
      y: 0,
      status: "disabled",
      type: "wall",
      shape: "polygon",
      points: [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
        [0, 0],
      ],
      metadata: {
        isOuterWall: true,
      },
    }),

    // Entrance
    new VenueItem({
      id: "entrance",
      label: "Entrance",
      x: width / 2,
      y: height,
      status: "disabled",
      type: "entrance",
      shape: "rect",
      metadata: {
        width: 60,
        height: 20,
      },
    }),
  ]

  // Add zones for different sections
  const zones = [
    {
      id: "window",
      name: "Window Section",
      color: "#8BC34A",
      points: [
        [width * 0.05, height * 0.05],
        [width * 0.25, height * 0.05],
        [width * 0.25, height * 0.95],
        [width * 0.05, height * 0.95],
      ],
    },
    {
      id: "main",
      name: "Main Dining",
      color: "#03A9F4",
      points: [
        [width * 0.3, height * 0.05],
        [width * 0.7, height * 0.05],
        [width * 0.7, height * 0.95],
        [width * 0.3, height * 0.95],
      ],
    },
    {
      id: "bar",
      name: "Bar Area",
      color: "#FF9800",
      points: [
        [width * 0.75, height * 0.05],
        [width * 0.95, height * 0.05],
        [width * 0.95, height * 0.95],
        [width * 0.75, height * 0.95],
      ],
    },
  ]

  // Create and return venue map
  return new VenueMap({
    items: [...items, ...walls],
    width,
    height,
    metadata: {
      layout: "restaurant",
      zones,
    },
  })
}

/**
 * Generate a conference room layout
 * @param {Object} options - Layout options
 * @param {number} options.width - Width of the room
 * @param {number} options.height - Height of the room
 * @param {string} options.layout - Layout type ('classroom', 'theater', 'boardroom', 'ushape')
 * @param {number} options.capacity - Desired capacity
 * @returns {VenueMap} - Generated venue map
 */
export function generateConferenceLayout({ width = 800, height = 600, layout = "classroom", capacity = 30 }) {
  const items = []

  switch (layout.toLowerCase()) {
    case "classroom": {
      // Classroom style with rows of tables and chairs
      const rowSpacing = 80
      const tableWidth = 120
      const tableHeight = 40
      const tablesPerRow = Math.floor((width * 0.8) / (tableWidth + 20))
      const numRows = Math.ceil(capacity / (tablesPerRow * 2)) // 2 people per table

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const y = height * 0.3 + rowIndex * rowSpacing

        for (let tableIndex = 0; tableIndex < tablesPerRow; tableIndex++) {
          const x = width * 0.1 + tableIndex * (tableWidth + 20) + tableWidth / 2

          // Add table
          const table = new VenueItem({
            id: `table_${rowIndex + 1}_${tableIndex + 1}`,
            label: `${rowIndex + 1}-${tableIndex + 1}`,
            x,
            y,
            status: "available",
            type: "table",
            shape: "rect",
            capacity: 2,
            metadata: {
              width: tableWidth,
              height: tableHeight,
              section: "classroom",
            },
          })

          items.push(table)

          // Add chairs (2 per table)
          for (let chairIndex = 0; chairIndex < 2; chairIndex++) {
            const chairX = x - 30 + chairIndex * 60
            const chairY = y + 30

            const chair = new VenueItem({
              id: `chair_${rowIndex + 1}_${tableIndex + 1}_${chairIndex + 1}`,
              label: "",
              x: chairX,
              y: chairY,
              status: "disabled",
              type: "chair",
              shape: "rect",
              metadata: {
                width: 20,
                height: 20,
                tableId: `table_${rowIndex + 1}_${tableIndex + 1}`,
              },
            })

            items.push(chair)
          }
        }
      }

      // Add presenter area
      const presenter = new VenueItem({
        id: "presenter_table",
        label: "Presenter",
        x: width / 2,
        y: height * 0.15,
        status: "disabled",
        type: "table",
        shape: "rect",
        metadata: {
          width: width * 0.3,
          height: 40,
          section: "presenter",
        },
      })

      items.push(presenter)
      break
    }

    case "theater": {
      // Theater style with rows of chairs
      const rowSpacing = 50
      const chairWidth = 30
      const chairsPerRow = Math.floor((width * 0.8) / (chairWidth + 10))
      const numRows = Math.ceil(capacity / chairsPerRow)

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const y = height * 0.3 + rowIndex * rowSpacing

        for (let chairIndex = 0; chairIndex < chairsPerRow; chairIndex++) {
          const x = width * 0.1 + chairIndex * (chairWidth + 10) + chairWidth / 2

          const chair = new VenueItem({
            id: `chair_${rowIndex + 1}_${chairIndex + 1}`,
            label: `${rowIndex + 1}-${chairIndex + 1}`,
            x,
            y,
            status: "available",
            type: "chair",
            shape: "rect",
            capacity: 1,
            metadata: {
              width: chairWidth,
              height: chairWidth,
              section: "theater",
            },
          })

          items.push(chair)
        }
      }

      // Add stage
      const stage = new VenueItem({
        id: "stage",
        label: "Stage",
        x: width / 2,
        y: height * 0.15,
        status: "disabled",
        type: "stage",
        shape: "rect",
        metadata: {
          width: width * 0.5,
          height: 40,
          section: "presenter",
        },
      })

      items.push(stage)
      break
    }

    case "boardroom": {
      // Boardroom style with one large table and chairs around it
      const tableWidth = Math.min(width * 0.7, capacity * 30)
      const tableHeight = Math.min(height * 0.5, capacity * 20)

      // Add central table
      const table = new VenueItem({
        id: "boardroom_table",
        label: "Table",
        x: width / 2,
        y: height / 2,
        status: "disabled",
        type: "table",
        shape: "rect",
        metadata: {
          width: tableWidth,
          height: tableHeight,
          section: "boardroom",
        },
      })

      items.push(table)

      // Add chairs around the table
      const chairsPerSide = Math.floor(capacity / 4)
      const chairSpacingX = tableWidth / (chairsPerSide + 1)
      const chairSpacingY = tableHeight / (chairsPerSide + 1)

      // Top side
      for (let i = 1; i <= chairsPerSide; i++) {
        const x = width / 2 - tableWidth / 2 + i * chairSpacingX
        const y = height / 2 - tableHeight / 2 - 20

        const chair = new VenueItem({
          id: `chair_top_${i}`,
          label: `T${i}`,
          x,
          y,
          rotation: 180,
          status: "available",
          type: "chair",
          shape: "rect",
          capacity: 1,
          metadata: {
            width: 30,
            height: 30,
            section: "boardroom",
          },
        })

        items.push(chair)
      }

      // Bottom side
      for (let i = 1; i <= chairsPerSide; i++) {
        const x = width / 2 - tableWidth / 2 + i * chairSpacingX
        const y = height / 2 + tableHeight / 2 + 20

        const chair = new VenueItem({
          id: `chair_bottom_${i}`,
          label: `B${i}`,
          x,
          y,
          rotation: 0,
          status: "available",
          type: "chair",
          shape: "rect",
          capacity: 1,
          metadata: {
            width: 30,
            height: 30,
            section: "boardroom",
          },
        })

        items.push(chair)
      }

      // Left side
      for (let i = 1; i <= chairsPerSide; i++) {
        const x = width / 2 - tableWidth / 2 - 20
        const y = height / 2 - tableHeight / 2 + i * chairSpacingY

        const chair = new VenueItem({
          id: `chair_left_${i}`,
          label: `L${i}`,
          x,
          y,
          rotation: 90,
          status: "available",
          type: "chair",
          shape: "rect",
          capacity: 1,
          metadata: {
            width: 30,
            height: 30,
            section: "boardroom",
          },
        })

        items.push(chair)
      }

      // Right side
      for (let i = 1; i <= chairsPerSide; i++) {
        const x = width / 2 + tableWidth / 2 + 20
        const y = height / 2 - tableHeight / 2 + i * chairSpacingY

        const chair = new VenueItem({
          id: `chair_right_${i}`,
          label: `R${i}`,
          x,
          y,
          rotation: 270,
          status: "available",
          type: "chair",
          shape: "rect",
          capacity: 1,
          metadata: {
            width: 30,
            height: 30,
            section: "boardroom",
          },
        })

        items.push(chair)
      }
      break
    }

    case "ushape": {
      // U-shape layout
      const tableWidth = 60
      const tableHeight = 40
      const numTablesPerSide = Math.floor(capacity / 6) // 2 people per table, 3 sides

      // Calculate dimensions of the U
      const uWidth = Math.min(width * 0.7, numTablesPerSide * tableWidth * 1.5)
      const uHeight = Math.min(height * 0.6, numTablesPerSide * tableWidth * 1.5)
      const uLeft = (width - uWidth) / 2
      const uTop = (height - uHeight) / 2

      // Bottom row (horizontal part of U)
      for (let i = 0; i < numTablesPerSide; i++) {
        const x = uLeft + i * tableWidth * 1.2 + tableWidth / 2
        const y = uTop + uHeight

        const table = new VenueItem({
          id: `table_bottom_${i + 1}`,
          label: `B${i + 1}`,
          x,
          y,
          status: "available",
          type: "table",
          shape: "rect",
          capacity: 2,
          metadata: {
            width: tableWidth,
            height: tableHeight,
            section: "ushape",
          },
        })

        items.push(table)

        // Add chairs (outside the U)
        const chair = new VenueItem({
          id: `chair_bottom_${i + 1}`,
          label: "",
          x,
          y: y + tableHeight + 20,
          status: "disabled",
          type: "chair",
          shape: "rect",
          metadata: {
            width: 30,
            height: 30,
            tableId: `table_bottom_${i + 1}`,
          },
        })

        items.push(chair)
      }

      // Left column (vertical part of U)
      for (let i = 0; i < numTablesPerSide; i++) {
        const x = uLeft
        const y = uTop + i * tableHeight * 1.2 + tableHeight / 2

        const table = new VenueItem({
          id: `table_left_${i + 1}`,
          label: `L${i + 1}`,
          x,
          y,
          rotation: 90,
          status: "available",
          type: "table",
          shape: "rect",
          capacity: 2,
          metadata: {
            width: tableWidth,
            height: tableHeight,
            section: "ushape",
          },
        })

        items.push(table)

        // Add chairs (outside the U)
        const chair = new VenueItem({
          id: `chair_left_${i + 1}`,
          label: "",
          x: x - tableHeight - 20,
          y,
          rotation: 90,
          status: "disabled",
          type: "chair",
          shape: "rect",
          metadata: {
            width: 30,
            height: 30,
            tableId: `table_left_${i + 1}`,
          },
        })

        items.push(chair)
      }

      // Right column (vertical part of U)
      for (let i = 0; i < numTablesPerSide; i++) {
        const x = uLeft + uWidth
        const y = uTop + i * tableHeight * 1.2 + tableHeight / 2

        const table = new VenueItem({
          id: `table_right_${i + 1}`,
          label: `R${i + 1}`,
          x,
          y,
          rotation: 90,
          status: "available",
          type: "table",
          shape: "rect",
          capacity: 2,
          metadata: {
            width: tableWidth,
            height: tableHeight,
            section: "ushape",
          },
        })

        items.push(table)

        // Add chairs (outside the U)
        const chair = new VenueItem({
          id: `chair_right_${i + 1}`,
          label: "",
          x: x + tableHeight + 20,
          y,
          rotation: 270,
          status: "disabled",
          type: "chair",
          shape: "rect",
          metadata: {
            width: 30,
            height: 30,
            tableId: `table_right_${i + 1}`,
          },
        })

        items.push(chair)
      }

      // Add presenter area in the middle of the U
      const presenter = new VenueItem({
        id: "presenter_area",
        label: "Presenter",
        x: width / 2,
        y: uTop + uHeight / 2,
        status: "disabled",
        type: "stage",
        shape: "rect",
        metadata: {
          width: uWidth * 0.5,
          height: 40,
          section: "presenter",
        },
      })

      items.push(presenter)
      break
    }
  }

  // Create and return venue map
  return new VenueMap({
    items,
    width,
    height,
    metadata: {
      layout: "conference",
      conferenceType: layout,
    },
  })
}

