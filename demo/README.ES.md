# Demo Sistema de Reservas

Este demo muestra una implementación básica del sistema de reservas de asientos/mesas para diferentes tipos de venues (cines, restaurantes, salas de conferencias).

## Contenido

- `index.html` - Interfaz de usuario HTML
- `venue-reservation.js` - Implementación simplificada de la API de reservas
- `app.js` - Lógica de la aplicación para el demo

## Características

- Visualización interactiva de asientos/mesas
- Tres tipos de layouts predefinidos:
  - Cine (con filas curvas de asientos)
  - Restaurante (con mesas de diferentes formas y tamaños)
  - Sala de conferencias (con diferentes configuraciones: aula, teatro, sala de juntas, forma de U)
- Selección y deselección de elementos
- Formulario de reserva con validación
- Confirmación de reserva
- Posibilidad de hacer múltiples reservas

## Cómo ejecutar el demo

1. Simplemente abre el archivo `index.html` en cualquier navegador web moderno
2. No se requiere servidor web ni instalación adicional

## Uso

1. Selecciona el tipo de venue usando los botones en la parte superior
2. Haz clic en los asientos o mesas disponibles (verdes) para seleccionarlos
3. Completa el formulario con tu información
4. Haz clic en "Reservar Ahora" para crear una reserva
5. Después de confirmar, puedes hacer una nueva reserva

## Personalización

### Modificar los layouts

Puedes modificar los layouts predefinidos editando las funciones en `app.js`:

```javascript
// Para modificar el layout de cine
function initCinemaLayout() {
    currentVenueMap = window.VenueReservationSystem.generateCinemaLayout({
        rows: 8,                           // Número de filas
        seatsPerRow: [10, 12, 14, 16, 16, 14, 12, 10], // Asientos por fila
        rowSpacing: 40,                    // Espacio entre filas
        curvature: 0.3                     // Curvatura de las filas (0-1)
    });
    // ...
}

