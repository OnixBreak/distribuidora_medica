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
  let fila = input.closest("tr");
  let cantidad = parseFloat(fila.querySelector(".cantidad").value) || 0;
  let precio = parseFloat(fila.querySelector(".precio_unitario").value) || 0;
  let subtotal = cantidad * precio;
  fila.querySelector(".subtotal").value = subtotal.toFixed(2);
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
    console.log("Clientes recibidos:", data); // Depuración

    const tbody = document.querySelector("#clientes-table tbody");
    tbody.innerHTML = ""; // Limpiar la tabla antes de insertar los nuevos datos

    data.forEach((cliente) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${cliente.nombre_cliente}</td>
                <td>${cliente.domicilio_cliente}</td>
                <td><button class="btn-quit" onclick="eliminarCliente(${cliente.id_cliente})">QUITAR</button></td>
            `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar los clientes:", error);
  }
}

/*Eliminar clientes */

async function eliminarCliente(id) {
  const resp_delcliente = false;
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas Eliminar al cliente?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      resp_delcliente = true;
    }
  });
  if (resp_delcliente == true)
    try {
      const response = await fetch(
        `http://localhost:3000/api/eliminar-cliente/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok)
        throw new Error(data.error || "Error al eliminar el cliente");

      Swal.fire({
        title: "Éxito",
        text: "Cliente eliminado con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      cargarClientes(); // Recargar la tabla después de eliminar
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
    }
}

/*Rellenando el select con los clientes existentes */

async function cargarClientesEnSelect() {
  try {
    const response = await fetch("http://localhost:3000/api/consulta-clientes");
    if (!response.ok)
      throw new Error(`Error en la solicitud: ${response.status}`);

    const data = await response.json();
    console.log("Clientes recibidos:", data);

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
    const cantidad = tr.querySelector(".cantidad").value;
    const descripcion = tr.querySelector(".descripcion").value;
    const precioUnitario = tr.querySelector(".precio_unitario").value;
    const subtotal = tr.querySelector(".subtotal").value;

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
  if (expresion.test(input.value)) {
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

  // Esperar a que cargue la imagen
  const imgElement = document.getElementById("logo");
  if (!imgElement.complete) {
    await new Promise((resolve) => {
      imgElement.onload = resolve;
    });
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.drawImage(imgElement, 0, 0);
  const imgData = canvas.toDataURL("image/jpeg");

  // Obtener datos
  const folio = document
    .getElementById("folio_generar")
    .textContent.replace("Folio: ", "");
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
  const año = fecha.getFullYear();
  const fechaformateada = `${dia}/${mes}/${año}`;
  //const fecha = new Date().toISOString().split('T')[0];
  const cliente = document.getElementById("cliente").selectedOptions[0].text;
  const domicilio_pdf =
    document.getElementById("direccion_cliente").textContent;
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

  // FUNCION PARA IMPRIMIR UN BLOQUE (original o copia)
  const imprimirBloque = (offsetY = 0, etiqueta = "") => {
    doc.addImage(imgData, "JPEG", 10, 10 + offsetY, 40, 15);
    doc.setFontSize(12);
    doc.text(`${etiqueta} Fecha: ${fechaformateada}`, 10, 30 + offsetY);
    doc.text(`Folio: ${folio}`, 10, 35 + offsetY);
    doc.text(`Cliente: ${cliente}`, 10, 40 + offsetY);
    doc.text(`Dirección: ${domicilio_pdf}`, 10, 45 + offsetY);

    doc.autoTable({
      startY: 50 + offsetY,
      head: [["Cantidad", "Descripción", "Precio Unitario", "Subtotal"]],
      body: data,
    });

    const yFinal = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: $${total}`, 10, yFinal);
    doc.text(
      "Tel: 222 434 2002 Correo: manolindiaz76@gmail.com",
      10,
      yFinal + 5
    );
  };

  // Parte 1: ORIGINAL
  imprimirBloque(0, "Original -");

  // Parte 2: COPIA (150mm más abajo)
  imprimirBloque(150, "Copia -");

  const pdfname = `nota_${folio}_${fecha}.pdf`;
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
    const response = await fetch(
      "http://localhost:3000/api/consulta-registros"
    );
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
                <td>${registro.pdf_respaldo}</td>
            `;

      tablaBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar los registros:", error);
  }
}
