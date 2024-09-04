## Introducción

**Spotlite** es un widget de escritorio desarrollado con Electron.js, diseñado para proporcionar una experiencia interactiva y personalizable que facilita el control de la reproducción musical en Spotify directamente desde el escritorio de Windows. Con Spotlite, los usuarios pueden gestionar su música sin necesidad de abrir la aplicación completa de Spotify, además de contar con opciones de personalización para adaptar la interfaz a sus preferencias.

El propósito de Spotlite es ofrecer un acceso rápido y sencillo a las funcionalidades básicas de Spotify en un formato minimalista y eficiente, mejorando la experiencia de los usuarios que desean controlar su música mientras trabajan o realizan otras tareas.

### Colaboradores del Proyecto

| **Nombre**                        | **Rol**                                     | **Perfil**                                                 |
|-----------------------------------|---------------------------------------------|------------------------------------------------------------|
| [Tu Nombre]                       | Líder del Proyecto | [LinkedIn](https://www.linkedin.com)                        |

### Revisa el Progreso del Proyecto Spotlite

| **Columna**       | **Descripción**                                                                                                                                    |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| **Backlog**       | Contiene todas las ideas, características y mejoras que deben implementarse.                                                                       |
| **En Progreso**   | Las tareas que están actualmente en desarrollo, como la integración con la API de Spotify y el diseño del widget.                                   |
| **Revisión**      | Después de completar una tarea, se mueve aquí para revisión de código y pruebas de funcionamiento.                                                   |
| **En Pruebas**    | Las tareas que están en proceso de pruebas para asegurar que todo funcione correctamente antes del lanzamiento.                                      |
| **Hecho**         | Tareas completamente desarrolladas, revisadas y probadas que ya están listas para ser utilizadas en el widget.                                      |

### Funcionalidades de la Aplicación Spotlite

#### **Módulo de Reproducción**

- **Controles de Reproducción:**
    - Play/Pause, siguiente y anterior canción.
    - Control de volumen ajustable.
    - Opción de añadir canciones a favoritos.

- **Visualización de Información:**
    - Mostrar el nombre de la canción actual.
    - Mostrar el nombre del artista y la carátula del álbum.
    - Barra de progreso de la canción.
    - Mostrar el tiempo restante de la canción.
    - Acceso a la cola de reproducción.
    - Opción de mezclar o repetir canciones.

#### **Módulo de Personalización**

- **Personalización de la Interfaz:**
    - Cambiar entre temas claro y oscuro.
    - Personalizar los colores del fondo, texto y botones del widget.
    - Ajustar el tamaño del widget (pequeño, mediano, grande).
    - Opción de arrastrar y soltar los elementos dentro del widget.
    - Diseño de la carátula personalizable (circular, cuadrada o sin carátula).
    - Ajuste de transparencia del widget.
    - Elegir entre barras de progreso lineales o circulares.
    - Mostrar u ocultar elementos como el artista o el álbum.
    - Colocar los controles en diferentes posiciones (arriba, abajo, lateral).
    - Separar los controles de reproducción de la información de la canción (widget flotante).

#### **Módulo de Notificaciones**

- **Notificaciones de Cambio de Canción:**
    - Mostrar el nombre de la canción de manera discreta y pequeña cuando cambia la canción, sin interrumpir el flujo de trabajo del usuario.

### Diagramas de la Aplicación

#### Diagrama de Componentes

![Diagrama de Componentes](diagrama_componentes_spotlite.png)

Este diagrama muestra los componentes principales de Spotlite, como los controles de reproducción, la visualización de la información de la canción, y las opciones de personalización del widget.

### Descripción de Capas del Proyecto

| capa        | descripción                                                                                  |
|-------------|----------------------------------------------------------------------------------------------|
| api         | Maneja la interacción con la API de Spotify, obteniendo datos como la canción actual, listas de reproducción y controles de reproducción. |
| ui          | Contiene el diseño y la interfaz de usuario del widget, permitiendo personalizaciones y mostrando la información de la canción.            |
| services    | Proporciona la lógica de negocio que conecta la API de Spotify con la interfaz, manejando las peticiones y respuestas.                     |
| components  | Define los componentes visuales reutilizables, como botones de control, barra de progreso y la visualización de la carátula del álbum.     |
| notifications | Implementa el sistema de notificaciones para cambios de canción y otros eventos dentro de Spotify.                                      |
