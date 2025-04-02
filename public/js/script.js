function showSection(sectionId) {
  document
    .querySelectorAll(".content")
    .forEach((section) => section.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");

  if (sectionId == "clientes") {
    cargarClientes();
  }

  if (sectionId == "crear-remision") {
    cargarClientesEnSelect();
  }
  if (sectionId == "registros_seccion") {
    cargarRegistros();
  }
  if (sectionId == "crear-remision") {
  }
}

document.getElementById("cerrar_sesion").addEventListener("click", () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/api/logout";
    }
  });
});

function agregarFila() {
  let tabla = document
    .getElementById("detalles")
    .getElementsByTagName("tbody")[0];
  let nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
        <td><input type="number" class="cantidad" oninput="calcularSubtotal(this)" required></td>
        <td><input type="text" class="descripcion" required></td>
        <td><input type="number" class="precio_unitario" oninput="calcularSubtotal(this)" required></td>
        <td><input type="number" class="subtotal" step="0.01" required readonly></td>
        <td><button type="button" onclick="eliminarFila(this)">❌</button></td>
    `;
  tabla.appendChild(nuevaFila);
}
function resetearTabla() {
  let tbody = document.getElementById("detalles").getElementsByTagName("tbody")[0];

  // Eliminar todas las filas
  tbody.innerHTML = "";

  // Agregar una nueva fila vacía
  agregarFila();
}

function eliminarFila(boton) {
  let fila = boton.closest("tr");
  if (document.querySelectorAll("#detalles tbody tr").length > 1) {
    fila.remove();
    calcularTotal();
  } else {
    Swal.fire({
      title: "Error",
      text: "Debe haber al menos una fila!",
      icon: "error",
      confirmButtonText: "Ok",
    });
  }
}

function calcularSubtotal(input) {
  let fila = input.closest("tr"); // Obtiene la fila actual
  let cantidad = fila.querySelector(".cantidad").value.trim();
  let precio = fila.querySelector(".precio_unitario").value.trim();
  let subtotalInput = fila.querySelector(".subtotal");

  // Convertir valores a número
  let cantidadNum = cantidad === "" ? 0 : Number(cantidad);
  let precioNum = precio === "" ? 0 : Number(precio);

  // Validar si son números válidos
  if (isNaN(cantidadNum) || isNaN(precioNum) || cantidadNum < 0 || precioNum < 0) {
    subtotalInput.value = "";
    input.style.color = "red";
    console.error("Campos inválidos.");
    return;
  }

  // Calcular subtotal solo si ambos valores son válidos
  if (cantidadNum > 0 && precioNum > 0) {
    subtotalInput.value = (cantidadNum * precioNum).toFixed(2);
    input.style.color = "black"; // Restaurar color
  } else {
    subtotalInput.value = ""; // Si falta un valor, no calcular
  }
  calcularTotal();
}

function calcularTotal() {
  let total = 0;
  document.querySelectorAll(".subtotal").forEach((input) => {
    total += parseFloat(input.value) || 0;
  });
  document.getElementById("total").value = total.toFixed(2);
}

document
  .getElementById("remision-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let folio = document.getElementById("folio").value;
    let cliente = document.getElementById("cliente").value;
    let fecha = document.getElementById("fecha").value;
    let total = document.getElementById("total").value;

    let tablaNotas = document
      .getElementById("notas-table")
      .getElementsByTagName("tbody")[0];
    let nuevaFila = document.createElement("tr");
    nuevaFila.innerHTML = `
        <td>${folio}</td>
        <td>${cliente}</td>
        <td>${fecha}</td>
        <td>$${total}</td>
    `;
    tablaNotas.appendChild(nuevaFila);

    document.getElementById("remision-form").reset();
    document.querySelector("#detalles tbody").innerHTML = `
        <tr>
            <td><input type="number" class="cantidad" oninput="calcularSubtotal(this)" required></td>
            <td><input type="text" class="descripcion" required></td>
            <td><input type="number" class="precio_unitario" oninput="calcularSubtotal(this)" required></td>
            <td><input type="number" class="subtotal" step="0.01" required readonly></td>
            <td><button type="button" onclick="eliminarFila(this)">❌</button></td>
        </tr>
    `;
    calcularTotal();
  });

async function obtenerFolio() {
  try {
    const response = await fetch("http://localhost:3000/api/consulta-folio");
    if (!response.ok) throw new Error("Error en la petición");

    const folio = await response.text(); // Recibe el número como texto
    const folioNumero = Number(folio);

    document.getElementById("folio_generar").textContent = folioNumero + 1;
  } catch (error) {
    console.error("Error al obtener el folio:", error);
    document.getElementById("folio").textContent = "Error";
  }
}
obtenerFolio();

/* Insertar  datos del cliente*/
document
  .getElementById("cliente-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre_cliente = document.getElementById("nombre-cliente").value;
    const direccion_cliente = document.getElementById("direccion").value;

    const response = await fetch("http://localhost:3000/api/agregar-cliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_cliente, direccion_cliente }),
    });

    const data = await response.json();
    if (response.ok) {
      Swal.fire({
        title: "Éxito",
        text: "Cliente agregado con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      document.getElementById("cliente-form").reset();
    } else {
      Swal.fire({
        title: "Error",
        text: "No se guardó el cliente" + data.error,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
    cargarClientes();
  });
  

async function cargarClientes() {
  try {
    const response = await fetch("http://localhost:3000/api/consulta-clientes");
    if (!response.ok)
      throw new Error(`Error en la solicitud: ${response.status}`);

    const data = await response.json();
    //console.log("Clientes recibidos:", data); // Depuración

    const tbody = document.querySelector("#clientes-table tbody");
    tbody.innerHTML = ""; // Limpiar la tabla antes de insertar los nuevos datos

    data.forEach((cliente) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${cliente.id_cliente}</td>
                <td class="edit_cliente" id="nombre_cliente_${cliente.id_cliente}">${cliente.nombre_cliente}</td>
                <td class="edit_cliente" id="direccion_cliente_${cliente.id_cliente}">${cliente.domicilio_cliente}</td>
                <td><button class="btn-quit" onclick="eliminarCliente(${cliente.id_cliente})">QUITAR</button></td>
                <td><button class="btn-actualizarCliente" data-id="${cliente.id_cliente}" onclick="actualizarCliente(event)">Actualizar</button></td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar los clientes:", error);
  }
}



/*Actualizar clientes */
async function actualizarCliente(event) {
  // Obtener el id_cliente desde el atributo data-id del botón
  const id_cliente = event.target.getAttribute("data-id");

  // Obtener los valores de los campos de la fila correspondiente
  const nombre_clienteAct = document.querySelector(`#nombre_cliente_${id_cliente}`).textContent.trim();
  const direccion_clienteAct = document.querySelector(`#direccion_cliente_${id_cliente}`).textContent.trim();

  // Validar que los campos no estén vacíos
  if (!nombre_clienteAct || !direccion_clienteAct) {
    console.log("Todos los campos son obligatorios.");
    Swal.fire({
      title: "Error",
      text: "Todos los campos son obligatorios",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // Hacer la solicitud PUT con los datos correctos
  try {
    const response = await fetch(`http://localhost:3000/api/actualizar-cliente/${id_cliente}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_clienteAct, direccion_clienteAct })
    });

    console.log(`Respuesta del servidor: ${response.status}`);

    if (!response.ok) {
      throw new Error("Error al actualizar cliente");
    }

    const data = await response.json();
    console.log(data);  // Respuesta del servidor

    // Mostrar mensaje de éxito
    Swal.fire({
      title: "Éxito",
      text: "Cliente actualizado con éxito",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    // Restablecer el color de las celdas editadas
    const row = event.target.closest("tr"); 
    const editableCells = row.querySelectorAll(".edit_cliente");

    editableCells.forEach(cell => {
      cell.classList.remove("edited");  // Eliminar la clase 'edited'
    });

  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    Swal.fire({
      title: "Error",
      text: "Ocurrió un error al actualizar el cliente",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}



const tablaClientes = document.getElementById('clientes-table');
  
  // Función para convertir una celda en un input editable
  function makeEditable(cell) {
    const originalText = cell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    // Al hacer clic afuera del input, guardar el cambio
    input.addEventListener('blur', () => {
      const newValue = input.value.trim();
      if (newValue !== originalText) {
        cell.textContent = newValue;
        cell.classList.add('edited');  // Marca como editado con color verde
      } else {
        cell.textContent = originalText;  // Si no hubo cambio, mantener el valor original
      }
    });
  }

  // Evento para hacer editable una celda al hacer clic dentro de la tabla de clientes
  tablaClientes.addEventListener('click', function(event) {
    // Verificamos que el clic haya sido en una celda editable
    const cell = event.target;
    if (cell.classList.contains('edit_cliente')) {
      makeEditable(cell);
    }
  });


/*Eliminar clientes */

async function eliminarCliente(id) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas eliminar al cliente?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/eliminar-cliente/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el cliente");
      }

      Swal.fire({
        title: "Éxito",
        text: "Cliente eliminado con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      cargarClientes(); // Recargar la tabla después de eliminar
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el cliente",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  }
}



/*Rellenando el select con los clientes existentes */

async function cargarClientesEnSelect() {
  try {
    const response = await fetch("http://localhost:3000/api/consulta-clientes");
    if (!response.ok)
      throw new Error(`Error en la solicitud: ${response.status}`);

    const data = await response.json();
    //console.log("Clientes recibidos:", data);

    const selectClientes = document.getElementById("cliente");
    selectClientes.innerHTML = '<option value="">Venta General</option>'; // Resetear opciones

    data.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id_cliente; // Usar el ID como valor
      option.textContent = cliente.nombre_cliente; // Mostrar solo el nombre
      option.setAttribute("data_direccion", cliente.domicilio_cliente);
      selectClientes.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar los clientes en el select:", error);
  }
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarClientesEnSelect);

document.getElementById("cliente").addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  const direccion =
    selectedOption.getAttribute("data_direccion") || "Sin dirección";
  document.getElementById("direccion_cliente").textContent = direccion;
});

function mostrarFechaActual() {
  const fechaElemento = document.getElementById("fecha_actual");
  const fecha = new Date();

  //dandole formato a la fecha
  const fechaFormateada = fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  fechaElemento.textContent = `Fecha: ${fechaFormateada}`;
}

document.addEventListener("DOMContentLoaded", mostrarFechaActual);

/*vista previa del pdf a generar */
function mostrarVistaPrevia() {
  // Obtener elementos del formulario
  const fecha = document.getElementById("fecha_actual").textContent;
  const folio = document.getElementById("folio_generar").textContent;
  const cliente = document.getElementById("cliente").selectedOptions[0].text;
  const direccion_vista =
    document.getElementById("direccion_cliente").textContent;
  const total = document.getElementById("total").value;

  // Mostrar los datos en la vista previa
  document.getElementById("vista-fecha").textContent = fecha;
  document.getElementById("vista-folio").textContent = folio;
  document.getElementById("vista-cliente").textContent = `Cliente: ${cliente}`;
  document.getElementById(
    "vista-domicilio"
  ).textContent = `Dirección: ${direccion_vista}`;
  document.getElementById("vista-total").textContent = `Total: $${total}`;

  // Copiar la tabla de detalles a la vista previa
  const tablaOriginal = document.querySelector("#detalles tbody");
  const tablaVista = document.querySelector("#vista-tabla tbody");
  tablaVista.innerHTML = "";

  tablaOriginal.querySelectorAll("tr").forEach((tr) => {
    const cantidad = tr.querySelector(".cantidad").value.trim();
    const descripcion = tr.querySelector(".descripcion").value.trim();
    const precioUnitario = tr.querySelector(".precio_unitario").value.trim();
    const subtotal = tr.querySelector(".subtotal").value.trim();

    const nuevaFila = document.createElement("tr");
    nuevaFila.innerHTML = `
            <td>${cantidad}</td>
            <td>${descripcion}</td>
            <td>$${precioUnitario}</td>
            <td>$${subtotal}</td>
        `;
    tablaVista.appendChild(nuevaFila);
  });

  // Mostrar la vista previa
  document.getElementById("vista-previa").style.display = "block";
}

const expresiones = {
  numbers: /^[0-9]{1,100}$/,
};

const form_registro = document.getElementById("remision-form");
const cantidad = document.getElementById("cantidad");
const descripcion = document.getElementById("descript");
const precio = document.getElementById("precio");
const errorCantidad = document.getElementById("error_cantidad");

// Validación en tiempo real
form_registro.addEventListener("keyup", (e) => {
  validarCampo(cantidad, expresiones.numbers, errorCantidad);
  validarCampo(precio, expresiones.numbers, errorCantidad);
});

// Validación al generar PDF
document.getElementById("generar_pdf").addEventListener("click", async () => {
  const validoCantidad = validarCampo(
    cantidad,
    expresiones.numbers,
    errorCantidad
  );
  const validoPrecio = validarCampo(precio, expresiones.numbers, errorCantidad);

  if (validoCantidad && validoPrecio) {
    await generarPDF();
  } else {
    console.warn("Campos inválidos. No se puede generar el PDF.");
  }
});

// Función reutilizable para validar campos
function validarCampo(input, expresion, errorElement) {
  if (expresion.test(input.value.trim())) {
    input.style.color = "#000";
    errorElement.style.display = "none";
    return true;
  } else {
    input.style.color = "red";
    errorElement.style.display = "block";
    return false;
  }
}

/*Generar el pdf */
async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Cargar imágenes
  const imgElement = document.getElementById("logo");
  const imgWatermark = document.getElementById("watermark");

  await Promise.all([
    new Promise((resolve) => imgElement.complete ? resolve() : imgElement.onload = resolve),
    new Promise((resolve) => imgWatermark.complete ? resolve() : imgWatermark.onload = resolve)
  ]);

  // Convertir imagen de logo a base64
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.drawImage(imgElement, 0, 0);
  const imgData = canvas.toDataURL("image/jpeg");

  // Función para rotar y hacer la marca de agua más opaca
  function getWatermarkImage(image, angle) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Ajustar tamaño del canvas para evitar recortes
    const size = Math.max(image.naturalWidth, image.naturalHeight) * 1.5;
    canvas.width = size;
    canvas.height = size;

    // Aplicar transparencia
    ctx.globalAlpha = 0.1; // Opacidad de la marca de agua

    // Rotar la imagen en el centro del canvas
    ctx.translate(size / 2, size / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    return canvas.toDataURL("image/png");
  }

  // Obtener imagen de la marca de agua procesada
  const watermarkData = getWatermarkImage(imgWatermark, -30);

  // Insertar marca de agua centrada
  doc.addImage(watermarkData, "PNG", 30, 80, 150, 150, "", "FAST");

  // Obtener datos
  const folio = document.getElementById("folio_generar").textContent.replace("Folio: ", "");
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const año = fecha.getFullYear();
  const fechaformateada = `${dia}-${mes}-${año}`;
  const cliente = document.getElementById("cliente").selectedOptions[0].text;
  const domicilio_pdf = document.getElementById("direccion_cliente").textContent;
  const total = document.getElementById("total").value;

  // Obtener la tabla directamente desde #detalles
  const data = Array.from(document.querySelectorAll("#detalles tbody tr")).map(
    (tr) => {
      const cantidad = tr.querySelector(".cantidad")?.value || "";
      const descripcion = tr.querySelector(".descripcion")?.value || "";
      const precio = tr.querySelector(".precio_unitario")?.value || "";
      const subtotal = tr.querySelector(".subtotal")?.value || "";
      return [cantidad, descripcion, precio, subtotal];
    }
  );

  // Función para imprimir los datos y tabla en el PDF
  const imprimirBloque = () => {
    doc.addImage(imgData, "JPEG", 10, 10, 40, 15);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaformateada}`, 10, 30);
    doc.text(`Folio: ${folio}`, 10, 35);
    doc.text(`Cliente: ${cliente}`, 10, 40);
    doc.text(`Dirección: ${domicilio_pdf}`, 10, 45);

    // Generar tabla
    doc.autoTable({
      headStyles: {
        fillColor: [0, 0, 0], // Fondo negro para encabezados
        textColor: [255, 255, 255], // Texto blanco en encabezados
      },
      startY: 50,
      head: [["Cantidad", "Descripción", "Precio Unitario", "Subtotal"]],
      body: data,
    });

    // Posicionar el total justo después de la tabla
    const yFinalTabla = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total: $${total}`, 10, yFinalTabla);

    // Agregar el footer más grande
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 15;
    doc.setFontSize(12);
    doc.text("Tel: 222 434 2002 | Correo: manolindiaz76@gmail.com", 10, footerY);
  };

  // Llamar a la función para imprimir el contenido en el PDF
  imprimirBloque();

  const pdfname = `nota_${folio}_${fechaformateada}.pdf`;
  doc.save(pdfname);

  // Guardar en BD
  try {
    const response = await fetch("http://localhost:3000/api/registros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folio, fecha, cliente, total, pdfname }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Registro guardado con éxito");
      document.getElementById("remision-form").reset();
      resetearTabla();
      cargarRegistros();
      obtenerFolio();
    } else {
      console.error("Error al guardar el registro:", result.error);
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}




async function cargarRegistros() {
  try {
    const response = await fetch("http://localhost:3000/api/consulta-registros");
    if (!response.ok) throw new Error("Error al obtener los registros");

    const registros = await response.json(); // Convertimos la respuesta en JSON

    const tablaBody = document.getElementById("tablaRegistros");
    tablaBody.innerHTML = ""; // Limpiamos la tabla antes de agregar los datos

    registros.forEach((registro) => {
      const fila = document.createElement("tr");

      // Ajusta los nombres de los campos según tu tabla
      fila.innerHTML = `
                <td>${registro.id_registros}</td>
                <td>${registro.fecha_registro}</td>
                <td>${registro.cliente_registro}</td>
                <td>$ ${registro.total_registro}</td>
                <td>
                <a class="a_respaldo" href="/resources/pdfs/${encodeURIComponent(registro.pdf_respaldo)}" target="_blank" rel="noopener noreferrer" type="application/pdf">
                ${registro.pdf_respaldo}
                </a>
                </td>
            `;

      tablaBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar los registros:", error);
  }
}
