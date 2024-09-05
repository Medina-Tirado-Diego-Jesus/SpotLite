const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const express = require('express');
const open = async (url) => (await import('open')).default(url);
const path = require('path');

const clientId = 'dd0ae322b97a4785bcb6766119b9c27a'; // Sustituye por tu Client ID
const clientSecret = 'dd8db6ba27a24b37baf1fe87d6a43935'; // Sustituye por tu Client Secret
const redirectUri = 'http://localhost:8888/callback';

let mainWindow;
let accessToken = '';
let refreshToken = '';

// Configuración del servidor Express para manejar la redirección de Spotify
const server = express();

server.get('/callback', (req, res) => {
  const code = req.query.code || null;
  if (code) {
    requestAccessToken(code);
    res.send('Autenticación completada. Puedes cerrar esta ventana.');
  } else {
    res.send('Error en la autenticación.');
  }
});

server.listen(8888, () => {
  console.log('Servidor escuchando en http://localhost:8888');
});

// Función para autenticar con Spotify
function authenticateWithSpotify() {
    const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    open(authUrl); // Abre el navegador para que el usuario otorgue permisos
  }
  

// Función para solicitar el token de acceso con el código de autorización
function requestAccessToken(code) {
  const tokenOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
  };

  axios(tokenOptions)
    .then(response => {
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      console.log('Token de acceso obtenido:', accessToken);
      getCurrentlyPlaying(); // Llama a esta función una vez obtienes el token
    })
    .catch(error => {
      console.error('Error al obtener el token de acceso:', error);
    });
}

// Función para obtener la canción que se está reproduciendo actualmente en Spotify
function getCurrentlyPlaying() {
  const options = {
    method: 'GET',
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  axios(options)
    .then(response => {
      if (response.data && response.data.item) {
        const song = response.data.item;
        const artist = song.artists[0].name;
        const title = song.name;
        const albumCover = song.album.images[0].url;

        console.log('Canción actual:', title);
        console.log('Artista:', artist);
        console.log('Carátula del álbum:', albumCover);

        // Enviar los datos al frontend (index.html) usando IPC
        mainWindow.webContents.send('currently-playing', { title, artist, albumCover });
      }
    })
    .catch(error => {
      console.error('Error al obtener la canción actual:', error);
    });
}

// Función para reproducir o pausar la reproducción
function togglePlayPause() {
  const options = {
    method: 'PUT',
    url: 'https://api.spotify.com/v1/me/player/play',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  axios(options)
    .then(() => {
      console.log('Reproducción/Pausa realizada correctamente');
    })
    .catch(error => {
      console.error('Error al controlar la reproducción:', error);
    });
}

// Función para saltar a la canción anterior
function previousTrack() {
  const options = {
    method: 'POST',
    url: 'https://api.spotify.com/v1/me/player/previous',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  axios(options)
    .then(() => {
      console.log('Canción anterior reproducida correctamente');
    })
    .catch(error => {
      console.error('Error al saltar a la canción anterior:', error);
    });
}

// Función para saltar a la siguiente canción
function nextTrack() {
  const options = {
    method: 'POST',
    url: 'https://api.spotify.com/v1/me/player/next',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  axios(options)
    .then(() => {
      console.log('Canción siguiente reproducida correctamente');
    })
    .catch(error => {
      console.error('Error al saltar a la canción siguiente:', error);
    });
}

// Crear la ventana principal de Electron
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');
}

// Iniciar la aplicación Electron
app.whenReady().then(() => {
  createWindow();
  authenticateWithSpotify(); // Llama a la autenticación de Spotify cuando la app esté lista

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC para actualizar la canción actual en el frontend
ipcMain.on('update-currently-playing', () => {
  if (accessToken) {
    getCurrentlyPlaying();
  }
});

// IPC para controlar la reproducción
ipcMain.on('toggle-play-pause', () => {
  togglePlayPause();
});

ipcMain.on('previous-track', () => {
  previousTrack();
});

ipcMain.on('next-track', () => {
  nextTrack();
});