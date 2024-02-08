const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Imposta la cartella per i file statici
app.use(express.static(path.join(__dirname, "public")));

// Gestisci tutte le richieste
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
