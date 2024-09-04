El archivo que has subido contiene la documentación de una aplicación web llamada "BookHub". A continuación, te generaré un nuevo archivo README.md para tu proyecto de widget de Spotify, al que llamaremos "Spotlite". El contenido estará adaptado específicamente a los detalles y funcionalidades que hemos discutido.

### README.md para "Spotlite"

```markdown
# Spotlite - Widget de Spotify

## Introducción

**Spotlite** es un widget personalizable para Spotify, desarrollado con **Electron.js**, que permite a los usuarios controlar y visualizar la reproducción de música directamente desde su escritorio en Windows. Spotlite ofrece una interfaz ligera, altamente personalizable e interactiva, brindando una experiencia conveniente y elegante para los amantes de la música.

Con **Spotlite**, los usuarios pueden ver información de la canción actual, controlar la reproducción y personalizar el aspecto del widget según sus preferencias. La aplicación está pensada inicialmente para uso personal, pero su diseño escalable permite futuras expansiones.

## Funcionalidades

### Controles y datos a mostrar
- Visualización de la carátula del álbum.
- Mostrar el nombre de la canción y el artista.
- Barra de progreso de la canción.
- Botón de Play/Pause.
- Botones para cambiar de canción (anterior/siguiente).
- Control de volumen ajustable.
- Botón para añadir canciones a favoritos.
- Información sobre el tiempo restante de la canción.
- Acceso a la cola de reproducción.
- Opción de mezclar o repetir canciones.

### Personalización del Widget
- Cambiar entre temas claro y oscuro.
- Personalizar los colores del widget (fondo, texto, botones).
- Ajustar el tamaño del widget (pequeño, mediano, grande).
- Arrastrar y soltar elementos dentro del widget.
- Selección del diseño de carátula (circular, cuadrada, sin carátula).
- Ajustar la transparencia del widget.
- Estilos de barra de progreso (lineal, circular).
- Mostrar u ocultar elementos específicos (artista, álbum, etc.).
- Posicionar los controles en diferentes áreas (arriba, abajo, lateral).
- Widgets flotantes para separar los controles de la información.
- Integración con fondos de pantalla dinámicos.
- Redondear las esquinas del widget.
- Opciones de visualización de texto (scrolling, fading).
- Activar o desactivar los bordes del widget.

## Requisitos

- **Sistema Operativo**: Windows
- **Framework**: Electron.js
- **Lenguajes**: JavaScript, HTML, CSS
- **API**: Spotify Web API (requiere autenticación OAuth2)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/Medina-Tirado-Diego/SpotLite.git
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd spotlite
   ```

3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

4. Ejecuta la aplicación en modo desarrollo:
   ```bash
   npm start
   ```

## Configuración de la API de Spotify

1. Crea una cuenta de desarrollador en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Genera un nuevo proyecto y obtén tus claves de autenticación.
3. Configura los tokens OAuth2 en el archivo `.env` para integrarlo con Spotlite.

## Uso

- Al ejecutar la aplicación, el widget de Spotify aparecerá en tu escritorio.
- Personaliza el widget utilizando el menú de configuración, donde podrás ajustar el tamaño, los colores y la disposición de los controles.
- Controla la reproducción de canciones y accede a tu cola de reproducción directamente desde el widget.

## Licencia

Este proyecto está bajo la licencia MIT. Puedes encontrar más detalles en el archivo [LICENSE](LICENSE).

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar Spotlite, por favor, abre un issue o envía un pull request.

## Autor

- **Medina Tirado Diego Jesus** - Desarrollador Principal
```

Este README está diseñado para detallar el propósito, funcionalidades, instalación y uso de "Spotlite".