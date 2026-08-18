
document.addEventListener("DOMContentLoaded", () => {
  const primerPrecio = document.querySelector(".precio_unitario");
  if (primerPrecio) activarEnterEnPrecio(primerPrecio);
});

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
    resetearTabla();
    mostrarFechaActual();
    obtenerFolio();
    
    
  }
}

document.getElementById("cerrar_sesion").addEventListener("click", () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor:'#0066FF',
    cancelButtonColor:'#FF2A3B',
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

  const nuevoPrecio = nuevaFila.querySelector(".precio_unitario");
  activarEnterEnPrecio(nuevoPrecio);
  activarESCEnFila(nuevaFila);

  nuevaFila.querySelector(".cantidad").focus();
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
      confirmButtonColor:'#0066FF',
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
    const response = await fetch("/api/consulta-folio");
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

    const response = await fetch("/api/agregar-cliente", {
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
        confirmButtonColor:'#0066FF',
        confirmButtonText: "Aceptar",
      });
      document.getElementById("cliente-form").reset();
    } else {
      Swal.fire({
        title: "Error",
        text: "No se guardó el cliente" + data.error,
        icon: "error",
        confirmButtonColor:'#FF2A3B',
        confirmButtonText: "Aceptar",
      });
    }
    cargarClientes();
  });
  

async function cargarClientes() {
  try {
    const response = await fetch("/api/consulta-clientes");
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
      confirmButtonColor:'#FF2A3B',
      confirmButtonText: "Aceptar",
    });
    return;
  }

  // Hacer la solicitud PUT con los datos correctos
  try {
    const response = await fetch(`/api/actualizar-cliente/${id_cliente}`, {
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
      confirmButtonColor:'#0066FF',
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
      confirmButtonColor:'#FF2A3B',
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
    confirmButtonColor:'#0066FF',
    confirmButtonText: "Eliminar",
    cancelButtonColor:'#FF2A3B',
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `/api/eliminar-cliente/${id}`,
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
        confirmButtonColor:'#0066FF',
        confirmButtonText: "Aceptar",
      });

      cargarClientes(); // Recargar la tabla después de eliminar
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el cliente",
        icon: "error",
        confirmButtonColor:'#FF2A3B',
        confirmButtonText: "Aceptar",
      });
    }
  }
}



/*Rellenando el select con los clientes existentes */

async function cargarClientesEnSelect() {
  try {
    const response = await fetch("/api/consulta-clientes");
    if (!response.ok)
      throw new Error(`Error en la solicitud: ${response.status}`);

    const data = await response.json();

    const clienteSelect = document.getElementById("cliente");
    clienteSelect.innerHTML = ""; // limpiar el select

    // Agregar opción inicial
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Venta General";
    defaultOption.setAttribute("data_direccion", "Sin dirección");
    clienteSelect.appendChild(defaultOption);

    // Agregar clientes reales
    data.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id_cliente;
      option.textContent = cliente.nombre_cliente;
      option.setAttribute("data_direccion", cliente.domicilio_cliente);
      clienteSelect.appendChild(option); // ← aquí estaba tu error
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
  const fecha = new Date();
  const inputFecha = document.getElementById("fecha_actual");

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  // al input se le manda YYYY-MM-DD
  inputFecha.value = `${anio}-${mes}-${dia}`;
}


document.addEventListener("DOMContentLoaded", mostrarFechaActual);

/*vista previa del pdf a generar */
function mostrarVistaPrevia() {
  // Obtener elementos del formulario
  let fechaInput = document.getElementById("fecha_actual").value; // YYYY-MM-DD

let fechaFormateada = "Sin fecha";

if (fechaInput) {
    const [anio, mes, dia] = fechaInput.split("-");
    fechaFormateada = `${dia}/${mes}/${anio}`;
}

document.getElementById("vista-fecha").textContent = `Fecha: ${fechaFormateada}`;

  const folio = document.getElementById("folio_generar").textContent;
  const clienteSelect = document.getElementById("cliente");

let cliente = "Venta General"; // Valor por defecto
let direccion_pdf = "Sin dirección";

if (clienteSelect && clienteSelect.selectedOptions.length > 0) {
    cliente = clienteSelect.selectedOptions[0].text || "Venta General";
    direccion_pdf = document.getElementById("direccion_cliente").textContent || "Sin dirección";
}

  const direccion_vista =
    document.getElementById("direccion_cliente").textContent;
  const total = document.getElementById("total").value;

  // Mostrar los datos en la vista previa
  document.getElementById("vista-fecha").textContent = `Fecha: ${fechaFormateada}`;
  document.getElementById("vista-folio").textContent =`Folio: ${folio}`;
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

/*Generar el pdf */
async function generarPDF() {
  let esEdicion = window.modoEdicion === true;
  let folio = esEdicion ? window.folioActual : document.getElementById("folio_generar").textContent;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // VALIDAR CAMPOS ANTES DE GENERAR EL PDF
let errores = [];
let filas = document.querySelectorAll("#detalles tbody tr");

// Verificar filas
if (filas.length === 0) {
  errores.push("Debe existir al menos una fila.");
}

filas.forEach((fila, index) => {
  const cantidad = fila.querySelector(".cantidad").value.trim();
  const descripcion = fila.querySelector(".descripcion").value.trim();
  const precio = fila.querySelector(".precio_unitario").value.trim();
  const subtotal = fila.querySelector(".subtotal").value.trim();

  if (!cantidad || Number(cantidad) <= 0) {
    errores.push(`Cantidad inválida en la fila ${index + 1}`);
  }
  if (!descripcion) {
    errores.push(`La descripción está vacía en la fila ${index + 1}`);
  }
  if (!precio || Number(precio) <= 0) {
    errores.push(`Precio inválido en la fila ${index + 1}`);
  }
  if (!subtotal || Number(subtotal) <= 0) {
    errores.push(`Subtotal inválido en la fila ${index + 1}`);
  }
});

// Validación del TOTAL
const totalValor = document.getElementById("total").value;
if (!totalValor || Number(totalValor) <= 0) {
  errores.push("El total de la nota no puede ser 0.");
}

// Si hay errores, frenar la ejecución
if (errores.length > 0) {
  Swal.fire({
    icon: "error",
    title: "Campos inválidos",
    html: errores.join("<br>"),
  });
  return;
}


  /* ----------------------------- CARGAR IMÁGENES ----------------------------- */

  const imgElement = document.getElementById("logo");
  const imgWatermark = document.getElementById("watermark");

  await Promise.all([
    new Promise((resolve) => (imgElement.complete ? resolve() : (imgElement.onload = resolve))),
    new Promise((resolve) => (imgWatermark.complete ? resolve() : (imgWatermark.onload = resolve))),
  ]);

  // Convertir logo a base64
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.drawImage(imgElement, 0, 0);

  const imgData = canvas.toDataURL("image/jpeg");

  /* --------------------------- MARCA DE AGUA ROTADA --------------------------- */

  function generarMarcaAgua(image, angle) {
    const c = document.createElement("canvas");
    const x = c.getContext("2d");

    const size = Math.max(image.naturalWidth, image.naturalHeight) * 1.5;
    c.width = size;
    c.height = size;

    x.globalAlpha = 0.12;
    x.translate(size / 2, size / 2);
    x.rotate((angle * Math.PI) / 180);
    x.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    return c.toDataURL("image/png");
  }

  const watermarkData = generarMarcaAgua(imgWatermark, -30);

  // Insertar marca de agua centrada
  doc.addImage(watermarkData, "PNG", 25, 70, 160, 160, "", "FAST");

  /* --------------------------------- DATOS ---------------------------------- */

  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaActual.getDate()).padStart(2, "0");

  const fechaPDF = `${dia}-${mes}-${anio}`;
  
  const fechaBD = fechaActual.toISOString().slice(0, 19).replace("T", " ");

  const clienteSelect = document.getElementById("cliente");

let cliente = "Venta General"; // Valor por defecto
let direccion_pdf = "Sin dirección";

if (clienteSelect && clienteSelect.selectedOptions.length > 0) {
    cliente = clienteSelect.selectedOptions[0].text || "Venta General";
    direccion_pdf = document.getElementById("direccion_cliente").textContent || "Sin dirección";
}

  const domicilio_pdf = direccion_pdf;

  const total = document.getElementById("total").value;

  /* --------------------------- OBTENER TABLA --------------------------- */

  const data = Array.from(document.querySelectorAll("#detalles tbody tr")).map((tr) => {
    return [
      tr.querySelector(".cantidad")?.value || "",
      tr.querySelector(".descripcion")?.value || "",
      tr.querySelector(".precio_unitario")?.value || "",
      tr.querySelector(".subtotal")?.value || "",
    ];
  });

  /* --------------------------- GENERAR PDF --------------------------- */

  function imprimirPDF() {
    doc.addImage(imgData, "JPEG", 10, 10, 57, 45);

    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaPDF}`, 10, 60);
    doc.text(`Folio: ${folio}`, 10, 65);
    doc.text(`Cliente: ${cliente}`, 10, 70);
    doc.text(`Dirección: ${domicilio_pdf}`, 10, 75);

    doc.autoTable({
      head: [["Cantidad", "Descripción", "Precio Unitario", "Subtotal"]],
      body: data,
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
      },
      startY: 80,
    });

    const yFinal = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text(`Total: $${total}`, 10, yFinal);

    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(12);
    doc.text("Tel: 222 434 2002 | Correo: manolindiaz76@gmail.com", 10, footerY);
  }

  imprimirPDF();

  const pdfname = `nota_${folio}_${fechaPDF}.pdf`;
  
// Obtener el PDF como archivo
const pdfBlob = doc.output("blob");

// Preparar archivo para enviarlo al servidor
const formData = new FormData();
formData.append("pdf", pdfBlob, pdfname);

// Guardar PDF en el servidor
const pdfResponse = await fetch("/api/guardar-pdf", {
    method: "POST",
    body: formData
});

if (!pdfResponse.ok) {
    throw new Error("No se pudo guardar el PDF en el servidor");
}

const pdfResultado = await pdfResponse.json();

console.log("PDF guardado en servidor:", pdfResultado);

// Descargar también el PDF en el dispositivo
  doc.save(pdfname);
  window.modoEdicion = false;
  window.folioActual = null;

  /* ---------------------------- GUARDAR EN BD ---------------------------- */
  // Construir el array de detalles
const detalles = Array.from(document.querySelectorAll("#detalles tbody tr"))
    .map(tr => {
        const cantidad = tr.querySelector(".cantidad").value;
        const descripcion = tr.querySelector(".descripcion").value;
        const precio = tr.querySelector(".precio_unitario").value;
        const subtotal = tr.querySelector(".subtotal").value;

        return { cantidad, descripcion, precio, subtotal };
    })
    .filter(d => d.cantidad && d.descripcion && d.precio && d.subtotal); // Evitar filas vacías


  try {
    let url = esEdicion
    ? `/api/registros/${folio}`  // UPDATE
    : "/api/registros";          // INSERT

let metodo = esEdicion ? "PUT" : "POST";

      const response = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        folio,
        fecha: fechaBD,
        cliente,
        total,
        pdfname,
        detalles
    })
});

    const result = await response.json();

    if (result.success) {
      console.log("Registro guardado");
      document.getElementById("remision-form").reset();
      resetearTabla();
      mostrarFechaActual();
      cargarRegistros();
      obtenerFolio();
    } else {
      console.error("Error al guardar:", result.error);
    }
  } catch (error) {
    console.error("Error al enviar datos:", error);
  }
}

document.getElementById("generar_pdf").addEventListener("click", generarPDF);




async function cargarRegistros() {
  try {
    const response = await fetch("/api/consulta-registros");
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

/******CONSULTA PARA EDITAR EL REGISTRO***** */
document.getElementById("btn_consultar_registro").addEventListener("click", buscarRegistro);

async function buscarRegistro() {
  


  
    const folio = document.getElementById("folio_edit").value.trim();

    if (!folio) {
        Swal.fire("Error", "Ingresa un folio para buscar.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/consultRegistEdit/${folio}`);

        if (!response.ok) {
            Swal.fire("No encontrado", "No existe un registro con ese folio.", "warning");
            document.querySelector("input[name='folio_edit']").value = "";

            return;
        }

        const registro = await response.json();
        //console.log(registro);

        // Mostrar datos
        document.getElementById("edit-folio").textContent = `Folio: ${registro.id_registros}`;
        document.getElementById("edit-cliente").textContent = `Cliente: ${registro.cliente_registro}`;
        document.getElementById("edit-venta").textContent = `Venta: $${registro.total_registro}`;
        document.getElementById("edit-file").textContent = `Nombre del archivo: ${registro.pdf_respaldo}`;

        // Guardarlo globalmente para usarlo luego
        window.registroActual = registro;

        window.folioActual = folio;


        // Mostrar el botón Editar
        
        document.getElementById("editar_registro").style.display = "block";

    } catch (error) {
        console.error("Error consultando registro:", error);
        Swal.fire("Error", "No se pudo consultar el registro.", "error");
    }
    document.querySelector("input[name='folio_edit']").value = "";
    
}

document.getElementById("editar_registro").addEventListener("click", async () => {
    const folio = window.folioActual; // Lo guardaremos cuando se consulte
    if (!folio) {
        Swal.fire("Error", "Primero consulta un registro", "error");
        return;
    }

    // Cambiar de sección automáticamente
    showSection("crear-remision");

    // Cargar datos principales
    await cargarRegistroParaEditar(folio);

    // Cargar detalles del registro
    await cargarDetallesParaEditar(folio);

    Swal.fire("Edición habilitada", "Ya puedes modificar la nota", "success");
});

async function cargarRegistroParaEditar(folio) {
    const response = await fetch(`/api/consultar-registro/${folio}`);
    const data = await response.json();
    

    const reg = data.registro;

    // Seleccionar el cliente por TEXTO visible
const select = document.getElementById("cliente");
let clienteEncontrado = false;

for (let op of select.options) {
    if (op.textContent.trim() === reg.cliente_registro.trim()) {
        select.value = op.value;
        clienteEncontrado = true;

        // Cargar dirección automáticamente
        document.getElementById("direccion_cliente").textContent =
            op.getAttribute("data_direccion") || "Sin dirección";
        break;
    }
}

// Si no existe en la lista, usar “Venta General”
if (!clienteEncontrado) {
    select.value = "";
    document.getElementById("direccion_cliente").textContent = "Sin dirección";
}


    document.getElementById("total").value = reg.total_registro;

    // Convertir fecha MySQL → YYYY-MM-DD (para input date)
    const fecha = new Date(reg.fecha_registro);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    document.getElementById("fecha_actual").value = `${yyyy}-${mm}-${dd}`;

    document.getElementById("folio_generar").textContent = folio;
    
}
async function cargarDetallesParaEditar(folio) {
    const response = await fetch(`/api/detalles/${folio}`);
    const detalles = await response.json();

    const tbody = document.querySelector("#detalles tbody");
    tbody.innerHTML = ""; // limpiar todo

    detalles.forEach(det => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><input type="number" class="cantidad" value="${det.cantidad}" oninput="calcularSubtotal(this)" required></td>
            <td><input type="text" class="descripcion" value="${det.descripcion}" required></td>
            <td><input type="number" class="precio_unitario" value="${det.precio_unitario}" oninput="calcularSubtotal(this)" required></td>
            <td><input type="number" class="subtotal" value="${det.subtotal}" readonly></td>
            <td><button type="button" onclick="eliminarFila(this)">❌</button></td>
        `;

        tbody.appendChild(fila);
    });
    calcularTotal();
}

// Permitir buscar al presionar ENTER en el input de Folio a buscar
document
  .querySelector("input[name='folio_edit']")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Para evitar que recargue la página
      document.querySelector(".edit_registro button.btn-add").click();
    }
  });

function activarEnterEnPrecio(input) {
  input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      agregarFila();
    }
  });
}
function activarESCEnFila(fila) {
  fila.querySelectorAll("input").forEach(input => {
    input.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {

        const filas = Array.from(document.querySelectorAll("#detalles tbody tr"));
        const index = filas.indexOf(fila);
        const totalFilas = filas.length;

        // Evitar borrar si solo queda una fila
        if (totalFilas === 1) {
          Swal.fire({
            title: "Error",
            text: "Debe haber al menos una fila!",
            icon: "error",
            confirmButtonColor:'#0066FF',
            confirmButtonText: "Ok"
          });
          return;
        }

        // Elegir a qué fila brincar después de eliminar
        let filaDestino = null;

        // Si existe fila siguiente → usar esa
        if (filas[index + 1]) {
          filaDestino = filas[index + 1];
        } 
        // Si no existe, usar la anterior
        else if (filas[index - 1]) {
          filaDestino = filas[index - 1];
        }

        // Eliminar la fila actual
        fila.remove();

        calcularTotal();

        // Enfocar la columna CANTIDAD de la nueva fila seleccionada
        if (filaDestino) {
          const inputCantidad = filaDestino.querySelector(".cantidad");
          if (inputCantidad) inputCantidad.focus();
        }
      }
    });
  });
}


document.getElementById("editar_registro").addEventListener("click", async () => {
    if (!window.folioActual) {
        Swal.fire("Error", "Primero consulta un registro", "error");
        return;
    }

    window.modoEdicion = true; // 👈 ACTIVAMOS MODO EDICIÓN

    showSection("crear-remision");

    await cargarRegistroParaEditar(window.folioActual);
    await cargarDetallesParaEditar(window.folioActual);

    Swal.fire("Edición habilitada", "Ya puedes modificar la nota", "success");
});


