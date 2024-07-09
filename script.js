const trackingInput = document.querySelector('.tracking-input');
const trackingButton = document.querySelector('.tracking-button');
const trackingItemsContainer = document.querySelector('.tracking-items-container');
const trackingInfo = document.querySelector('.tracking-info');
const resultContainer = document.getElementById('resultContainer');

const apiUrl = 'https://apis.andreani.com/login';
const username = 'novogar_gla';
const password = 'JoBOraCDJZC';

let authToken = '';

// Función para mostrar el spinner
function showSpinner() {
  const spinner = document.querySelector('.loader');
  if (spinner) {
    spinner.style.display = "block";
  }
}

// Función para ocultar el spinner
function hideSpinner() {
  const spinner = document.querySelector('.loader');
  if (spinner) {
    spinner.style.display = "none";
  }
}

// Función para obtener el token de autenticación
async function getAuthToken() {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      authToken = data.token;
      console.log('Token de autenticación:', authToken);
    } else {
      console.error('Error al obtener el token de autenticación:', response.status);
    }
  } catch (error) {
    console.error('Error al obtener el token de autenticación:', error);
  }
}

// Función para obtener los datos de seguimiento
async function fetchTrackingData(trackingNumber) {
  const apiUrl = `https://apis.andreani.com/v2/envios/${trackingNumber}/trazas`;

  try {
    trackingInfo.style.display = 'block';
    showSpinner(); // Mostrar spinner al iniciar la carga
    trackingItemsContainer.innerHTML = '';
    resultContainer.innerHTML = '';

    const response = await fetch(`https://proxy.cors.sh/${apiUrl}`, {
      headers: {
        'x-cors-api-key': 'temp_8af643011e844ffa8043d8aa3baa0d77',
        'x-authorization-token': authToken
      }
    });

    if (response.ok) {
      const data = await response.json();
      updateTrackingInfo(data.eventos);
      await fetchMultimedia(trackingNumber);
    } else {
      console.error('Error al obtener los datos de seguimiento:', response.status);
    }
  } catch (error) {
    console.error('Error al obtener los datos de seguimiento:', error);
  } finally {
    hideSpinner(); // Ocultar spinner al completar la carga
  }
}

// Función para obtener datos multimedia
async function fetchMultimedia(trackingNumber) {
  const multimediaUrl = `https://apis.andreani.com/v1/envios/${trackingNumber}/multimedia`;

  try {
    const response = await fetch(`https://proxy.cors.sh/${multimediaUrl}`, {
      headers: {
        'x-cors-api-key': 'temp_8af643011e844ffa8043d8aa3baa0d77',
        'x-authorization-token': authToken
      }
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Respuesta de la API Multimedia:', data);

        // Mostrar resultado en la interfaz
        if (data.multimedia && data.multimedia.length > 0) {
          const multimediaLink = data.multimedia[0].cotenido;
          const multimediaType = data.multimedia[0].meta;

          function formatMultimediaType(type) {
            // Si type es "constanciaelectronica", devuelve "Constancia Electrónica"
            // Puedes agregar más lógica para otros tipos si es necesario
            switch (type) {
              case "constanciaelectronica":
                return "Constancia Electrónica";
              // Agregar más casos según los tipos que manejes
              default:
                return type; // Por defecto, devuelve el mismo tipo
            }
          }
          
         // Luego, en tu código donde creas resultHTML:
        const resultHTML = `
        <p>${formatMultimediaType(multimediaType).toUpperCase()} <i class="bi bi-download"></i></p>
        <p><a href="${multimediaLink}" target="_blank" rel="noopener noreferrer" class="btn btn-danger"><i class="bi bi-file-earmark-medical-fill"></i> Descargar constancia de entrega</a></p>
`;
          resultContainer.innerHTML = resultHTML;
        } else {
          resultContainer.innerHTML = '<p><i class="bi bi-clock-history"></i> Este envío aun no posee remito de entrega cargado. (Disponible dentro de las 96hs luego de su entrega)</p>';
        }
      } else {
        console.error('Error al obtener los datos de multimedia:', response.status);
        resultContainer.innerHTML = `<p><i class="bi bi-exclamation-octagon-fill"></i> Error al obtener los datos de multimedia: ${response.status}</p>`;
      }
    } catch (error) {
      console.error('Error al obtener los datos de multimedia:', error);
      resultContainer.innerHTML = `<p><i class="bi bi-exclamation-octagon-fill"></i> Error al obtener los datos de multimedia: ${error.message}</p>`;
    }
  }

// Función para formatear la fecha
function formatFecha(fechaString) {
  const fecha = new Date(fechaString);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();
  const horas = fecha.getHours();
  const minutos = fecha.getMinutes();
  const segundos = fecha.getSeconds();

  const fechaFormateada = `${dia} de ${mes} de ${anio} - ${horas}:${minutos}:${segundos}Hs`;

  return fechaFormateada;
}

// Función para actualizar la información de seguimiento en la interfaz
function updateTrackingInfo(trackingEvents) {
  trackingItemsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos elementos

  if (trackingEvents.length > 0) {
    const firstMovementElement = document.createElement('div');
    firstMovementElement.classList.add('first-movement');
    firstMovementElement.innerHTML = `<i class="bi bi-info-circle-fill"></i> Último movimiento: ${trackingEvents[trackingEvents.length - 1].Estado}`;
    trackingItemsContainer.appendChild(firstMovementElement);
  }
  
  for (let i = trackingEvents.length - 1; i >= 0; i--) {
    const evento = trackingEvents[i];

    const trackingItem = document.createElement('div');
    trackingItem.classList.add('tracking-item');

    const dateElement = document.createElement('div');
    dateElement.classList.add('date');
    dateElement.textContent = formatFecha(evento.Fecha);

    const statusElement = document.createElement('div');
    statusElement.classList.add('status');
    statusElement.textContent = evento.Estado;

    const locationElement = document.createElement('div');
    locationElement.classList.add('location');
    locationElement.textContent = evento.Sucursal;

    if (evento.Motivo) {
      const reasonElement = document.createElement('div');
      reasonElement.classList.add('reason');
      reasonElement.textContent = evento.Motivo;
      trackingItem.appendChild(reasonElement);
    }

    trackingItem.appendChild(dateElement);
    trackingItem.appendChild(statusElement);
    trackingItem.appendChild(locationElement);

    trackingItemsContainer.appendChild(trackingItem);
  }

  trackingItemsContainer.style.display = 'block'; // Mostrar contenedor después de actualizar
}

// Evento click del botón de búsqueda
trackingButton.addEventListener('click', async () => {
  const trackingNumber = trackingInput.value.trim();
  if (trackingNumber) {
    await getAuthToken();
    if (authToken) {
      await fetchTrackingData(trackingNumber);
    } else {
      console.error('No se pudo obtener el token de autenticación');
    }
  } else {
    console.error('Ingrese un número de envío válido');
  }
});
