// Routing
const pageTitle = "Squealer Moderator Dashboard";
const baseUrl = "http://localhost:8000/";

const routes = {
  404: {
    template: "/templates/404.html",
    title: "404 | " + pageTitle,
    description: "Page not found",
  },
  "#/": {
    template: "/templates/index.html",
    title: "Home | " + pageTitle,
    description: "Home Page",
  },
  squeal: {
    template: "/templates/squeal.html",
    title: "Squeal | " + pageTitle,
    description: "Squeal page",
  },
  channels: {
    template: "/templates/channels.html",
    title: "Channels | " + pageTitle,
    description: "Channels page",
  },
  login: {
    template: "/templates/login.html",
    title: "Login | " + pageTitle,
    description: "Login Page",
  },
};

const urlLocationHandler = async () => {
  const isAuthenticated = true;
  //localStorage.getItem("user_id") !== null
  // Verifica se l'utente è autenticato
  if (!isAuthenticated) {
    // Se l'utente non è autenticato, reindirizza alla pagina di login
    window.location.hash = "#login";
  }

  var location = window.location.hash.replace("#", "");
  console.log(location);
  if (location.length == 0) {
    location = "#/";
  }

  const route = routes[location] || routes["404"];
  const html = await fetch(route.template).then((res) => res.text());
  document.getElementById("content").innerHTML = html;
  document.title = route.title;
  await loadAndManipulateTemplate();
};

window.addEventListener("hashchange", urlLocationHandler);
urlLocationHandler();

//!  HOME/USER PAGE
// Funzione per caricare e manipolare il template contenente userList
const loadAndManipulateTemplate = async () => {
  // Ottieni l'elemento userList dal template
  const userList = document.getElementById("userList");
  const squealList = document.getElementById("squealList");
  const channelList = document.getElementById("channelList");

  // Verifica che userList sia stato trovato nell'elemento corrente del template
  if (userList) {
    //API LIST USERS
    const users = listUsers();

    // Pulisci la lista utenti prima di aggiornarla
    userList.innerHTML = "";

    // Itera sugli utenti e crea un elemento HTML per ciascuno
    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");
      userElement.innerHTML = `
        <h2>${user.name}</h2>
        <p><strong>Tipo:</strong> ${user.type}</p>
        <p><strong>Popolarità:</strong> ${user.popularity}</p>
        <button onclick="blockUser(${user.id})">Blocca</button>
        <button onclick="unblockUser(${user.id})">Riabilita</button>
        <button onclick="increaseCharacters(${user.id})">Aumenta Caratteri</button>
      `;
      userList.appendChild(userElement);
    });
  }
};

const loadTemplate = async () => {
  await loadAndManipulateTemplate();
};

// Esegui la funzione all'avvio per la prima pagina
window.onload = function () {
  loadTemplate();
};

// Funzione per bloccare un utente
function blockUser(userId) {
  // Esegui la richiesta API per bloccare l'utente con l'ID specificato
  // Sostituire questa chiamata con la chiamata reale alla tua API
  console.log(`Utente ${userId} bloccato`);
}

// Funzione per riabilitare un utente
function unblockUser(userId) {
  // Esegui la richiesta API per riabilitare l'utente con l'ID specificato
  // Sostituire questa chiamata con la chiamata reale alla tua API
  console.log(`Utente ${userId} riabilitato`);
}

// Funzione per aumentare i caratteri di un utente
function increaseCharacters(userId) {
  // Esegui la richiesta API per aumentare i caratteri per l'utente con l'ID specificato
  // Sostituire questa chiamata con la chiamata reale alla tua API
  console.log(`Caratteri aumentati per utente ${userId}`);
}

function listUsers() {
  const url = baseUrl + "api/account/list-users";
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("id_token"),
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Errore durante la chiamata API:", error);
    });
}

function getAuthenticationToken(event) {
  event.preventDefault(); // Previene il comportamento predefinito del form (ad es. ricaricare la pagina)
  const url = baseUrl + "api/authenticate/admin";

  // Ottieni i valori degli input del form
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Username:", username);
  console.log("Password:", password);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
      rememberMe: true,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
      } else {
        window.location.hash = "#/";
      }
      //reindirizza verso home
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("id_token", data.id_token);
    })
    .catch((error) => {
      const errorLogin = document.getElementById("errorLogin");
      const userElement = document.createElement("div");

      userElement.innerHTML = `
    <p>Login Fallito, riprova</p>
  `;

      errorLogin.appendChild(userElement);
      console.error("Errore durante la chiamata API:", error);
    });
}
