# Guía de Inicio Rápido

## ✨ ¿Qué es Karden Music Player?

**Karden Music Player** es un reproductor de música web desarrollado como aplicación monolítica usando:
- **TypeScript**: Para código seguro y bien tipado
- **Tailwind CSS**: Para diseño moderno y responsivo
- **Listas Dobles Enlazadas**: Estructura de datos personalizada para gestión eficiente
- **Arquitectura MVC**: Separación clara de responsabilidades
- **localStorage + M3U**: Almacenamiento persistente

## 📦 Instalación y Ejecución

### 1️⃣ Instalar Dependencias
```bash
npm install
```

### 2️⃣ Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación se abrirá automáticamente en `http://localhost:5173`

### 3️⃣ Construir para Producción
```bash
npm run build
```
El código compilado estará en la carpeta `dist/`

## 🎯 Características Principales

### 📊 Estructura de Datos: Lista Doblemente Enlazada
```typescript
// Cada nodo tiene referencias bidireccionales
Node<T> {
  data: T
  next: Node<T> | null
  previous: Node<T> | null
}

// La lista soporta:
- append(): agregar al final O(1)
- prepend(): agregar al inicio O(1)
- removeAt(index): eliminar en posición O(n)
- insertAt(index): insertar en posición O(n)
```

### 🎵 Flujo de Trabajo

#### Crear Playlist
```
Usuario → Click "Crear Playlist" → PlaylistModalView → PlaylistController
  → Playlist Model → StorageManager → localStorage
```

#### Agregar Canción
```
Usuario → Click "Agregar Canción" → FileSelect → Song Model
  → Playlist → StorageManager → localStorage
```

#### Reproducir Música
```
Usuario → Click Play → PlayerController → HTMLAudioElement
  → PlayerControlsView → UI Update
```

### 📝 Variables en Inglés + Interfaz en Español

**Código (variables en inglés)**:
```typescript
const currentPlaylist: Playlist | null = null;
const songTitle: string = "Mi Canción";
```

**Interfaz (etiquetas en español)**:
```
Playlists → "Mis Playlists"
Songs → "Canciones"
Play → "Reproducir"
```

## 🏗️ Arquitectura MVC

### Models (Datos)
```
DoubleLinkedList<T>    → Estructura genérica de datos
    ↓
Song                   → Representa una canción
    ↓
Playlist               → Contiene una lista doble de Songs
```

### Controllers (Lógica)
```
PlayerController       → Gestiona reproducción, volumen, búsqueda
PlaylistController     → Gestiona playlists, edición de canciones
```

### Views (Presentación)
```
AppView               → Coordinador principal
    ├── PlaylistListView      → Muestra playlists
    ├── SongListView          → Muestra canciones
    ├── PlayerControlsView    → Controles del reproductor
    ├── EditSongModalView     → Modal edición canción
    └── PlaylistModalView     → Modal edición playlist
```

## 💾 Almacenamiento

### localStorage Keys
```javascript
'karden_playlists'           // Array de playlists
'karden_current_playlist'    // ID de playlist actual
'karden_favorites'           // IDs de canciones favoritas
```

### Formato M3U
```
#EXTM3U
#EXTINF:180,Artista - Título
/ruta/a/archivo/cancion.mp3
#EXTINF:240,Otro Artista - Otra Canción
/ruta/a/archivo/otra_cancion.mp3
```

## 🎨 Personalización

### Cambiar Colores
Edita `tailwind.config.js`:
```javascript
theme: {
  colors: {
    primary: '#1DB954',      // Verde Spotify
    secondary: '#191414',    // Negro oscuro
    tertiary: '#282828',     // Gris oscuro
  }
}
```

### Agregar Nuevas Funcionalidades
1. Crea modelo en `src/models/`
2. Crea controlador en `src/controllers/`
3. Crea vista en `src/views/components/`
4. Integra en `AppView.ts`

## 📚 Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| **TypeScript** | Lenguaje con tipos estáticos |
| **Vite** | Bundler ultra rápido |
| **Tailwind CSS** | Framework de estilos utilitarios |
| **HTML5 Audio API** | Reproducción de audio |
| **localStorage** | Almacenamiento cliente |

## 🔍 Estructura de Datos: DoubleLinkedList

```typescript
class DoubleLinkedList<T> {
  // Operaciones principales
  append(data: T)              // O(1) - agregar al final
  prepend(data: T)             // O(1) - agregar al inicio
  insertAt(data: T, index)     // O(n) - insertar en posición
  removeAt(index)              // O(n) - eliminar en posición
  getAt(index)                 // O(n) - obtener en posición
  
  // Operaciones útiles
  toArray()                    // Convertir a array
  forEach(callback)            // Iterar
  filter(predicate)            // Filtrar
  map(callback)                // Mapear
}
```

## 🎮 Controles del Reproductor

| Control | Acción |
|---------|--------|
| ▶ Play | Reproducir canción actual |
| ⏸ Pause | Pausar reproducción |
| ⏮ Previous | Canción anterior |
| ⏭ Next | Siguiente canción |
| 🔊 Volumen | Ajustar volumen (0-100%) |
| 🔁 Loop | Repetir canción/playlist |
| 🔀 Shuffle | Modo aleatorio |

## 🐛 Solución de Problemas

### Las canciones no se reproducen
- Verifica que el navegador permita audio
- Comprueba que los archivos sean formatos soportados (MP3, WAV, OGG, M4A)

### localStorage lleno
- Limpia el historial/cookies del navegador
- Los datos de playlists se almacenan en localStorage

### Importar M3U no funciona
- Asegúrate de que el archivo sea válido M3U
- Verifica que los paths de las canciones sean accesibles

## 📖 Ejemplo de Uso Programático

```typescript
import { PlaylistController, PlayerController } from '@controllers';
import { Song } from '@models';

// Crear controladores
const playlistCtrl = new PlaylistController();
const playerCtrl = new PlayerController();

// Crear playlist
const playlist = playlistCtrl.createPlaylist('Mi Playlist', 'Descripción');

// Agregar canción
const song = new Song({
  id: '1',
  title: 'Mi Canción',
  artist: 'Mi Artista',
  duration: 180,
  filePath: 'archivo.mp3',
  imageUrl: 'imagen.jpg',
  addedAt: Date.now()
});

playlistCtrl.addSongToPlaylist(playlist.id, song);

// Cargar y reproducir
playerCtrl.loadPlaylist(playlist);
playerCtrl.play();
```

## 📱 Soporte Responsive

La aplicación está diseñada para:
- 💻 Desktops (1920x1080+)
- 📱 Tablets (768px - 1024px)
- 📱 Móviles (320px - 768px)

## ⚡ Performance

- Lista doblemente enlazada: O(1) en extremos, O(n) en el medio
- Búsqueda de canciones: O(n)
- Carga de playlists desde localStorage: O(1)
- Renderizado eficiente con Vite

## 📝 Convenciones de Código

```typescript
// Variables y funciones: camelCase en inglés
const currentSong = player.getCurrentSong();

// Clases: PascalCase
class PlayerController { }

// Constantes: UPPER_SNAKE_CASE
const MAX_VOLUME = 100;

// Interfaces: I + PascalCase
interface ISong { }

// Métodos privados: _ + camelCase (opcional)
private _updateUI() { }
```

## 🎓 Concepto: Listas Dobles v.s Arrays

| Operación | Array | DoubleLinkedList |
|-----------|-------|------------------|
| Acceso aleatorio | O(1) | O(n) |
| Inserción al inicio | O(n) | O(1) |
| Inserción al final | O(1) | O(1) |
| Inserción en medio | O(n) | O(n) |
| Eliminación | O(n) | O(n) |
| Búsqueda | O(n) | O(n) |

## 🚀 Próximas Mejoras

- [ ] Buscar canciones en tiempo real
- [ ] Crear playlists colaborativas
- [ ] Análisis de escucha
- [ ] Sincronización en la nube
- [ ] Soporte para streaming online
- [ ] Historial de reproducción
- [ ] Estadísticas de escucha

## 📄 Licencia

MIT License - Libre para usar en proyectos personales y comerciales

---

¡Disfruta tu experiencia con Karden Music Player! 🎵
