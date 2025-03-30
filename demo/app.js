// Inicialización de la aplicación

// Variables globales
let currentVenueMap
let reservationSystem
let selectedItems = []
let renderer

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // Crear el mapa de cine por defecto
  initCinemaLayout()

  // Configurar los botones de selección de venue
  document.getElementById("cinema-btn").addEventListener("click", () => {
    setActiveButton("cinema-btn")
    initCinemaLayout()
  })

  document.getElementById("restaurant-btn").addEventListener("click", () => {
    setActiveButton("restaurant-btn")
    initRestaurantLayout()
  })

  document.getElementById("conference-btn").addEventListener("click", () => {
    setActiveButton("conference-btn")
    initConferenceLayout()
  })

  // Configurar el botón de reserva
  document.getElementById("reserve-btn").addEventListener("click", createReservation)

  // Configurar el botón de nueva reserva
  document.getElementById("new-reservation-btn").addEventListener("click", resetReservation)
})

// Función para inicializar el layout de cine
function initCinemaLayout() {
  // Crear el mapa de cine
  currentVenueMap = window.VenueReservationSystem.generateCinemaLayout({
    rows: 8,
    seatsPerRow: [10, 12, 14, 16, 16, 14, 12, 10],
    rowSpacing: 40,
    curvature: 0.3,
  })

  // Crear el sistema de reservas
  reservationSystem = new window.VenueReservationSystem.ReservationSystem({
    venueMap: currentVenueMap,
  })

  // Renderizar el mapa
  renderVenueMap()

  // Resetear selecciones
  resetSelection()
}

// Función para inicializar el layout de restaurante
function initRestaurantLayout() {
  // Crear el mapa de restaurante
  currentVenueMap = window.VenueReservationSystem.generateRestaurantLayout()

  // Crear el sistema de reservas
  reservationSystem = new window.VenueReservationSystem.ReservationSystem({
    venueMap: currentVenueMap,
    settings: {
      timeSlotDurationMinutes: 90,
      allowOverlappingReservations: false,
    },
  })

  // Renderizar el mapa
  renderVenueMap()

  // Resetear selecciones
  resetSelection()
}

// Función para inicializar el layout de sala de conferencias
function initConferenceLayout() {
  // Crear el mapa de sala de conferencias
  currentVenueMap = window.VenueReservationSystem.generateConferenceLayout({
    layout: "classroom",
    capacity: 30,
  })

  // Crear el sistema de reservas
  reservationSystem = new window.VenueReservationSystem.ReservationSystem({
    venueMap: currentVenueMap,
    settings: {
      timeSlotDurationMinutes: 240, // 4 horas
      allowMultipleItemsPerReservation: true,
    },
  })

  // Renderizar el mapa
  renderVenueMap()

  // Resetear selecciones
  resetSelection()
}

// Función para renderizar el mapa en el canvas
function renderVenueMap() {
  const canvas = document.getElementById("venue-map")

  if (renderer) {
    renderer.updateVenueMap(currentVenueMap)
  } else {
    renderer = window.VenueReservationSystem.renderToCanvas(currentVenueMap, canvas, {
      interactive: true,
      onClick: (item) => {
        if (item.status === "available") {
          // Toggle selección
          if (selectedItems.includes(item.id)) {
            // Deseleccionar
            item.status = "available"
            selectedItems = selectedItems.filter((id) => id !== item.id)
          } else {
            // Seleccionar
            item.status = "reserved"
            selectedItems.push(item.id)
          }

          // Actualizar UI
          updateSelectedItemsDisplay()
          renderer.render()
        }
      },
      onHover: (item) => {
        // Mostrar información del item al pasar el mouse
        const infoElement = document.getElementById("item-info")
        if (infoElement && item) {
          infoElement.textContent = `${item.label} - ${item.status}`
        }
      },
    })
  }
}

// Función para actualizar la visualización de items seleccionados
function updateSelectedItemsDisplay() {
  const selectedSeatsElement = document.getElementById("selected-seats")
  const reserveButton = document.getElementById("reserve-btn")

  if (selectedItems.length === 0) {
    selectedSeatsElement.textContent = "Ninguno"
    reserveButton.disabled = true
  } else {
    const itemLabels = selectedItems.map((id) => {
      const item = currentVenueMap.getItemById(id)
      return item ? item.label : id
    })

    selectedSeatsElement.textContent = itemLabels.join(", ")
    reserveButton.disabled = false
  }
}

// Función para crear una reserva
function createReservation() {
  // Validar que haya items seleccionados
  if (selectedItems.length === 0) {
    showError("Por favor selecciona al menos un asiento")
    return
  }

  // Obtener datos del formulario
  const customerName = document.getElementById("customer-name").value
  const customerEmail = document.getElementById("customer-email").value
  const customerPhone = document.getElementById("customer-phone").value

  // Validar datos
  if (!customerName || !customerEmail) {
    showError("Por favor completa tu nombre y email")
    return
  }

  try {
    // Crear fechas para la reserva (para demo, usamos hora actual + 1 hora)
    const startTime = new Date()
    startTime.setHours(startTime.getHours() + 1)

    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 2)

    // Crear la reserva
    const reservation = reservationSystem.createReservation(
      selectedItems,
      {
        id: "customer_" + Date.now(),
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      startTime,
      endTime,
      {
        source: "web_demo",
      },
    )

    // Confirmar la reserva
    reservationSystem.confirmReservation(reservation.id)

    // Mostrar confirmación
    showConfirmation(reservation)
  } catch (error) {
    showError(error.message)
  }
}

// Función para mostrar error
function showError(message) {
  const errorElement = document.getElementById("error-message")
  errorElement.textContent = message

  // Ocultar después de 5 segundos
  setTimeout(() => {
    errorElement.textContent = ""
  }, 5000)
}

// Función para mostrar confirmación
function showConfirmation(reservation) {
  // Ocultar formulario
  document.getElementById("reserve-btn").disabled = true

  // Mostrar confirmación
  const confirmationElement = document.getElementById("confirmation")
  confirmationElement.style.display = "block"

  // Llenar datos de confirmación
  document.getElementById("reservation-id").textContent = reservation.id

  const itemLabels = reservation.itemIds.map((id) => {
    const item = currentVenueMap.getItemById(id)
    return item ? item.label : id
  })

  document.getElementById("confirmation-seats").textContent = itemLabels.join(", ")
  document.getElementById("confirmation-name").textContent = reservation.customer.name
  document.getElementById("confirmation-time").textContent = formatDateTime(reservation.startTime)
}

// Función para resetear la reserva
function resetReservation() {
  // Ocultar confirmación
  document.getElementById("confirmation").style.display = "none"

  // Limpiar formulario
  document.getElementById("customer-name").value = ""
  document.getElementById("customer-email").value = ""
  document.getElementById("customer-phone").value = ""

  // Resetear selección
  resetSelection()
}

// Función para resetear selección
function resetSelection() {
  // Limpiar array de seleccionados
  selectedItems = []

  // Actualizar UI
  updateSelectedItemsDisplay()
}

// Función para establecer el botón activo
function setActiveButton(buttonId) {
  // Quitar clase active de todos los botones
  document.querySelectorAll(".venue-selector button").forEach((button) => {
    button.classList.remove("active")
  })

  // Agregar clase active al botón seleccionado
  document.getElementById(buttonId).classList.add("active")
}

// Función para formatear fecha y hora
function formatDateTime(date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

