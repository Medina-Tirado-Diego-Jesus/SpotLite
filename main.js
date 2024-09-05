const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const express = require("express");
const open = async (url) => (await import("open")).default(url);

const clientId = "dd0ae322b97a4785bcb6766119b9c27a"; // Sustituye por tu Client ID
const clientSecret = "dd8db6ba27a24b37baf1fe87d6a43935"; // Sustituye por tu Client Secret
const redirectUri = "http://localhost:8888/callback";

let mainWindow;
let accessToken = "";
let refreshToken = "";
let isPlaying = false;

// 1. Funciones relacionadas con la autenticación y manejo de tokens
// Configuración del servidor Express para manejar la redirección de Spotify
const server = express();

server.get("/callback", (req, res) => {
  const code = req.query.code || null;
  if (code) {
    requestAccessToken(code);
    res.send("Autenticación completada. Puedes cerrar esta ventana.");
  } else {
    res.send("Error en la autenticación.");
  }
});

server.listen(8888, () => {
  console.log("Servidor escuchando en http://localhost:8888");
});

// Función para autenticar con Spotify
function authenticateWithSpotify() {
  const scopes =
    "user-read-playback-state user-modify-playback-state user-read-currently-playing";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  open(authUrl); // Abre el navegador para que el usuario otorgue permisos
}

// Función para solicitar el token de acceso con el código de autorización
function requestAccessToken(code) {
  const tokenOptions = {
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`,
  };

  axios(tokenOptions)
    .then((response) => {
      accessToken = response.data.access_token; // Asegúrate de que el token se guarda correctamente
      refreshToken = response.data.refresh_token;
      console.log("Token de acceso obtenido:", accessToken);
      getCurrentlyPlaying(); // Llama a esta función una vez obtienes el token
    })
    .catch((error) => {
      console.error("Error al obtener el token de acceso:", error);
    });
}

// Función para actualizar el token de acceso cuando expire
function refreshAccessToken() {
  const tokenOptions = {
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  };

  axios(tokenOptions)
    .then((response) => {
      accessToken = response.data.access_token;
      console.log("Token de acceso actualizado:", accessToken);
    })
    .catch((error) => {
      console.error("Error al actualizar el token de acceso:", error);
    });
}

// Función centralizada para realizar solicitudes a la API de Spotify
function spotifyRequest(method, endpoint, data = null) {
  if (!accessToken) {
    console.log("El token de acceso no está disponible todavía.");
    return Promise.reject("Token de acceso no disponible."); // Asegúrate de devolver una promesa rechazada
  }

  const options = {
    method: method,
    url: `https://api.spotify.com/v1/me/player${endpoint}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  if (data && method !== "GET") {
    options.data = data;
  }

  return axios(options)
    .then((response) => response.data)
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        return refreshAccessToken().then(() =>
          spotifyRequest(method, endpoint, data)
        ); // Actualiza el token y reintenta la solicitud
      } else {
        console.error(`Error al realizar la solicitud a ${endpoint}:`, error);
        return Promise.reject(error); // Devolver una promesa rechazada en caso de error
      }
    });
}

// 2. Funciones para obtener información de reproducción y controlar Spotify

function getCurrentlyPlaying() {
  spotifyRequest("GET", "/currently-playing").then((response) => {
    if (response && response.item) {
      const song = response.item;
      const artist = song.artists[0].name;
      const title = song.name;
      const albumCover = song.album.images[0].url;
      const progressMs = response.progress_ms;
      const durationMs = song.duration_ms;

      mainWindow.webContents.send("currently-playing", {
        title,
        artist,
        albumCover,
        progressMs,
        durationMs,
      });
    }
  });
}

// Función para obtener el estado de reproducción
function getPlaybackState() {
  spotifyRequest("GET", "")
    .then((response) => {
      if (response) {
        isPlaying = response.is_playing;
        mainWindow.webContents.send("playback-status", isPlaying);
      }
    })
    .catch((error) => {
      console.error("Error al obtener el estado de reproducción:", error);
    });
}

// Función para reproducir o pausar la canción
function togglePlayPause() {
  const endpoint = isPlaying ? "/pause" : "/play";
  spotifyRequest("PUT", endpoint).then(() => {
    isPlaying = !isPlaying;
    mainWindow.webContents.send("playback-status", isPlaying);
  });
}

// Función para activar/desactivar el modo aleatorio
function toggleShuffle(state) {
  const shuffleState = state ? "true" : "false"; // Pasar "true" o "false" dependiendo del estado

  spotifyRequest("PUT", `/shuffle?state=${shuffleState}`)
    .then(() => {
      console.log(`Modo aleatorio ${state ? "activado" : "desactivado"}`);
      mainWindow.webContents.send("shuffle-status", state); // Enviar el nuevo estado al frontend
    })
    .catch((error) => {
      console.error("Error al cambiar el estado del modo aleatorio:", error);
    });
}

// Función para cambiar de canción
function nextTrack() {
  spotifyRequest("POST", "/next").then(() => getCurrentlyPlaying());
}

function previousTrack() {
  spotifyRequest("POST", "/previous").then(() => getCurrentlyPlaying());
}

ipcMain.on("seek-track", (event, positionMs) => {
  spotifyRequest("PUT", `/seek?position_ms=${positionMs}`).then(() => {
    console.log("Posición de la canción cambiada correctamente");
  });
});

// 3. Configuración de la ventana principal de Electron
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile("index.html");
}

// Iniciar la aplicación Electron
app.whenReady().then(() => {
  createWindow();
  authenticateWithSpotify();

  // Actualizar el estado de la reproducción y la barra de progreso cada segundo
  setInterval(() => {
    getCurrentlyPlaying();
  }, 1000);

  ipcMain.on("request-playback-status", () => {
    getPlaybackState();
  });

  ipcMain.on("toggle-play-pause", () => {
    togglePlayPause();
  });

  // Escuchar el evento de "toggle-shuffle" desde el frontend
  ipcMain.on("toggle-shuffle", (event, state) => {
    toggleShuffle(state); // Llamar a la función que cambia el modo aleatorio
  });

  ipcMain.on("previous-track", () => {
    previousTrack();
  });

  ipcMain.on("next-track", () => {
    nextTrack();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
