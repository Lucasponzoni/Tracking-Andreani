document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('trackingNumber');
    
    if (trackingNumber) {
        const trackingInput = document.getElementById('tracking-input');
        trackingInput.value = trackingNumber;
        
        // Simular clic en el botón de búsqueda
        const trackingButton = document.querySelector('.tracking-button');
        trackingButton.click();
    }
});

const trackingInput = document.querySelector('.tracking-input');
const trackingButton = document.querySelector('.tracking-button');
const trackingItemsContainer = document.querySelector('.tracking-items-container');
const trackingInfo = document.querySelector('.tracking-info');
const resultContainer = document.getElementById('resultContainer');
const resultContainerPdf = document.getElementById('resultContainerPdf');
const IdTracking = document.getElementById('IDTracking');

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
        IdTracking.innerHTML = '';
        resultContainerPdf.innerHTML = ''; // Limpiar el contenedor del botón PDF

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
            createPdfButton();
        } else {
            console.error('Error al obtener los datos de seguimiento:', response.status);
            showError();
        }
    } catch (error) {
        console.error('Error al obtener los datos de seguimiento:', error);

        showError();
    } finally {
        hideSpinner(); // Ocultar spinner al completar la carga
    }
}

// Función para mostrar un mensaje de error
function showError() {
    IdTracking.innerHTML = `
    <div class="error-message">
      <p><i class="bi bi-exclamation-octagon-fill"></i> No localizo datos con la guía compartida, corrobore los datos.</p>
      <img src="./img/error.gif" alt="error">
    </div>
  `;
  resultContainer.innerHTML = ''; // Limpiar el contenedor de resultados
}

// Función para crear el botón de descarga PDF
function createPdfButton() {
    const pdfButton = document.createElement('button');
    pdfButton.classList.add('btn', 'btn-danger', 'mt-3');
    pdfButton.innerHTML = '<i class="bi bi-file-earmark-pdf-fill"></i> Descargar en PDF';
    pdfButton.addEventListener('click', () => downloadPdf());
    resultContainerPdf.appendChild(pdfButton);
}

// Función para descargar el contenido en PDF
function downloadPdf() {
  const element = document.querySelector('.tracking-items-container');
  const trackingNumber = trackingInput.value.trim();
  const opt = {
      margin: [0.5, 0.5, 0.5, -5], // Ajusta los márgenes si es necesario
      filename: `Seguimiento_Novogar_${trackingNumber}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
          scale: 2, // Ajusta la escala según sea necesario
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
          logging: true,
          letterRendering: true,
          allowTaint: false,
          taintTest: true,
          onclone: null,
          width: null,
          height: null,
          x: 0,
          y: 0,
          async: true // Asegúrate de que esta coma esté correctamente colocada
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
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
                    switch (type) {
                        case "constanciaelectronica":
                            return "Constancia Electrónica";
                        default:
                            return type;
                    }
                }

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

    // Obtener el número de envío del input
    const trackingNumber = trackingInput.value.trim();

    // Mostrar el número de envío en un nuevo div
    const trackingNumberDiv = document.createElement('div');
    trackingNumberDiv.classList.add('tracking-number');
    trackingNumberDiv.textContent = `Número de Envío: ${trackingNumber}`;
    IdTracking.appendChild(trackingNumberDiv);
    
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
        // Reemplazar valores específicos con sus correspondientes textos
        if (evento.Sucursal === "Sucursal Genérica") {
            locationElement.textContent = "DEPÓSITO CENTRAL NOVOGAR, ROSARIO";
        } else if (evento.Sucursal === "Centro De Operaciones" || evento.Sucursal === "Rosario") {
            locationElement.textContent = "PLANTA LOGÍSTICA ANDREANI, ROSARIO";
        } else {
            locationElement.textContent = evento.Sucursal;
        }
        
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
            showError()
        }
    } else {
        console.error('Ingrese un número de envío válido');
        showError()
    }
});
