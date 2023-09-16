import { firebaseConfig, db } from "./firestore.js";
let idAnamesis = "";
let row;
document.addEventListener("DOMContentLoaded", function () {
  let lastSelectedRow;
  let currentSelectedRow;
  const contentDiv = document.getElementById("content");
  // Cargar funciones cuando se cargo el div en HTML
  function onDivInserted(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Verifica si el nodo insertado tiene el ID correcto
        if (mutation.addedNodes[2].id === "fichamedica") {
          let id = getIdPaciente();
          getPaciente(id);
          getAnamnesis(id);
          buscadorAnamnesis();
        }
      }
    }
  }
  const observer = new MutationObserver(onDivInserted);
  observer.observe(contentDiv, { childList: true });

  // Eventos click
  contentDiv.addEventListener("click", function (event) {
    const target = event.target;
    /*========================== EDITAR y GUARADAR =================================== */

    if (target && target.id === "btnAbrirModalAn") {
      let anModaTitlel = document.getElementById("anModaTitlel");
      anModaTitlel.innerHTML = `Nuevo Registro - Fecha: ${obtenerFechaHoraActual()}`;
      document.getElementById("btnInsertAn").innerHTML = "Crear Anamnesis";
      limpiarCamposForm();
    }
    if (target && (target.id === "editarAn" || target.id === "editarAnI")) {
      document.getElementById("anModaTitlel").innerHTML = "Editar Anamnesis";
      document.getElementById("btnInsertAn").innerHTML = "Guardar Edicion";

      cargarDatosEdit(target.getAttribute("data-id"));
      idAnamesis = target.getAttribute("data-id");
    }
    // Verifica si el evento se originó en el botón con el ID "btnInsertAn"
    if (target && target.id === "btnInsertAn") {
      if (
        document.getElementById("btnInsertAn").innerHTML === "Guardar Edicion"
      ) {
        editarAnamesis(idAnamesis);

        if (row.classList.contains("table-primary")) {
          const anamnesisId = row.getAttribute("id");
          cargarDetallesAnamnesis(anamnesisId);
        }
      }
      if (
        document.getElementById("btnInsertAn").innerHTML === "Crear Anamnesis"
      ) {
        //Crear nuva Anamnesis
        let id = getIdPaciente();
        crearAnamnesis(id);
      }
    }
    /*========================== FIN EDITAR y GUARADAR=================================== */

    // Mostrar detelles de la Anamnesis
    if (target && target.tagName === "TD") {
      row = target.closest("tr");
      if (row) {
        if (row.classList.contains("table-primary")) {
          row.classList.remove("table-primary");
          limpiarDetrallesAnamnesis();
        } else {
          row.classList.add("table-primary");
          currentSelectedRow = row;
          console.log(currentSelectedRow);
          if (lastSelectedRow != currentSelectedRow) {
            if (lastSelectedRow) {
              lastSelectedRow.classList.remove("table-primary");
            }
            lastSelectedRow = currentSelectedRow;
          }
        }
        const anamnesisId = row.getAttribute("id");
        if (row.classList.contains("table-primary")) {
          cargarDetallesAnamnesis(anamnesisId);
        }
      }
    }

    // Verifica si el evento se originó en el botón con el ID "eliminarAn o eliminarAnI "
    if (target && (target.id === "eliminarAn" || target.id === "eliminarAnI")) {
      eliminarAnamnesis(target.getAttribute("data-id"));
      limpiarDetrallesAnamnesis();
    }
    console.log(target.tagName);
  });

  /*========================== FUNCIONES GENERALES =================================== */

  //Obtener el Id del paciente
  function getIdPaciente() {
    const urlActual = window.location.href;
    const segmentosURL = urlActual.split("/");
    const id = segmentosURL.pop();
    return id;
  }
  //obtner datos del Paciente
  function getPaciente(id) {
    let anModaTitlel = document.getElementById("anModaTitlel");
    let titulo = document.getElementById("titulo");
    let grupoSanguineoPaciente = document.getElementById(
      "grupoSanguineoPaciente"
    );
    let docCabeceraPaciente = document.getElementById("docCabeceraPaciente");
    let antecedentesPaciente = document.getElementById("antecedentesPaciente");

    let docRef = db.collection("pacientes").doc(id);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          titulo.innerHTML = `Registros Medicos de  <b> ${
            doc.data().nombresPaciente
          } ${doc.data().apellidosPaciente}</b>`;
          docCabeceraPaciente.innerHTML = doc.data().docCabeceraPaciente;
          antecedentesPaciente.innerHTML = doc.data().antecedentesPaciente;
          grupoSanguineoPaciente.innerHTML = doc.data().grupoSanguineoPaciente;
        } else {
          console.log("No such document!");
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se encontro al Paciente! Vuelva al Pagina de Pacientes",
          });
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
  //Obeter Fecha y hora actual dd/mm/aaaa HH:mm
  function obtenerFechaHoraActual() {
    const ahora = new Date();

    // Obtenemos los componentes de la fecha y hora actual
    const dia = ahora.getDate().toString().padStart(2, "0");
    const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // +1 porque los meses van de 0 a 11
    const anio = ahora.getFullYear();
    const horas = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");

    // Formateamos la fecha y hora
    const fechaHora = `${dia}/${mes}/${anio} ${horas}:${minutos}`;

    return fechaHora;
  }
  // Función para cargar y mostrar los detalles de la anamnesis
  function cargarDetallesAnamnesis(anamnesisId) {
    let detalleAnamnesis = document.getElementById("detalleAnamnesis");
    db.collection("fichamedica")
      .doc(anamnesisId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          detalleAnamnesis.innerHTML = `
            <div">
            <div class="card mb-4">
              <div class="card-header"><h4>Anamnesis Actual</h4></div>
              <div class="card-body">
                <blockquote class="blockquote mb-0 text-start fontDetallesAn">
  
                  <p> <b>Motivo de Consulta:  </b>${data.motivoConsulta}</p>
                  <p> <b> Dolor/frecuencia/intencidad:</b> ${data.dolor}</p>
                  <p> <b> Inspección: </b> ${data.inspeccion}</p>
                  <p> <b> Palpación: </b> ${data.palpacion}</p>
                  <p> <b> Movilidad Pasiva: </b> ${data.movilidadPasiva}</p>
                  <p> <b> Movilidad Activa: </b> ${data.movilidadActiva}</p>
                  <p> <b> Fuerza: </b> ${data.fuerza}</p>
                  <p> <b> ROM: </b> ${data.rom}</p>
  
                </blockquote>
              </div>
            </div>
            <div class="card mb-4">
              <div class="card-header"><h4>Diagnóstico del Paciente:</h4></div>
              <div class="card-body">
                <blockquote class="blockquote fontDetallesAn mb-0 text-start">
                <p>${data.diagnostico}</p>
                </blockquote>
              </div>
            </div>
            <div class="card mb-4">
            <div class="card-header"><h4>Tratamiento del Paciente:</h4></div>
            <div class="card-body">
              <blockquote class="blockquote fontDetallesAn mb-0 text-start">
              <p>${data.tratamiento}</p>
              </blockquote>
            </div>
          </div>
            <div class="card mb-4">
              <div class="card-header"><h4>Evolución del Paciente</h4></div>
              <div class="card-body">
                <blockquote class="blockquote fontDetallesAn mb-0 text-start">
                  <p>${data.evolucion}</p>
                  <p></p>
                </blockquote>
              </div>
            </div>
          </div>
          `;
        } else {
          Swal.fire("ERRO!", "Detalle no encotrado!", "error");
          console.log("La anamnesis no existe");
        }
      })
      .catch((error) => {
        console.error("Error al cargar los detalles de la anamnesis: ", error);
      });
  }
  //Limpiar detalle
  function limpiarDetrallesAnamnesis() {
    let detalleAnamnesis = document.getElementById("detalleAnamnesis");
    detalleAnamnesis.innerHTML = `<div class="text-center"><span>Haga Click sobre una Anamnesis para ver le Detalle</span></div> `;
  }
  //badge de color segun el estado
  function badgeColor(estado) {
    if (estado === "En Diagnosis") {
      return "text-bg-warning";
    }
    if (estado === "En Tratamiento") {
      return "text-bg-primary";
    }
    if (estado === "Alta") {
      return "text-bg-success";
    }
    if (estado === "Derivado") {
      return "text-bg-secondary";
    }
  }
  //cargar datos en dom para editarlos
  function cargarDatosEdit(id) {
    let motivoConsulta = document.getElementById("motivoConsulta");
    let dolor = document.getElementById("dolor");
    let inspeccion = document.getElementById("inspeccion");
    let palpacion = document.getElementById("palpacion");
    let movilidadPasiva = document.getElementById("movilidadPasiva");
    let movilidadActiva = document.getElementById("movilidadActiva");
    let fuerza = document.getElementById("fuerza");
    let rom = document.getElementById("rom");
    let estado = document.getElementById("estado");
    let tratamiento = document.getElementById("tratamiento");
    let evolucion = document.getElementById("evolucion");
    let diagnostico = document.getElementById("diagnostico");
    let docRef = db.collection("fichamedica").doc(id);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          motivoConsulta.value = data.motivoConsulta;
          dolor.value = data.dolor;
          inspeccion.value = data.inspeccion;
          palpacion.value = data.palpacion;
          movilidadPasiva.value = data.movilidadPasiva;
          movilidadActiva.value = data.movilidadActiva;
          fuerza.value = data.fuerza;
          rom.value = data.rom;
          diagnostico.value = data.diagnostico;
          tratamiento.value = data.tratamiento;
          evolucion.value = data.evolucion;
          estado.value = data.estado;
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
  //Limpia los campos del fomularaio en el DOM
  function limpiarCamposForm() {
    document.getElementById("motivoConsulta").value = "";
    document.getElementById("dolor").value = "";
    document.getElementById("inspeccion").value = "";
    document.getElementById("palpacion").value = "";
    document.getElementById("movilidadPasiva").value = "";
    document.getElementById("movilidadActiva").value = "";
    document.getElementById("fuerza").value = "";
    document.getElementById("rom").value = "";
    document.getElementById("tratamiento").value = "";
    document.getElementById("evolucion").value = "";
    document.getElementById("diagnostico").value = "";
  }
  //Buscar en table Anamnesis
  function buscadorAnamnesis() {
    const tabla = document.getElementById("tableAn");
    const inputBusqueda = document.getElementById("buscarAn");

    // Agrega un evento de entrada (input) al campo de búsqueda
    inputBusqueda.addEventListener("input", function () {
      const valorBusqueda = inputBusqueda.value.toLowerCase();
      const filas = tabla.querySelectorAll("tbody tr");

      filas.forEach(function (fila) {
        const columnas = fila.querySelectorAll("td");
        let coincide = false;

        columnas.forEach(function (columna) {
          if (columna.textContent.toLowerCase().includes(valorBusqueda)) {
            coincide = true;
          }
        });

        if (coincide) {
          fila.style.display = "";
        } else {
          fila.style.display = "none";
        }
      });
    });
  }

  /*========================== FUNCIONES CRUD =================================== */
  //C Cerar una Anamnesis relacionada a un paciente
  function crearAnamnesis(id) {
    let motivoConsulta = document.getElementById("motivoConsulta") || "-";
    let dolor = document.getElementById("dolor") || "-";
    let inspeccion = document.getElementById("inspeccion") || "-";
    let palpacion = document.getElementById("palpacion") || "-";
    let movilidadPasiva = document.getElementById("movilidadPasiva") || "-";
    let movilidadActiva = document.getElementById("movilidadActiva") || "-";
    let fuerza = document.getElementById("fuerza") || "-";
    let rom = document.getElementById("rom") || "-";
    let estado = document.getElementById("estado");
    let fechaCreacion = obtenerFechaHoraActual();
    let tratamiento = document.getElementById("tratamiento") || "Sin Datos";
    let evolucion = document.getElementById("evolucion") || "Sin Datos";
    let diagnostico =
      document.getElementById("diagnostico") || "Sin Diagnóstico";

    db.collection("fichamedica")
      .add({
        ID_paciente: id,
        fechaCreacion: fechaCreacion,
        motivoConsulta: motivoConsulta.value,
        dolor: dolor.value,
        inspeccion: inspeccion.value,
        palpacion: palpacion.value,
        movilidadPasiva: movilidadPasiva.value,
        movilidadActiva: movilidadActiva.value,
        fuerza: fuerza.value,
        rom: rom.value,
        estado: estado.value,
        diagnostico: diagnostico.value,
        tratamiento: tratamiento.value,
        evolucion: evolucion.value,
      })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "success",
          title: "Anamnesis creada Exitosamente! 😊",
        });

        motivoConsulta.value = "";
        dolor.value = "";
        inspeccion.value = "";
        palpacion.value = "";
        movilidadPasiva.value = "";
        movilidadActiva.value = "";
        fuerza.value = "";
        rom.value = "";
        diagnostico.value = "";
        tratamiento.value = "";
        evolucion.value = "";
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "error",
          title: "Error al crear la Anamnesis! 😥" + error,
        });
      });
  }
  //R Obtener todas las Anamnesis del paciente
  function getAnamnesis(id) {
    let tableAn = document.getElementById("tableAn");
    db.collection("fichamedica")
      .where("ID_paciente", "==", id)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const doc = change.doc;
            let estadoColor = badgeColor(doc.data().estado);
            const newRow = `
            <tr id="${doc.id}">
              <td>${doc.data().fechaCreacion} </td>
              <td>${doc.data().motivoConsulta}</td>
              <td>
                <span class="badge ${estadoColor}">
                  ${doc.data().estado}
                </span>
              </td>
              <td>
              <!----------------------------BOTON VER---------------------------->
  
              <!----------------------------BOTON EDITAR------------------------->
                  <button 
                    data-bs-toggle="modal" 
                    data-bs-target="#anModal" 
                    type="button" 
                    class="btn btn-warning btn-sm" 
                    id="editarAn" 
                    data-id="${doc.id}">
                    <i class="bi bi-pencil-square" 
                      data-bs-toggle="modal" 
                      data-bs-target="#anModal" 
                      id="editarAnI" data-id="${doc.id}">
                    </i>
                  </button>
              <!----------------------------BOTON ELIMINAR------------------------->
                <button type="button" 
                class="btn btn-danger btn-sm" 
                id="eliminarAn" 
                  data-id="${doc.id}">
                    <i class="bi bi-journal-x" 
                      id="eliminarAnI" 
                      data-id="${doc.id}">
                    </i>
                </button>
              </td>
            </tr>`;
            tableAn.insertAdjacentHTML("afterbegin", newRow);
          } else if (change.type === "removed") {
            // Aquí eliminarás filas cuando se eliminen documentos
            const doc = change.doc;
            const rowToRemove = document.getElementById(`${doc.id}`);
            if (rowToRemove) {
              rowToRemove.remove();
            }
          }
        });
      });
  }
  //U Editar Pacientes
  function editarAnamesis(id) {
    let motivoConsulta = document.getElementById("motivoConsulta") || "-";
    let dolor = document.getElementById("dolor") || "-";
    let inspeccion = document.getElementById("inspeccion") || "-";
    let palpacion = document.getElementById("palpacion") || "-";
    let movilidadPasiva = document.getElementById("movilidadPasiva") || "-";
    let movilidadActiva = document.getElementById("movilidadActiva") || "-";
    let fuerza = document.getElementById("fuerza") || "-";
    let rom = document.getElementById("rom") || "-";
    let estado = document.getElementById("estado");
    let fechaCreacion = obtenerFechaHoraActual();
    let tratamiento = document.getElementById("tratamiento") || "Sin Datos";
    let evolucion = document.getElementById("evolucion") || "Sin Datos";
    let diagnostico =
      document.getElementById("diagnostico") || "Sin Diagnóstico";

    var pacienteRef = db.collection("fichamedica").doc(id);

    return pacienteRef
      .update({
        fechaCreacion: fechaCreacion,
        motivoConsulta: motivoConsulta.value,
        dolor: dolor.value,
        inspeccion: inspeccion.value,
        palpacion: palpacion.value,
        movilidadPasiva: movilidadPasiva.value,
        movilidadActiva: movilidadActiva.value,
        fuerza: fuerza.value,
        rom: rom.value,
        estado: estado.value,
        diagnostico: diagnostico.value,
        tratamiento: tratamiento.value,
        evolucion: evolucion.value,
      })
      .then(() => {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "success",
          title: "Anamnesis editada Exitosamente! 😊",
        });
      })
      .catch((error) => {
        // The document probably doesn't exist.
        console.error("Error editar document: ", error);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "error",
          title: "Error al editar Anamnesis! 😥" + error,
        });
      });
  }
  //U Eliminar Fichas medicas
  function eliminarAnamnesis(id) {
    Swal.fire({
      title: "Estas seguro de elimianar este Registro?",
      text: "No se puede revertir esta accion",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar!",
    }).then((result) => {
      if (result.isConfirmed) {
        db.collection("fichamedica")
          .doc(id)
          .delete()
          .then(() => {
            console.log("Document successfully deleted!");
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
              },
            });
            Toast.fire({
              icon: "success",
              title: "Anamnesis Eliminda 🗑 Exitosamente!😊",
            });
          })
          .catch((error) => {
            Swal.fire("ERRO!", "Anamnesis NO Eliminada!", "error");
          });
      }
    });
  }
});
