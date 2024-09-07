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
const server = express();

server.get("/callback", (req, res) => {
  const code = req.query.code || null;
  if (code) {
    requestAccessToken(code)
      .then(() => {
        res.send("Autenticación completada. Puedes cerrar esta ventana.");
      })
      .catch((error) => {
        res.send("Error en la autenticación.");
        console.error(error);
      });
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
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true`;
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

  return axios(tokenOptions)
    .then((response) => {
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token; // Guardamos el refresh token
      console.log("Token de acceso obtenido:", accessToken);
      console.log("Refresh token obtenido:", refreshToken);
      getCurrentlyPlaying();
    })
    .catch((error) => {
      console.error("Error al obtener el token de acceso:", error);
    });
}

// Función para actualizar el token de acceso cuando expire
function refreshAccessToken() {
  console.log("Actualizando token de acceso...");

  if (!refreshToken) {
    console.error("No se ha proporcionado un refresh token");
    return Promise.reject(new Error("No refresh token available"));
  }

  const authOptions = {
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

  return axios(authOptions)
    .then((response) => {
      accessToken = response.data.access_token;
      console.log("Token de acceso actualizado correctamente.");
    })
    .catch((error) => {
      console.error("Error al actualizar el token de acceso:", error);
    });
}

function spotifyRequest(method, endpoint, data = null) {
  if (!accessToken) {
    console.log("El token de acceso no está disponible, actualizando...");
    return refreshAccessToken()
      .then(() => spotifyRequest(method, endpoint, data))
      .catch((error) => {
        console.error("Error al actualizar el token de acceso:", error);
      });
  }

  const options = {
    method,
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
        console.log("Token expirado, actualizando...");
        return refreshAccessToken()
          .then(() => spotifyRequest(method, endpoint, data))
          .catch((error) => {
            console.error(
              "Error al actualizar el token después de expiración:",
              error
            );
          });
      } else {
        console.error(`Error al realizar la solicitud a ${endpoint}:`, error);
        return Promise.reject(error); // Propagamos el error para que sea manejado correctamente
      }
    });
}

// Funciones para obtener información de reproducción
function getCurrentlyPlaying() {
  spotifyRequest("GET", "/currently-playing")
    .then((response) => {
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
    })
    .catch((error) => {
      console.error("Error al obtener la canción en reproducción:", error);
    });
}

// 2. Función para obtener el estado de reproducción
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

// 3. Función para reproducir o pausar la canción (nueva versión)
async function playMusic(deviceId) {
  try {
    await spotifyRequest("PUT", "/play", {}, { device_id: deviceId });
    console.log("Música reproducida.");
  } catch (error) {
    console.error("Error al intentar reproducir la canción:", error);
  }
}
async function pauseMusic(deviceId) {
  try {
    await spotifyRequest("PUT", "/pause", {}, { device_id: deviceId });
    console.log("Música pausada.");
  } catch (error) {
    console.error("Error al intentar pausar la canción:", error);
  }
}

async function togglePlayPause() {
  try {
    // Obtener el estado de reproducción actual
    const playbackState = await spotifyRequest("GET", " ");

    if (!playbackState || !playbackState.device) {
      console.error("No hay reproducción activa en ningún dispositivo.");
      return;
    }

    const isPlaying = playbackState.is_playing;
    const deviceId = playbackState.device.id;
    console.log(
      `Dispositivo activo: ${playbackState.device.name} (ID: ${deviceId})`
    );

    if (isPlaying) {
      // Si la música se está reproduciendo, pausar
      await pauseMusic(deviceId);
      console.log("Emitir estado de pausa");
      mainWindow.webContents.send("playback-status-updated", false); // Enviar el nuevo estado al frontend
    } else {
      // Si la música no se está reproduciendo, reproducir
      await playMusic(deviceId);
      console.log("Emitir estado de reproducción");
      mainWindow.webContents.send("playback-status-updated", true); // Enviar el nuevo estado al frontend
    }
  } catch (error) {
    console.error("Error al verificar el estado de la reproducción:", error);
  }
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

// Función para manejar el estado de repetir
function toggleRepeat(state) {
  let repeatMode;
  switch (state) {
    case 0:
      repeatMode = "off"; // Desactivar repetir
      break;
    case 1:
      repeatMode = "context"; // Repetir lista
      break;
    case 2:
      repeatMode = "track"; // Repetir canción
      break;
  }

  spotifyRequest("PUT", `/repeat?state=${repeatMode}`)
    .then(() => {
      console.log(`Modo repetir ${repeatMode}`);
      mainWindow.webContents.send("repeat-status", state); // Enviar el nuevo estado al frontend
    })
    .catch((error) => {
      console.error("Error al cambiar el estado de repetir:", error);
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

// 4. Configuración de la ventana principal de Electron
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 490,
    height: 130,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
  authenticateWithSpotify();

  setInterval(() => {
    getCurrentlyPlaying();
  }, 1000);

  ipcMain.on("request-playback-status", () => {
    getPlaybackState();
  });

  ipcMain.on("toggle-play-pause", () => {
    togglePlayPause();
  });

  ipcMain.on("toggle-shuffle", (event, state) => {
    toggleShuffle(state);
  });

  ipcMain.on("toggle-repeat", (event, state) => {
    toggleRepeat(state);
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
