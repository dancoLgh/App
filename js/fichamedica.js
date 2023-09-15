import { firebaseConfig, db } from "./firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  let idPaciente = getIdPaciente();
  const contentDiv = document.getElementById("content");

  // Eventos click
  contentDiv.addEventListener("click", function (event) {
    const target = event.target;
  });

  // Cargar funciones cuando se cargo el div en HTML
  function onDivInserted(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Verifica si el nodo insertado tiene el ID correcto
        if (mutation.addedNodes[2].id === "fichamedica") {
          getPaciente(idPaciente);
          console.log(idPaciente);
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
    let titulo = document.getElementById("titulo");
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
          console.log(doc.data().antecedentesPaciente);
          console.log(doc.data().docCabeceraPaciente);
          docCabeceraPaciente.innerHTML = doc.data().docCabeceraPaciente;
          antecedentesPaciente.innerHTML = doc.data().antecedentesPaciente;
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
});
