/**
 * Interface para una canción importada
 */
export interface ISong {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumArt: string;
  audioUrl: string;
  blobId?: string;
  source: 'local' | 'youtube' | 'spotify' | 'apple_music' | 'm3u';
  isFileAvailable: boolean;
  missingReason?: string;
}

/**
 * Interface para una playlist
 */
export interface IUserPlaylist {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  createdAt: number;
  updatedAt: number;
  songs: ISong[];
  source: 'local' | 'imported';
  m3uContent?: string;
}

/**
 * Interface para estrategia de importación
 */
export interface IPlaylistImporter {
  import(input: any): Promise<ISong[]>;
}

/**
 * Estado de la librería para persistencia
 */
export interface ILibraryState {
  playlists: IUserPlaylist[];
  currentPlaylistId: string | null;
  currentSongId: string | null;
}

/**
 * Eventos del reproductor
 */
export interface IEventEmitter {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}
