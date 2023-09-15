import { firebaseConfig, db } from "./firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");

  // Escucha eventos en el elemento contenedor ("#content")
  contentDiv.addEventListener("click", function (event) {
    const target = event.target;

    // Verifica si el evento se originó en el botón con el ID "btnCrearPaciente"
    if (target && target.id === "btnCrearPaciente") {
      guardarPaciente();
    }
  });

  // Escucha eventos en el elemento contenedor ("#content")
  contentDiv.addEventListener("input", function (event) {
    const target = event.target;

    // Verifica si el evento se originó en el botón con el ID "FechaNacimientoPaciente"
    if (target && target.id === "FechaNacimientoPaciente") {
      calcularEdad();
    }
  });

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

        Swal.fire(
          "Paciente " + nombresPaciente.value + " creado exitosamente",
          "",
          "success"
        );
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
      });
  }

  function calcularEdad() {
    // Obtén el campo de fecha de nacimiento y el campo de edad por su ID
    var fechaNacimientoInput = document.getElementById(
      "FechaNacimientoPaciente"
    );
    var edadInput = document.getElementById("EdadPaciente");

    if (fechaNacimientoInput && edadInput) {
      // Obtiene la fecha de nacimiento seleccionada por el usuario
      var fechaNacimiento = new Date(fechaNacimientoInput.value);

      // Calcula la fecha actual
      var fechaActual = new Date();

      // Calcula la diferencia en años
      var edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();

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
});
