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
  register: {
    template: "/templates/register.html",
    title: "Register | " + pageTitle,
    description: "Register Page",
  },
};

const urlLocationHandler = async () => {
  const isAuthenticated = localStorage.getItem("user_id") !== null;

  // Verifica se l'utente è autenticato
  if (!isAuthenticated && window.location.hash != "#register") {
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

  // Verifica che userList sia stato trovato nell'elemento corrente del template
  if (userList) {
    //API LIST USERS

    const users = [
      { id: 1, name: "Utente 1", type: "Normale", popularity: 10 },
      { id: 2, name: "Utente 2", type: "Premium", popularity: 20 },
      { id: 3, name: "Utente 3", type: "Normale", popularity: 5 },
      // Aggiungi altri utenti secondo le necessità
    ];

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

function registerAccount(event) {
  event.preventDefault(); // Previene il comportamento predefinito del form (ad es. ricaricare la pagina)
  const url = baseUrl + "api/register/admin";

  // Ottieni i valori degli input del form
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Username:", username);
  console.log("Email:", email);
  console.log("Password:", password);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: username,
      email: email,
      password: password,
      langKey: "en",
    }),
  })
    .then((response) => {
      if (!response.ok) {
        document.getElementById("username").value = "";
        document.getElementById("email").value = "";
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
      const errorReg = document.getElementById("errorReg");
      const userElement = document.createElement("div");

      userElement.innerHTML = `
    <p>Registrazione Fallita, riprova</p>
  `;

      errorReg.appendChild(userElement);
      console.error("Errore durante la chiamata API:", error);
    });
}

function registerPage() {
  window.location.hash = "#register";
}

function loginPage() {
  window.location.hash = "#login";
}
