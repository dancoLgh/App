import { firebaseConfig, db } from "./firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");

  // Eventos click
  contentDiv.addEventListener("click", function (event) {
    const target = event.target;
    if (target && target.id === "btnInsertAn") {
      let id = getIdPaciente();
      crearAnamnesis(id);
    }
  });

  // Cargar funciones cuando se cargo el div en HTML
  function onDivInserted(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Verifica si el nodo insertado tiene el ID correcto
        if (mutation.addedNodes[2].id === "fichamedica") {
          let id = getIdPaciente();
          getPaciente(id);
          getAnamnesis(id);
        }
      }
    }
  }
  const observer = new MutationObserver(onDivInserted);
  observer.observe(contentDiv, { childList: true });

  /*========================== FUNCIONES =================================== */
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
    let docCabeceraPaciente = document.getElementById("docCabeceraPaciente");
    let antecedentesPaciente = document.getElementById("antecedentesPaciente");

    anModaTitlel.innerHTML = `Nueva Regisreo - Fecha: ${obtenerFechaHoraActual()}`;

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
  //Cerar una Anamnesis relacionada a un paciente
  function crearAnamnesis(id) {
    let motivoConsulta = document.getElementById("motivoConsulta");
    let dolor = document.getElementById("dolor");
    let inspeccion = document.getElementById("inspeccion");
    let palpacion = document.getElementById("palpacion");
    let movilidadPasiva = document.getElementById("movilidadPasiva");
    let movilidadActiva = document.getElementById("movilidadActiva");
    let fuerza = document.getElementById("fuerza");
    let rom = document.getElementById("rom");
    let estado = document.getElementById("estado");
    let fechaCreacion = obtenerFechaHoraActual();

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
        // diagnostico,
        // tratamiento,
        // evolucion,
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
  //Obtener todas las Anamnesis del paciente
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
          <tr>
            <td>${doc.data().fechaCreacion} </td>
            <td>${doc.data().motivoConsulta}</td>
            <td><span class="badge ${estadoColor}">${
              doc.data().estado
            }</span></td>
            <td>
                <a  href="#/an/${
                  doc.id
                }"> <button type="button" class="btn btn-success btn-sm" id="verPaciente"><i class="bi bi-eye"></i></button></a>
                <button data-bs-toggle="modal" data-bs-target="#crearPacienteModal" type="button" class="btn btn-warning btn-sm" id="editarPaciente" data-id="${
                  doc.id
                }"><i class="bi bi-pencil-square" data-bs-toggle="modal" data-bs-target="#crearPacienteModal" id="editarPacienteI" data-id="${
              doc.id
            }" ></i></button>
                <button type="button" class="btn btn-danger  btn-sm id="eliminarAn" data-id="${
                  doc.id
                }"><i class="bi bi-journal-x" id="eliminarAnI" data-id="${
              doc.id
            }"></i></button>
            </td>
          </tr>`;
            tableAn.insertAdjacentHTML("afterbegin", newRow);
          }
        });
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
});
