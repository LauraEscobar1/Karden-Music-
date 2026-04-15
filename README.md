# 🎵 Karden Music Player

Un reproductor de música profesional desarrollado en TypeScript con Tailwind CSS, utilizando listas dobles enlazadas para la gestión de playlists. La aplicación incluye soporte para archivos M3U y almacenamiento persistente en localStorage.

## 📋 Características

- **Reproductor de Música**: Controles completos de reproducción (play, pause, next, previous)
- **Gestión de Playlists**: Crear, editar y eliminar playlists
- **Listas Dobles Enlazadas**: Estructura de datos personalizada para gestión eficiente de canciones
- **Editor de Canciones**: Modal para editar título, artista y cargar imagen de portada
- **Almacenamiento M3U**: Soporte para importar/exportar archivos M3U
- **localStorage**: Persistencia de datos en el navegador
- **Interfaz en Español**: Interfaz completamente localizada
- **Tailwind CSS**: Diseño moderno y responsivo
- **Arquitectura MVC**: Separación clara entre modelos, vistas y controladores

## 📁 Estructura del Proyecto

```
src/
├── models/
│   ├── DoubleLinkedList.ts    # Lista doblemente enlazada genérica
│   ├── Song.ts                # Modelo de canción
│   ├── Playlist.ts            # Modelo de playlist
│   └── index.ts
├── controllers/
│   ├── PlayerController.ts    # Controlador del reproductor
│   ├── PlaylistController.ts  # Controlador de playlists
│   └── index.ts
├── views/
│   ├── components/
│   │   ├── UIComponents.ts      # Componentes base reutilizables
│   │   ├── PlaylistListView.ts  # Vista de lista de playlists
│   │   ├── SongListView.ts      # Vista de lista de canciones
│   │   ├── PlayerControlsView.ts# Controles del reproductor
│   │   ├── EditSongModalView.ts # Modal de edición de canción
│   │   ├── PlaylistModalView.ts # Modal de edición de playlist
│   │   └── index.ts
│   ├── AppView.ts             # Vista principal
│   └── index.ts
├── utils/
│   ├── StorageManager.ts      # Gestor de localStorage
│   ├── M3UManager.ts          # Gestor de archivos M3U
│   ├── utils.ts               # Utilidades generales
│   └── index.ts
├── main.ts                    # Punto de entrada
├── styles.css                 # Estilos Tailwind
└── index.html
```

## 🚀 Instalación

### Requisitos
- Node.js 16+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
cd Karden-Music-
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

4. **Compilar para producción**
```bash
npm run build
```

## 💻 Uso

### Crear una Playlist
1. Haz clic en el botón "Crear Playlist" en el panel lateral
2. Ingresa el nombre y descripción (opcional)
3. Haz clic en "Crear"

### Agregar Canciones
1. Selecciona una playlist
2. Haz clic en "Agregar Canción"
3. Selecciona un archivo de audio desde tu dispositivo
4. La canción se agregará a la playlist

### Editar una Canción
1. Haz clic en el icono de edición (✎) en la canción
2. Modifica el título, artista o carga una imagen
3. Haz clic en "Guardar"

### Reproducir Música
1. Haz clic en el botón de reproducción en la canción o en los controles principales
2. Usa los botones de navegación para cambiar entre canciones
3. Ajusta el volumen con el slider
4. Activa modo loop (🔁) o shuffle (🔀) según sea necesario

### Descargar Playlist
1. Haz clic en el ícono de descarga en el header
2. La playlist se descargará como archivo .m3u

## 🔧 Arquitectura

### Modelos (MVC - M)
- **DoubleLinkedList**: Lista doblemente enlazada genérica con operaciones comunes
- **Song**: Representa una canción con metadatos
- **Playlist**: Colección de canciones usando lista doble enlazada

### Controladores (MVC - C)
- **PlayerController**: Gestiona la reproducción de música
- **PlaylistController**: Gestiona playlists y suas operaciones

### Vistas (MVC - V)
- **AppView**: Vista principal que coordina todo
- **PlaylistListView**: Muestra la lista de playlists
- **SongListView**: Muestra las canciones de una playlist
- **PlayerControlsView**: Controles del reproductor
- **Modales**: Para editar canciones y playlists

### Utilidades
- **StorageManager**: Gestiona localStorage
- **M3UManager**: Maneja archivos M3U
- **utils**: Funciones auxiliares comunes

## 📝 Buenas Prácticas Implementadas

✅ **Tipado Fuerte**: TypeScript con tipos explícitos  
✅ **Separación de Responsabilidades**: MVC bien definido  
✅ **Reutilización de Código**: Componentes modulares  
✅ **Gestión de Errores**: Manejo adecuado de excepciones  
✅ **Nombres en Inglés**: Variables y código en inglés  
✅ **Documentación**: Comentarios JSDoc en funciones clave  
✅ **Responsive**: Diseño adaptable a diferentes pantallas  
✅ **Accesibilidad**: Controles accesibles  

## 🌐 Tecnologías Utilizadas

- **TypeScript**: Lenguaje principal
- **Tailwind CSS**: Framework de estilos
- **Vite**: Bundler y servidor de desarrollo
- **HTML5 Audio API**: Para reproducción de audio
- **localStorage API**: Para persistencia de datos

## 📚 Algoritmos y Estructuras de Datos

### Lista Doblemente Enlazada
- Nodo con referencias `next` y `previous`
- Operaciones O(1) en ambos extremos
- Inserción/eliminación O(n) en posición específica
- Métodos: append, prepend, removeAt, getAt, indexOf, filter, map

## 🎨 Tema de Colores

- **Verde Primario**: #1DB954 (Botones, controles principales)
- **Fondo Secundario**: #191414 (Reproductor)
- **Fondo Terciario**: #282828 (Componentes)
- **Blanco**: Para textos principales
- **Gris**: Para textos secundarios

## 📱 Compatibilidad

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 👨‍💻 Autor

Desarrollado como parte de un sistema de gestión de música en monolito.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue o un pull request para cualquier mejora.

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.
