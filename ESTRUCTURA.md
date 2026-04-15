Karden-Music-/
│
├── 📄 package.json                 # Dependencias del proyecto
├── 📄 tsconfig.json               # Configuración de TypeScript
├── 📄 vite.config.ts              # Configuración de Vite
├── 📄 tailwind.config.js          # Configuración de Tailwind CSS
├── 📄 postcss.config.js           # Configuración de PostCSS
├── 📄 .eslintrc.json              # Configuración de ESLint
├── 📄 .gitignore                  # Archivos ignorados por Git
├── 📄 README.md                   # Documentación principal
├── 📄 GUIA_INICIO_RAPIDO.md       # Guía de inicio rápido
│
├── 📁 src/
│   │
│   ├── 📁 models/                 # Modelos de datos (MVC)
│   │   ├── DoubleLinkedList.ts    # Estructura de lista doble enlazada
│   │   ├── Song.ts                # Modelo de canción
│   │   ├── Playlist.ts            # Modelo de playlist
│   │   └── index.ts               # Exportaciones
│   │
│   ├── 📁 controllers/            # Controladores (MVC)
│   │   ├── PlayerController.ts    # Lógica de reproducción
│   │   ├── PlaylistController.ts  # Lógica de playlists
│   │   └── index.ts               # Exportaciones
│   │
│   ├── 📁 views/                  # Vistas (MVC)
│   │   ├── 📁 components/         # Componentes reutilizables
│   │   │   ├── UIComponents.ts       # Componentes base
│   │   │   ├── PlaylistListView.ts   # Vista lista de playlists
│   │   │   ├── SongListView.ts       # Vista lista de canciones
│   │   │   ├── PlayerControlsView.ts # Controles del reproductor
│   │   │   ├── EditSongModalView.ts  # Modal de edición
│   │   │   ├── PlaylistModalView.ts  # Modal de playlist
│   │   │   └── index.ts              # Exportaciones
│   │   ├── AppView.ts             # Vista principal
│   │   └── index.ts               # Exportaciones
│   │
│   ├── 📁 utils/                  # Utilidades y helpers
│   │   ├── StorageManager.ts      # Gestión de localStorage
│   │   ├── M3UManager.ts          # Gestión de archivos M3U
│   │   ├── utils.ts               # Funciones auxiliares
│   │   └── index.ts               # Exportaciones
│   │
│   ├── 📄 index.html              # Archivo HTML principal
│   ├── 📄 main.ts                 # Punto de entrada
│   └── 📄 styles.css              # Estilos globales con Tailwind
│
├── 📁 dist/                       # Código compilado (generado después de build)
│   ├── index.html
│   ├── main.js
│   └── styles.css
│
├── 📁 node_modules/               # Dependencias instaladas (generada)
│
└── 📁 .git/                       # Historial de Git


## 📊 Flujo de Datos

```
Usuario (UI)
    ↓
Views (AppView, PlayerControlsView, etc.)
    ↓
Controllers (PlayerController, PlaylistController)
    ↓
Models (DoubleLinkedList, Song, Playlist)
    ↓
Utils (StorageManager, M3UManager)
    ↓
localStorage / HTMLAudioElement
```


## 🗂️ Árbol de Importaciones

```
main.ts
  └─ AppView
      ├─ PlayerController
      ├─ PlaylistController
      ├─ UIComponents
      ├─ PlaylistListView
      ├─ SongListView
      ├─ PlayerControlsView
      ├─ EditSongModalView
      └─ PlaylistModalView
          ├─ Song (Model)
          ├─ Playlist (Model)
          ├─ DoubleLinkedList (Model)
          ├─ StorageManager
          └─ M3UManager
```


## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0"
  }
}
```


## 🎯 Archivos por Propósito

### 📝 Configuración
- package.json
- tsconfig.json
- vite.config.ts
- tailwind.config.js
- postcss.config.js
- .eslintrc.json

### 💾 Datos (Models)
- DoubleLinkedList.ts
- Song.ts
- Playlist.ts

### 🔧 Lógica (Controllers)
- PlayerController.ts
- PlaylistController.ts

### 🎨 Interfaz (Views)
- AppView.ts
- UIComponents.ts
- PlaylistListView.ts
- SongListView.ts
- PlayerControlsView.ts
- EditSongModalView.ts
- PlaylistModalView.ts

### 🛠️ Herramientas (Utils)
- StorageManager.ts
- M3UManager.ts
- utils.ts

### 📄 Documentación
- README.md
- GUIA_INICIO_RAPIDO.md
- ESTRUCTURA.md (este archivo)


## ✨ Características de Cada Carpeta

### /models
- Estructuras de datos genéricas
- Tipos y interfaces
- Lógica de negocio básica
- Sin dependencias externas

### /controllers
- Orquestación de lógica
- Manejo de eventos
- Comunicación entre vistas y modelos
- Patrón Observer implementado

### /views
- Renderizado de UI
- Interacción con usuario
- Componentes reutilizables
- Separado del CSS (Tailwind externo)

### /utils
- Funciones auxiliares
- Gestión de almacenamiento
- Parseo de archivos
- Funciones de formato

### /src
- Archivo HTML principal
- Punto de entrada (main.ts)
- Estilos globales
- Configuración de raíz


## 🔄 Ciclo de Vida de la Aplicación

```
1. index.html cargado
   ↓
2. main.ts ejecutado
   ↓
3. AppView instanciado
   ↓
4. renderLayout() dibuja la UI
   ↓
5. setupEventListeners() vincula eventos
   ↓
6. loadInitialData() carga playlists
   ↓
7. App lista para usar
```


## 🌟 Patrones de Diseño Implementados

### 1. MVC (Model-View-Controller)
- **Models**: Song, Playlist, DoubleLinkedList
- **Views**: AppView y componentes
- **Controllers**: PlayerController, PlaylistController

### 2. Observer Pattern
- PlayerController emite eventos
- Views se suscriben a cambios
- UI se actualiza automáticamente

### 3. Singleton (implícito)
- StorageManager
- M3UManager

### 4. Strategy Pattern
- Diferentes estrategias de búsqueda
- Modo shuffle vs modo normal

### 5. Factory Pattern
- Creación de componentes UI
- createButton(), createInput(), etc.

### 6. Repository Pattern
- StorageManager gestiona persistencia
- Abstracción del almacenamiento


## 📈 Complejidad Algorítmica

### DoubleLinkedList
```
append():      O(1) - constante
prepend():     O(1) - constante
getAt(i):      O(n) - lineal
insertAt(i):   O(n) - lineal
removeAt(i):   O(n) - lineal
indexOf():     O(n) - lineal
forEach():     O(n) - lineal
filter():      O(n) - lineal
```

### Operaciones de Playlist
```
Agregar canción:    O(1)
Obtener canción:    O(n)
Eliminar canción:   O(n)
Mover canción:      O(n)
Buscar canciones:   O(n * m) - donde m es el número de playlists
```


## 💡 Casos de Uso Principales

### UC1: Crear y reproducir una playlist
1. Usuario crea nueva playlist
2. Agrega canciones
3. Presiona play
4. Reproductor inicia

### UC2: Editar canción
1. Usuario selecciona canción
2. Hace clic en editar
3. Modal se abre
4. Carga imagen y edita datos
5. Cambios se guardan en localStorage

### UC3: Descargar como M3U
1. Usuario selecciona playlist
2. Hace clic en descargar
3. M3UManager genera archivo
4. Se descarga automáticamente

### UC4: Buscar canciones
1. Usuario escribe en buscador
2. PlaylistController filtra
3. Resultados se muestran
4. Usuario selecciona resultado


## 🔐 Seguridad

- No datos sensibles en localStorage
- Validación de entrada de usuario
- Prevención de inyección HTML
- URLs de audio validadas

---

Para más detalles, consulta README.md y GUIA_INICIO_RAPIDO.md
