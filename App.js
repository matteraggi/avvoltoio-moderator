//! ROUTING E AUTHENTICATION
const pageTitle = "Squealer Moderator Dashboard";
const baseUrl = "http://localhost:8000/";
const size = 5;

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
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
      //reindirizza verso home
      return response.json();
    })
    .then((data) => {
      if (data.id_token !== undefined && data.id_token !== null) {
        localStorage.setItem("id_token", data.id_token);
        window.location.hash = "#squeal";
      }
    })
    .catch((error) => {
      console.log(error);
      const errorLogin = document.getElementById("errorLogin");
      const userElement = document.createElement("div");

      userElement.innerHTML = `
    <p>Login Fallito, riprova</p>
  `;

      errorLogin.appendChild(userElement);
      console.error("Errore durante la chiamata API:", error);
    });
}

const urlLocationHandler = async () => {
  const isAuthenticated = localStorage.getItem("id_token") !== null;
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

// Funzione per caricare e manipolare il template contenente userList
const loadAndManipulateTemplate = async () => {
  pageNum = 0;
  // Ottieni l'elemento userList dal template
  const userList = document.getElementById("userList");
  const squealList = document.getElementById("squealList");
  const channelList = document.getElementById("channelList");

  // Verifica che userList sia stato trovato nell'elemento corrente del template
  //!  HOME/USER PAGE
  if (userList) {
    //API LIST USERS
    const users = await listUsers();
    console.log(users);

    // Pulisci la lista utenti prima di aggiornarla
    userList.innerHTML = "";

    // Itera sugli utenti e crea un elemento HTML per ciascuno
    var url = "";
    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");

      if (user?.img[0] != null) {
        url = `data: ${user.img_content_type}  ;base64, ${user.img}`;
      }
      userElement.innerHTML = `
      <div class="list-element" data-user-login="${user?.login}">
      <div class="el1">
      ${
        user.img_content_type
          ? `<img class="list-image" src="${url}" alt="Avatar" />`
          : `<img class="list-image" src="/favicon.ico" alt="Avatar" />`
      }
        <h2 class="list-header">${user?.login}</h2>
        <p class="list-text"><strong>Mail:</strong> ${user?.email}</p>
        <p class="list-text"><strong>Auth:</strong> ${user?.authorities}</p>
        </div>
        <div>
        ${
          user.activated
            ? `<button class="list-button color-red" onclick="blockUser('${user?.login}', false)">Blocca</button>`
            : `<button class="list-button color-green" onclick="blockUser('${user?.login}', true)">Sblocca</button>`
        }
        <input type="number" id="numCharacters${
          user?.login
        }" placeholder="Num. caratteri" class="list-input"/>
        <button class="list-button color-purple" onclick="changeCharacters('${
          user?.login
        }')">Cambia Caratteri</button>
        </div>
      </div>
      `;
      userList.appendChild(userElement);
    });
    //!  SQUEAL PAGE
  } else if (squealList) {
  }
  //!  CHANNEL PAGE
  else if (channelList) {
  }

  const loadMoreButton = document.getElementById("loadMoreUsers");
  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", async function () {
      try {
        await loadMoreUsers();
      } catch (error) {
        console.error("Errore durante il caricamento degli utenti:", error);
      }
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

//! USER SECTION

var pageNum = 0;
const listUsers = async () => {
  console.log("listUsers");
  const url = baseUrl + `api/account/list-users/?page=${pageNum}&size=${size}`;
  console.log(url);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token"),
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
  }
};

const loadMoreUsers = async () => {
  console.log("loadMoreUsers");
  pageNum++; // Incrementa il numero di pagina corrente
  const users = await listUsers();

  const userList = document.getElementById("userList");
  if (userList) {
    var url = "";
    // Itera sugli utenti e crea un elemento HTML per ciascuno
    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");

      if (user?.img[0] != null) {
        url = `data: ${user.img_content_type}  ;base64, ${user.img}`;
      }

      userElement.innerHTML = `
        <div class="list-element" data-user-login="${user?.login}">
        <div class="el1">
          ${
            user.img_content_type
              ? `<img class="list-image" src="${url}" alt="Avatar" />`
              : `<img class="list-image" src="/favicon.ico" alt="Avatar" />`
          }
          <h2 class="list-header">${user?.login}</h2>
          <p class="list-text"><strong>Mail:</strong> ${user?.email}</p>
          <p class="list-text"><strong>Auth:</strong> ${user?.authorities}</p>
          </div>
          <div>
          ${
            user.activated
              ? `<button  class="list-button color-red" onclick="blockUser('${user?.login}', false)">Blocca</button>`
              : `<button class="list-button color-green" onclick="blockUser('${user?.login}', true)">Sblocca</button>`
          }

        <input type="number" id="numCharacters${
          user?.login
        }" placeholder="Num. caratteri" class="list-input" />
        <button class="list-button color-purple" onclick="changeCharacters('${
          user?.login
        }')">Cambia Caratteri</button>
          </div>
        </div>
              `;
      userList.appendChild(userElement); // Aggiungi il nuovo elemento utente alla lista utenti
    });
  }
};

// Funzione per bloccare un utente
async function blockUser(userLogin, block) {
  try {
    const response = await fetch(
      baseUrl + `api/users/block/?username=${userLogin}&block=${block}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("id_token"),
        },
      }
    );
    if (response.ok) {
      const userElement = document.querySelector(
        `[data-user-login="${userLogin}"]`
      );
      const blockButton = userElement.querySelector(".list-button");

      if (block) {
        console.log(`Utente ${userLogin} sbloccato con successo`);
        blockButton.textContent = "Blocca";
        blockButton.classList.remove("color-green");
        blockButton.classList.add("color-red");
        blockButton.setAttribute("onclick", `blockUser('${userLogin}', false)`);
      } else {
        console.log(`Utente ${userLogin} bloccato con successo`);
        blockButton.textContent = "Sblocca";
        blockButton.classList.remove("color-red");
        blockButton.classList.add("color-green");
        blockButton.setAttribute("onclick", `blockUser('${userLogin}', true)`);
      }
    } else {
      console.error("Errore durante il blocco dell'utente");
    }
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
  }
}

// Funzione per cambiare caratteri di un utente
async function changeCharacters(userLogin) {
  try {
    // Recupera il valore del campo di input testuale
    const numCharactersInput = document.getElementById(
      `numCharacters${userLogin}`
    );
    const numCharacters = numCharactersInput.value;

    // Verifica se il valore è valido (es. non vuoto, è un numero, ecc.)
    if (numCharacters.trim() === "") {
      console.error("Il campo di input testuale è vuoto");
      return;
    }

    // Converte il valore in un numero intero
    const numCharactersInt = parseInt(numCharacters);

    // Verifica se il numero è valido (es. è un numero intero positivo)
    if (isNaN(numCharactersInt) || numCharactersInt <= 0) {
      console.error("Il numero di caratteri specificato non è valido");
      return;
    }

    // Continua con la tua logica per cambiare i caratteri utilizzando il valore recuperato
    const now = new Date();
    const thirtyOneDaysInMilliseconds = 31 * 24 * 60 * 60 * 1000;
    const futureDate = new Date(now.getTime() + thirtyOneDaysInMilliseconds);
    const futureTimestamp = futureDate.getTime();

    const response = await fetch(baseUrl + `api/account/admin-extra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token"),
      },
      body: JSON.stringify({
        admin_extra: {
          n_characters: numCharactersInt,
          user_id: userLogin,
          timestamp: futureTimestamp,
        },
      }),
    });
    if (response.ok) {
      console.log(
        `Caratteri modificati per l'utente ${userLogin}, ${numCharactersInt} caratteri fino al ${futureDate}`
      );
      // Aggiorna la lista degli utenti dopo aver cambiato i caratteri
      await loadAndManipulateTemplate();
    } else {
      console.error("Errore durante il cambio caratteri dell'utente");
    }
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
  }
}
