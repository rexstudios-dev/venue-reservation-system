// Simulación simplificada de la API de Venue Reservation System

// Clase VenueItem - Representa un elemento reservable (asiento, mesa, etc.)
class VenueItem {
    constructor(options) {
      this.id = options.id
      this.label = options.label || ""
      this.type = options.type || "seat"
      this.x = options.x || 0
      this.y = options.y || 0
      this.width = options.width || 30
      this.height = options.height || 30
      this.shape = options.shape || "rect"
      this.status = options.status || "available"
      this.rotation = options.rotation || 0
      this.capacity = options.capacity || 1
      this.section = options.section || "main"
      this.metadata = options.metadata || {}
    }
  }
  
  // Clase VenueMap - Gestiona el mapa del lugar
  class VenueMap {
    constructor(options = {}) {
      this.width = options.width || 800
      this.height = options.height || 600
      this.items = []
      this.zones = options.zones || []
      this.background = options.background || null
    }
  
    addItem(item) {
      this.items.push(item)
      return item
    }
  
    getItemById(id) {
      return this.items.find((item) => item.id === id)
    }
  
    getItemsByType(type) {
      return this.items.filter((item) => item.type === type)
    }
  
    getItemsByStatus(status) {
      return this.items.filter((item) => item.status === status)
    }
  
    getItemsBySection(section) {
      return this.items.filter((item) => item.section === section)
    }
  }
  
  // Clase Reservation - Representa una reserva
  class Reservation {
    constructor(options) {
      this.id = options.id || "res_" + Math.random().toString(36).substr(2, 9)
      this.itemIds = options.itemIds || []
      this.customer = options.customer || {}
      this.startTime = options.startTime || new Date()
      this.endTime = options.endTime || new Date()
      this.status = options.status || "pending"
      this.metadata = options.metadata || {}
      this.createdAt = options.createdAt || new Date()
      this.updatedAt = options.updatedAt || new Date()
    }
  }
  
  // Clase ReservationSystem - Sistema principal de reservas
  class ReservationSystem {
    constructor(options = {}) {
      this.venueMap = options.venueMap || new VenueMap()
      this.reservations = []
      this.settings = {
        reservationExpiryMinutes: 15,
        maxItemsPerReservation: 10,
        allowOverlappingReservations: false,
        timeSlotDurationMinutes: 120,
        ...options.settings,
      }
      this.eventListeners = {
        reservationCreated: [],
        reservationConfirmed: [],
        reservationCancelled: [],
      }
    }
  
    createReservation(itemIds, customer, startTime, endTime, metadata = {}) {
      // Validar que los items existan y estén disponibles
      for (const itemId of itemIds) {
        const item = this.venueMap.getItemById(itemId)
        if (!item) {
          throw new Error(`Item ${itemId} no encontrado`)
        }
        if (item.status !== "available" && item.status !== "reserved") {
          throw new Error(`Item ${itemId} no está disponible`)
        }
      }
  
      // Validar cliente
      if (!customer || !customer.name || !customer.email) {
        throw new Error("Se requiere información del cliente")
      }
  
      // Validar fechas
      if (!startTime || !endTime || startTime >= endTime) {
        throw new Error("Fechas de reserva inválidas")
      }
  
      // Crear la reserva
      const reservation = new Reservation({
        itemIds,
        customer,
        startTime,
        endTime,
        metadata,
      })
  
      // Marcar los items como reservados
      for (const itemId of itemIds) {
        const item = this.venueMap.getItemById(itemId)
        item.status = "reserved"
      }
  
      this.reservations.push(reservation)
      this._emitEvent("reservationCreated", reservation)
      return reservation
    }
  
    confirmReservation(reservationId) {
      const reservation = this.reservations.find((r) => r.id === reservationId)
      if (!reservation) {
        throw new Error("Reserva no encontrada")
      }
  
      reservation.status = "confirmed"
      reservation.updatedAt = new Date()
  
      // Marcar los items como ocupados
      for (const itemId of reservation.itemIds) {
        const item = this.venueMap.getItemById(itemId)
        item.status = "occupied"
      }
  
      this._emitEvent("reservationConfirmed", reservation)
      return reservation
    }
  
    cancelReservation(reservationId) {
      const reservation = this.reservations.find((r) => r.id === reservationId)
      if (!reservation) {
        throw new Error("Reserva no encontrada")
      }
  
      reservation.status = "cancelled"
      reservation.updatedAt = new Date()
  
      // Marcar los items como disponibles nuevamente
      for (const itemId of reservation.itemIds) {
        const item = this.venueMap.getItemById(itemId)
        item.status = "available"
      }
  
      this._emitEvent("reservationCancelled", reservation)
      return reservation
    }
  
    isItemAvailableForTimeRange(itemId, startTime, endTime) {
      // Simplificado para la demo
      const item = this.venueMap.getItemById(itemId)
      return item && item.status === "available"
    }
  
    on(eventName, callback) {
      if (this.eventListeners[eventName]) {
        this.eventListeners[eventName].push(callback)
      }
    }
  
    _emitEvent(eventName, data) {
      if (this.eventListeners[eventName]) {
        for (const callback of this.eventListeners[eventName]) {
          callback(data)
        }
      }
    }
  }
  
  // Funciones de generación de layouts
  
  function generateCinemaLayout(options = {}) {
    const rows = options.rows || 10
    const seatsPerRow = options.seatsPerRow || Array(rows).fill(20)
    const rowSpacing = options.rowSpacing || 40
    const seatSpacing = options.seatSpacing || 35
    const rowLabels = options.rowLabels || "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const curvature = options.curvature || 0.3
  
    const venueMap = new VenueMap({
      width: Math.max(...seatsPerRow) * seatSpacing + 100,
      height: rows * rowSpacing + 100,
    })
  
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const numSeats = seatsPerRow[rowIndex]
      const rowLabel = rowLabels[rowIndex]
  
      for (let seatIndex = 0; seatIndex < numSeats; seatIndex++) {
        // Calcular posición con curvatura
        const centerOffset = numSeats / 2
        const angle = ((seatIndex - centerOffset) / centerOffset) * (Math.PI / 2) * curvature
        const radius = (rows - rowIndex) * rowSpacing * 1.5
        const x = venueMap.width / 2 + Math.sin(angle) * radius
        const y = 100 + rowIndex * rowSpacing
  
        // Determinar categoría basada en la posición
        let category = "standard"
        if (rowIndex < rows * 0.2) {
          category = "premium"
        } else if (rowIndex > rows * 0.7) {
          category = "economy"
        }
  
        // Crear asiento
        const seatNumber = seatIndex + 1
        venueMap.addItem(
          new VenueItem({
            id: `seat_${rowLabel}${seatNumber}`,
            label: `${rowLabel}${seatNumber}`,
            type: "seat",
            x,
            y,
            width: 30,
            height: 30,
            shape: "rect",
            status: Math.random() > 0.8 ? "occupied" : "available", // Algunos asientos ocupados para demo
            section: `row_${rowLabel}`,
            metadata: { category },
          }),
        )
      }
    }
  
    return venueMap
  }
  
  function generateRestaurantLayout(options = {}) {
    const width = options.width || 800
    const height = options.height || 600
    const customTables = options.customTables || []
  
    const venueMap = new VenueMap({ width, height })
  
    if (customTables.length > 0) {
      // Usar mesas personalizadas
      for (const tableConfig of customTables) {
        venueMap.addItem(
          new VenueItem({
            ...tableConfig,
            type: "table",
          }),
        )
      }
    } else {
      // Generar mesas por defecto
      // Mesas de ventana
      for (let i = 0; i < 5; i++) {
        venueMap.addItem(
          new VenueItem({
            id: `table_w${i + 1}`,
            label: `W${i + 1}`,
            type: "table",
            x: 100,
            y: 100 + i * 100,
            width: 60,
            height: 60,
            shape: "rect",
            capacity: 2,
            section: "window",
          }),
        )
      }
  
      // Mesas centrales
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          venueMap.addItem(
            new VenueItem({
              id: `table_c${row * 3 + col + 1}`,
              label: `C${row * 3 + col + 1}`,
              type: "table",
              x: 300 + col * 100,
              y: 150 + row * 150,
              width: 70,
              height: 70,
              shape: "circle",
              capacity: 4,
              section: "center",
            }),
          )
        }
      }
  
      // Mesas de bar
      for (let i = 0; i < 5; i++) {
        venueMap.addItem(
          new VenueItem({
            id: `bar_${i + 1}`,
            label: `B${i + 1}`,
            type: "table",
            x: 700,
            y: 100 + i * 100,
            width: 40,
            height: 40,
            shape: "rect",
            capacity: 2,
            section: "bar",
          }),
        )
      }
    }
  
    return venueMap
  }
  
  function generateConferenceLayout(options = {}) {
    const width = options.width || 800
    const height = options.height || 600
    const layout = options.layout || "classroom"
    const capacity = options.capacity || 30
  
    const venueMap = new VenueMap({ width, height })
  
    switch (layout) {
      case "classroom":
        // Filas de mesas con sillas
        const rows = Math.ceil(capacity / 6)
        const tablesPerRow = 3
  
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < tablesPerRow; col++) {
            venueMap.addItem(
              new VenueItem({
                id: `table_${row * tablesPerRow + col + 1}`,
                label: `T${row * tablesPerRow + col + 1}`,
                type: "table",
                x: 150 + col * 200,
                y: 150 + row * 100,
                width: 160,
                height: 60,
                shape: "rect",
                capacity: 2,
                section: "classroom",
              }),
            )
          }
        }
        break
  
      case "theater":
        // Filas de sillas
        const chairRows = Math.ceil(capacity / 10)
        const chairsPerRow = 10
  
        for (let row = 0; row < chairRows; row++) {
          for (let col = 0; col < chairsPerRow; col++) {
            venueMap.addItem(
              new VenueItem({
                id: `chair_${row * chairsPerRow + col + 1}`,
                label: `C${row * chairsPerRow + col + 1}`,
                type: "chair",
                x: 150 + col * 60,
                y: 150 + row * 70,
                width: 40,
                height: 40,
                shape: "circle",
                capacity: 1,
                section: "theater",
              }),
            )
          }
        }
        break
  
      case "boardroom":
        // Una mesa grande central con sillas alrededor
        venueMap.addItem(
          new VenueItem({
            id: "main_table",
            label: "Main Table",
            type: "table",
            x: width / 2,
            y: height / 2,
            width: 400,
            height: 150,
            shape: "rect",
            capacity: capacity,
            section: "boardroom",
          }),
        )
        break
  
      case "ushape":
        // Mesas en forma de U
        venueMap.addItem(
          new VenueItem({
            id: "table_top",
            label: "Top",
            type: "table",
            x: width / 2,
            y: 150,
            width: 400,
            height: 80,
            shape: "rect",
            capacity: 8,
            section: "ushape",
          }),
        )
  
        venueMap.addItem(
          new VenueItem({
            id: "table_left",
            label: "Left",
            type: "table",
            x: 200,
            y: 300,
            width: 80,
            height: 250,
            shape: "rect",
            capacity: 8,
            section: "ushape",
          }),
        )
  
        venueMap.addItem(
          new VenueItem({
            id: "table_right",
            label: "Right",
            type: "table",
            x: 600,
            y: 300,
            width: 80,
            height: 250,
            shape: "rect",
            capacity: 8,
            section: "ushape",
          }),
        )
        break
    }
  
    return venueMap
  }
  
  // Funciones de renderizado
  
  function renderToCanvas(venueMap, canvas, options = {}) {
    const ctx = canvas.getContext("2d")
    const interactive = options.interactive || false
    const onClick = options.onClick || null
    const onHover = options.onHover || null
  
    let hoveredItem = null
    const scale = 1
  
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      // Dibujar fondo si existe
      if (venueMap.background) {
        // Código para dibujar fondo
      }
  
      // Dibujar zonas si existen
      for (const zone of venueMap.zones || []) {
        // Código para dibujar zonas
      }
  
      // Dibujar items
      for (const item of venueMap.items) {
        drawItem(item)
      }
    }
  
    function drawItem(item) {
      ctx.save()
  
      // Configurar estilo según estado
      switch (item.status) {
        case "available":
          ctx.fillStyle = "#4CAF50" // Verde
          break
        case "reserved":
          ctx.fillStyle = "#FFC107" // Amarillo
          break
        case "occupied":
          ctx.fillStyle = "#F44336" // Rojo
          break
        case "disabled":
          ctx.fillStyle = "#9E9E9E" // Gris
          break
        default:
          ctx.fillStyle = "#2196F3" // Azul
      }
  
      // Dibujar forma
      ctx.translate(item.x, item.y)
      if (item.rotation) {
        ctx.rotate((item.rotation * Math.PI) / 180)
      }
  
      if (item.shape === "rect") {
        ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height)
        ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height)
      } else if (item.shape === "circle") {
        ctx.beginPath()
        ctx.arc(0, 0, item.width / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
  
      // Dibujar etiqueta
      ctx.fillStyle = "#000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = "12px Arial"
      ctx.fillText(item.label, 0, 0)
  
      ctx.restore()
    }
  
    function getItemAtPosition(x, y) {
      // Comprobar de atrás hacia adelante para que los elementos superiores tengan prioridad
      for (let i = venueMap.items.length - 1; i >= 0; i--) {
        const item = venueMap.items[i]
  
        // Comprobar si el punto está dentro del item
        const dx = x - item.x
        const dy = y - item.y
  
        if (item.shape === "rect") {
          if (Math.abs(dx) <= item.width / 2 && Math.abs(dy) <= item.height / 2) {
            return item
          }
        } else if (item.shape === "circle") {
          if (dx * dx + dy * dy <= (item.width / 2) * (item.width / 2)) {
            return item
          }
        }
      }
  
      return null
    }
  
    if (interactive) {
      canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / scale
        const y = (event.clientY - rect.top) / scale
  
        const item = getItemAtPosition(x, y)
        if (item && onClick) {
          onClick(item)
        }
      })
  
      canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / scale
        const y = (event.clientY - rect.top) / scale
  
        const item = getItemAtPosition(x, y)
  
        if (item !== hoveredItem) {
          hoveredItem = item
          if (onHover) {
            onHover(item)
          }
  
          // Cambiar cursor
          canvas.style.cursor = item ? "pointer" : "default"
        }
      })
    }
  
    // Renderizar inicialmente
    render()
  
    // Devolver objeto con métodos útiles
    return {
      render,
      updateVenueMap: (newVenueMap) => {
        venueMap = newVenueMap
        render()
      },
    }
  }
  
  function exportToSVG(venueMap, options = {}) {
    const includeLegend = options.includeLegend || false
    const includeLabels = options.includeLabels || true
    const showZones = options.showZones || false
  
    let svg = `<svg width="${venueMap.width}" height="${venueMap.height}" xmlns="http://www.w3.org/2000/svg">`
  
    // Fondo
    svg += `<rect width="100%" height="100%" fill="#f9f9f9" />`
  
    // Zonas
    if (showZones && venueMap.zones) {
      for (const zone of venueMap.zones) {
        // Código para zonas
      }
    }
  
    // Items
    for (const item of venueMap.items) {
      let fill
      switch (item.status) {
        case "available":
          fill = "#4CAF50"
          break
        case "reserved":
          fill = "#FFC107"
          break
        case "occupied":
          fill = "#F44336"
          break
        case "disabled":
          fill = "#9E9E9E"
          break
        default:
          fill = "#2196F3"
      }
  
      if (item.shape === "rect") {
        svg += `<rect x="${item.x - item.width / 2}" y="${item.y - item.height / 2}" width="${item.width}" height="${item.height}" fill="${fill}" stroke="#000" />`
      } else if (item.shape === "circle") {
        svg += `<circle cx="${item.x}" cy="${item.y}" r="${item.width / 2}" fill="${fill}" stroke="#000" />`
      }
  
      if (includeLabels) {
        svg += `<text x="${item.x}" y="${item.y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12">${item.label}</text>`
      }
    }
  
    // Leyenda
    if (includeLegend) {
      // Código para leyenda
    }
  
    svg += `</svg>`
    return svg
  }
  
  // Exportar todo
  window.VenueReservationSystem = {
    VenueItem,
    VenueMap,
    Reservation,
    ReservationSystem,
    generateCinemaLayout,
    generateRestaurantLayout,
    generateConferenceLayout,
    renderToCanvas,
    exportToSVG,
  }
  
  