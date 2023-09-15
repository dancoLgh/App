import { firebaseConfig, db } from "./firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  let idPaciente = "";
  const contentDiv = document.getElementById("content");

  // Evento click
  contentDiv.addEventListener("click", function (event) {
    const target = event.target;
    //Cambiar titulo de modal
    if (target && target.id === "btnAbrirModal") {
      document.getElementById("crearPacienteModalH1").innerHTML =
        "Registro de Paciente";
      document.getElementById("btnCrearPaciente").innerHTML = "Crear Paciente";
      limpiarCamposPaciente();
    }
    if (
      target &&
      (target.id === "editarPacienteI" || target.id === "editarPaciente")
    ) {
      document.getElementById("crearPacienteModalH1").innerHTML =
        "Editar de Paciente";
      document.getElementById("btnCrearPaciente").innerHTML = "Guardar Edicion";

      cargarDatosEdit(target.getAttribute("data-id"));
      idPaciente = target.getAttribute("data-id");
    }

    // Verifica si el evento se originó en el botón con el ID "btnCrearPaciente"
    if (target && target.id === "btnCrearPaciente") {
      if (
        document.getElementById("btnCrearPaciente").innerHTML ===
        "Guardar Edicion"
      ) {
        editarPaciente(idPaciente);
      }
      if (
        document.getElementById("btnCrearPaciente").innerHTML ===
        "Crear Paciente"
      ) {
        guardarPaciente();
      }
    }

    // Verifica si el evento se originó en el botón con el ID "eliminarPaciente"
    if (
      target &&
      (target.id === "eliminarPaciente" || target.id === "eliminarPacienteI")
    ) {
      eliminarPaciente(target.getAttribute("data-id"));
    }
  });

  //Agrega la edad automaticamnte en el input
  contentDiv.addEventListener("input", function (event) {
    const target = event.target;

    // Verifica si el evento se originó en el botón con el ID "FechaNacimientoPaciente"
    if (target && target.id === "FechaNacimientoPaciente") {
      calcularEdad();
    }
  });

  // Cargar funciones cuando se cargo el div en HTML
  function onDivInserted(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Verifica si el nodo insertado tiene el ID correcto
        if (mutation.addedNodes[2].id === "pacientes") {
          getPacientes();
          buscador();
        }
      }
    }
  }
  // Crea un observador de mutación para el elemento contenedor ("#content")
  const observer = new MutationObserver(onDivInserted);

  // Configura el observador para observar cambios en los nodos hijos y sus atributos
  observer.observe(contentDiv, { childList: true });

  //Guardar pacientes en firestore
  function guardarPaciente() {
    let nombresPaciente = document.getElementById("nombresPaciente");
    let apellidosPaciente = document.getElementById("apellidosPaciente");
    let FechaNacimientoPaciente = document.getElementById(
      "FechaNacimientoPaciente"
    );
    let EdadPaciente = document.getElementById("EdadPaciente");
    let numDocumetoPaciente = document.getElementById("numDocumetoPaciente");
    let celularPaciente = document.getElementById("celularPaciente");
    let celularTutoPaciente = document.getElementById("celularTutoPaciente");
    let docCabeceraPaciente = document.getElementById("docCabeceraPaciente");
    let antecedentesPaciente = document.getElementById("antecedentesPaciente");

    db.collection("pacientes")
      .add({
        nombresPaciente: nombresPaciente.value,
        apellidosPaciente: apellidosPaciente.value,
        FechaNacimientoPaciente: FechaNacimientoPaciente.value,
        EdadPaciente: EdadPaciente.value,
        numDocumetoPaciente: numDocumetoPaciente.value,
        celularPaciente: celularPaciente.value,
        celularTutoPaciente: celularTutoPaciente.value,
        docCabeceraPaciente: docCabeceraPaciente.value,
        antecedentesPaciente: antecedentesPaciente.value,
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
          title: "Paciente creado Exitosamente! 😊",
        });

        nombresPaciente.value = "";
        apellidosPaciente.value = "";
        FechaNacimientoPaciente.value = "";
        EdadPaciente.value = "";
        numDocumetoPaciente.value = "";
        celularPaciente.value = "";
        celularTutoPaciente.value = "";
        docCabeceraPaciente.value = "";
        antecedentesPaciente.value = "";
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
          title: "Error al crar el paciente! 😥" + error,
        });
      });
  }
  // Leer pacientes de firestore
  function getPacientes() {
    let tablePacientes = document.getElementById("tablePacientes");
    db.collection("pacientes").onSnapshot((querySnapshot) => {
      tablePacientes.innerHTML = "";
      querySnapshot.forEach((doc) => {
        tablePacientes.innerHTML += `
          <tr>
            <td>${doc.data().nombresPaciente} ${
          doc.data().apellidosPaciente
        }</td>
            <td>${doc.data().numDocumetoPaciente}</td>
            <td>${doc.data().EdadPaciente}</td>
            <td>
                <button type="button" class="btn btn-success btn-sm" id="verPaciente"><i class="bi bi-eye"></i></button>
                <button data-bs-toggle="modal" data-bs-target="#crearPacienteModal" type="button" class="btn btn-warning btn-sm" id="editarPaciente" data-id="${
                  doc.id
                }"><i class="bi bi-pencil-square" data-bs-toggle="modal" data-bs-target="#crearPacienteModal" id="editarPacienteI" data-id="${
          doc.id
        }" ></i></button>
                <button type="button" class="btn btn-danger  btn-sm" id="eliminarPaciente" data-id="${
                  doc.id
                }"><i class="bi bi-person-x" id="eliminarPacienteI" data-id="${
          doc.id
        }"></i></button>
            </td>
          </tr>`;
      });
    });
  }
  //Eliminar Paciente
  function eliminarPaciente(id) {
    Swal.fire({
      title: "Estas seguro de elimianar al paciente?",
      text: "No se puede revertir esta accion",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar!",
    }).then((result) => {
      if (result.isConfirmed) {
        db.collection("pacientes")
          .doc(id)
          .delete()
          .then(() => {
            console.log("Document successfully deleted!");
            Swal.fire("Eliminado!", "Paciente Eliminado con exito!", "success");
          })
          .catch((error) => {
            Swal.fire("ERRO!", "Paciente NO Eliminado!", "error");
          });
      }
    });
  }
  //Editar Pacientes
  function editarPaciente(id) {
    let nombresPaciente = document.getElementById("nombresPaciente");
    let apellidosPaciente = document.getElementById("apellidosPaciente");
    let FechaNacimientoPaciente = document.getElementById(
      "FechaNacimientoPaciente"
    );
    let EdadPaciente = document.getElementById("EdadPaciente");
    let numDocumetoPaciente = document.getElementById("numDocumetoPaciente");
    let celularPaciente = document.getElementById("celularPaciente");
    let celularTutoPaciente = document.getElementById("celularTutoPaciente");
    let docCabeceraPaciente = document.getElementById("docCabeceraPaciente");
    let antecedentesPaciente = document.getElementById("antecedentesPaciente");

    var pacienteRef = db.collection("pacientes").doc(id);

    return pacienteRef
      .update({
        nombresPaciente: nombresPaciente.value,
        apellidosPaciente: apellidosPaciente.value,
        FechaNacimientoPaciente: FechaNacimientoPaciente.value,
        EdadPaciente: EdadPaciente.value,
        numDocumetoPaciente: numDocumetoPaciente.value,
        celularPaciente: celularPaciente.value,
        celularTutoPaciente: celularTutoPaciente.value,
        docCabeceraPaciente: docCabeceraPaciente.value,
        antecedentesPaciente: antecedentesPaciente.value,
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
          title: "Paciente editado Exitosamente! 😊",
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
          title: "Error al editar el paciente! 😥" + error,
        });
      });
  }

  // Calcular la eadad del paciente
  function calcularEdad() {
    // Obtén el campo de fecha de nacimiento y el campo de edad por su ID
    let fechaNacimientoInput = document.getElementById(
      "FechaNacimientoPaciente"
    );
    let edadInput = document.getElementById("EdadPaciente");

    if (fechaNacimientoInput && edadInput) {
      // Obtiene la fecha de nacimiento seleccionada por el usuario
      let fechaNacimiento = new Date(fechaNacimientoInput.value);

      // Calcula la fecha actual
      let fechaActual = new Date();

      // Calcula la diferencia en años
      let edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();

      // Verifica si aún no ha pasado el cumpleaños de este año
      if (
        fechaNacimiento.getMonth() > fechaActual.getMonth() ||
        (fechaNacimiento.getMonth() === fechaActual.getMonth() &&
          fechaNacimiento.getDate() > fechaActual.getDate())
      ) {
        edad--;
      }

      // Actualiza el campo de edad con la edad calculada
      edadInput.value = edad;
    }
  }
  //cargar datos en dom para editarlos
  function cargarDatosEdit(id) {
    let nombresPaciente = document.getElementById("nombresPaciente");
    let apellidosPaciente = document.getElementById("apellidosPaciente");
    let FechaNacimientoPaciente = document.getElementById(
      "FechaNacimientoPaciente"
    );
    let EdadPaciente = document.getElementById("EdadPaciente");
    let numDocumetoPaciente = document.getElementById("numDocumetoPaciente");
    let celularPaciente = document.getElementById("celularPaciente");
    let celularTutoPaciente = document.getElementById("celularTutoPaciente");
    let docCabeceraPaciente = document.getElementById("docCabeceraPaciente");
    let antecedentesPaciente = document.getElementById("antecedentesPaciente");
    let docRef = db.collection("pacientes").doc(id);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          nombresPaciente.value = doc.data().nombresPaciente;
          apellidosPaciente.value = doc.data().apellidosPaciente;
          FechaNacimientoPaciente.value = doc.data().FechaNacimientoPaciente;
          EdadPaciente.value = doc.data().EdadPaciente;
          numDocumetoPaciente.value = doc.data().numDocumetoPaciente;
          celularPaciente.value = doc.data().celularPaciente;
          celularTutoPaciente.value = doc.data().celularTutoPaciente;
          docCabeceraPaciente.value = doc.data().docCabeceraPaciente;
          antecedentesPaciente.value = doc.data().antecedentesPaciente;
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
  //Buscar en table
  function buscador() {
    const tabla = document.getElementById("tablePacientes");
    const inputBusqueda = document.getElementById("buscar");

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

  function limpiarCamposPaciente() {
    document.getElementById("nombresPaciente").value = "";
    document.getElementById("apellidosPaciente").value = "";
    document.getElementById("FechaNacimientoPaciente").value = "";
    document.getElementById("EdadPaciente").value = "";
    document.getElementById("numDocumetoPaciente").value = "";
    document.getElementById("celularPaciente").value = "";
    document.getElementById("celularTutoPaciente").value = "";
    document.getElementById(("docCabeceraPaciente".value = ""));
    document.getElementById("antecedentesPaciente").value = "";
  }
});
