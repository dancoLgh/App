// Función para cargar una plantilla desde la carpeta "pages"
function loadTemplate(templateName) {
  const contentDiv = document.getElementById("content");

  // Construye la ruta completa a la plantilla en la carpeta "pages"
  const templatePath = `views/${templateName}.html`;

  // Utiliza una solicitud AJAX para cargar la plantilla
  const xhr = new XMLHttpRequest();
  xhr.open("GET", templatePath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      contentDiv.innerHTML = xhr.responseText;
    } else if (xhr.status === 404) {
      console.log(hash);
      loadTemplate("home");
    }
  };
  xhr.send();
}

// Función para manejar las rutas

function handleRoute() {
  const hash = window.location.hash;
  const route = hash.split("/")[1];
  console.log(route);
  switch (route) {
    case "":
      loadTemplate("home");
      break;
    case "pacientes":
      loadTemplate("pacientes");
      break;
    case "fichamedica":
      loadTemplate("fichamedica");
      break;
    default:
      loadTemplate("home");
  }
}

// Manejar las rutas cuando la página se carga por primera vez
window.addEventListener("load", handleRoute);

// Manejar las rutas cuando cambia el fragmento de la URL
window.addEventListener("hashchange", handleRoute);
