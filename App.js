// Routing
const pageTitle = "Squealer Moderator Dashboard";

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
};

const urlLocationHandler = async () => {
  var location = window.location.hash.replace("#", "");
  if (location.length == 0) {
    location = "#/";
  }

  const route = routes[location] || routes["404"];
  const html = await fetch(route.template).then((res) => res.text());
  document.getElementById("content").innerHTML = html;
  document.title = route.title;
};

window.addEventListener("hashchange", urlLocationHandler);

urlLocationHandler();
// Funzione per caricare e manipolare il template contenente userList
const loadAndManipulateTemplate = async () => {
  // Ottieni l'elemento userList dal template
  const userList = document.getElementById("userList");

  // Verifica che userList sia stato trovato nell'elemento corrente del template
  if (userList) {
    // Esegui le operazioni di manipolazione dell'elemento userList
    // Esempio: Popola la lista degli utenti
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
  } else {
    console.error("Elemento userList non trovato nel template corrente.");
  }
};

// Listener per il cambio dell'URL tramite routing
window.addEventListener("hashchange", async () => {
  // Carica e manipola il template corrente
  await loadAndManipulateTemplate();
});

// Esegui la funzione all'avvio per la prima pagina
window.onload = async () => {
  // Carica e manipola il template iniziale
  await loadAndManipulateTemplate();
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
