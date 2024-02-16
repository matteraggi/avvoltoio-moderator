//! ROUTING E AUTHENTICATION
const pageTitle = "Squealer Moderator Dashboard";
const baseUrl = "http://localhost:8000/";
const size = 6;
var userAlphabeticalOrder = 0;
var userPopularityOrder = 0;
var userDateOrder = 1;

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

      if (user?.img_content_type != null) {
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
        }')">⬆️ / ⬇️ Caratteri</button>
        </div>
      </div>
      `;
      userList.appendChild(userElement);
    });
    //!  SQUEAL PAGE
  } else if (squealList) {
    const squeals = await listSqueals();
    console.log(squeals);

    // Pulisci la lista utenti prima di aggiornarla
    squealList.innerHTML = "";

    // Itera sugli utenti e crea un elemento HTML per ciascuno
    squeals.forEach((squeal) => {
      const squealElement = document.createElement("div");
      squealElement.classList.add("squeal");

      const squealDate = TimestampToDate(squeal?.squeal.timestamp);

      squealElement.innerHTML = `
      <div class="list-element">
      <div class="el1">

        <h2 class="list-header">${squeal?.userName}</h2>
        <p class="list-text"> 
        ${
          squeal.squeal && squeal.squeal.body && squeal.squeal.body.length > 40
            ? `${squeal.squeal.body.substring(0, 40)}...`
            : squeal.squeal.body
        }</p>
        ${squeal && squeal.geoLoc ? `<p class="list-tag">GEOLOC</p>` : ``}
        ${
          squeal.squeal && squeal.squeal.img && squeal.squeal.img.length > 0
            ? `<p class="list-tag">IMAGE</p>`
            : ``
        }
        <p class="list-text"> - ${squealDate}</p>
        </div>

        <div class="el1">
        <div class="list-destinations" id="${squeal?.squeal._id}">
        ${squeal.squeal.destination
          .map(
            (destination) =>
              `<p class="list-dest">${destination.destination}</p>`
          )
          .join("")}
          </div>
        <p class="list-text">${squeal.positive}</p>
        <img src="/like.svg" alt="SVG Image" class="list-emote">
        <p class="list-text">${squeal.negative}</p>
        <img src="/dislike.svg" alt="SVG Image" class="list-emote">
        
        </div>
      </div>
      `;
      squealList.appendChild(squealElement);
      const destinationElement = document.getElementById(squeal?.squeal._id);

      // Aggiungi un gestore di eventi per l'evento click
      destinationElement.addEventListener("click", function () {
        // Chiama la funzione openModal passando il valore appropriato
        openModal(squeal.squeal);
      });
    });
  }
  //!  CHANNEL PAGE
  else if (channelList) {
  }

  const loadMoreButtonUsers = document.getElementById("loadMoreUsers");
  const loadMoreButtonSqueals = document.getElementById("loadMoreSqueals");
  const loadMoreButtonChannels = document.getElementById("loadMoreChannels");
  if (loadMoreButtonUsers) {
    loadMoreButtonUsers.addEventListener("click", async function () {
      try {
        await loadMoreUsers();
      } catch (error) {
        console.error("Errore durante il caricamento degli utenti:", error);
      }
    });
  } else if (loadMoreButtonSqueals) {
    loadMoreButtonSqueals.addEventListener("click", async function () {
      try {
        await loadMoreSqueals();
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
  if (users.length == 0) {
    document.getElementById("loadMoreUsers").style.display = "none";
  }

  const userList = document.getElementById("userList");
  if (userList) {
    var url = "";
    // Itera sugli utenti e crea un elemento HTML per ciascuno
    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");

      if (user?.img_content_type != null) {
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
        }')">⬆️ / ⬇️ Caratteri</button>
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
    if (isNaN(numCharactersInt)) {
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

//! SQUEAL SECTION

const listSqueals = async () => {
  console.log("listSqueal");
  const url =
    baseUrl +
    `api/squeal-list/filtered/?page=${pageNum}&size=${size}&byTimestamp${userDateOrder}`;
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

const loadMoreSqueals = async () => {
  console.log("loadMoreSqueals");
  pageNum++; // Incrementa il numero di pagina corrente
  const squeals = await listSqueals();
  if (squeals.length == 0) {
    document.getElementById("loadMoreSqueals").style.display = "none";
  }

  const squealList = document.getElementById("squealList");
  if (squealList) {
    // Itera sugli utenti e crea un elemento HTML per ciascuno
    squeals.forEach((squeal) => {
      const squealElement = document.createElement("div");
      squealElement.classList.add("squeal");

      const squealDate = TimestampToDate(squeal?.squeal.timestamp);

      squealElement.innerHTML = `
      <div class="list-element" data-user-login="${squeal?.squeal.timestamp}">
      <div class="el1">

        <h2 class="list-header">${squeal?.userName}</h2>
        <p class="list-text"> 
        ${
          squeal.squeal && squeal.squeal.body && squeal.squeal.body.length > 40
            ? `${squeal.squeal.body.substring(0, 40)}...`
            : squeal.squeal.body
        }</p>
        ${squeal && squeal.geoLoc ? `<p class="list-tag">GEOLOC</p>` : ``}
        ${
          squeal.squeal && squeal.squeal.img && squeal.squeal.img.length > 0
            ? `<p class="list-tag">IMAGE</p>`
            : ``
        }
        <p class="list-text"> - ${squealDate}</p>
        </div>


        <div class="el1">
        ${squeal.squeal.destination
          .map(
            (destination) =>
              `<p class="list-dest">${destination.destination}</p>`
          )
          .join("")}
        <p class="list-text">${squeal.positive}</p>
        <img src="/like.svg" alt="SVG Image" class="list-emote">
        <p class="list-text">${squeal.negative}</p>
        <img src="/dislike.svg" alt="SVG Image" class="list-emote">
        
        </div>
      </div>
              `;
      squealList.appendChild(squealElement); // Aggiungi il nuovo elemento utente alla lista utenti
    });
  }
};

const TimestampToDate = (timestamp) => {
  var date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Gennaio è 0, quindi aggiungiamo 1
  const year = date.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

// Funzione per aprire un modal
const openModal = (dest) => {
  console.log(dest);
  // Seleziona l'elemento del modal
  const modalBox = document.getElementById("modal");
  const modal = document.getElementById("modal-content");
  if (modal) {
    modal.innerHTML = "";
    if (dest.destination.length > 1) {
      modal.innerHTML = `
      <div class="dest-names">
  ${dest.destination
    .map(
      (destination) =>
        `<p class="edit-dest-elem">${destination.destination}</p>`
    )
    .join("")}
    </div>
    <div class="dest-names">
    <input type="text" id="newDestination" placeholder="Aggiungi una nuova destinazione" class="list-input-dest"/>
    <button class="list-button color-purple" id="${
      dest.timestamp
    }">Aggiungi Destinazione</button></div>
  `;
    } else {
      modal.innerHTML = `
      <div class="dest-names">
    <p class="edit-dest-elem">${destination.destination}</p>
    </div>
    <div class="dest-names">
    <input type="text" id="newDestination" placeholder="Aggiungi una nuova destinazione" class="list-input-dest"/>
    <button class="list-button color-purple" id="${dest.timestamp}">Aggiungi Destinazione</button></div>
    `;
    }
    const addDestinationButton = document.getElementById(dest.timestamp);
    addDestinationButton.addEventListener("click", async function () {
      try {
        const newDestination = document.getElementById("newDestination").value;
        if (newDestination.trim() === "") {
          console.error("Il campo di input testuale è vuoto");
          return;
        }
        dest.destination.push({ destination: newDestination });
        await addLoc(dest);
      } catch (error) {
        console.error("Errore durante il caricamento degli utenti:", error);
      }
    });
  }

  // Mostra il modal
  modalBox.style.display = "block";

  // Aggiungi un gestore di eventi per chiudere il modal quando si clicca al di fuori del contenuto del modal
  window.onclick = (event) => {
    if (event.target === modalBox) {
      closeModal();
    }
  };
};

// Funzione per chiudere il modal
const closeModal = () => {
  // Seleziona l'elemento del modal
  const modal = document.getElementById("modal");

  // Nascondi il modal
  modal.style.display = "none";

  // Rimuovi il gestore di eventi per il click al di fuori del modal
  window.onclick = null;
};

const addLoc = async (squeal) => {
  console.log(squeal);
  try {
    const response = await fetch(baseUrl + `api/squeals/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token"),
      },
      body: JSON.stringify({
        squeal: {
          _id: squeal._id,
          body: squeal.body,
          destination: squeal.destination,
          img: squeal.img,
          img_content_type: squeal.img_content_type,
          img_name: squeal.img_name,
          video_content_type: squeal.video_content_type,
          video_name: squeal.video_name,
          n_characters: squeal.n_characters,
          squeal_id_response: squeal.squeal_id_response,
        },
        geoLoc: null,
      }),
    });
    if (response.ok) {
      console.log(`Destinazione aggiunta con successo`);
    } else {
      console.error("Errore durante l'aggiunta della destinazione");
    }
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
  }
};
