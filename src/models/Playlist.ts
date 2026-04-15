import { DoubleLinkedList } from './DoubleLinkedList';
import { Song, ISong } from './Song';

/**
 * Interfaz para los datos de una playlist
 */
export interface IPlaylist {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  songs: ISong[];
}

/**
 * Clase que representa una playlist
 */
export class Playlist implements IPlaylist {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  private playlistSongs: DoubleLinkedList<Song>;

  constructor(id: string, name: string, description: string = '') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.playlistSongs = new DoubleLinkedList<Song>();
  }

  /**
   * Obtiene el array de canciones
   */
  get songs(): ISong[] {
    return this.playlistSongs.map((song) => song.toJSON());
  }

  /**
   * Agrega una canción a la playlist
   */
  addSong(song: Song): void {
    this.playlistSongs.append(song);
    this.updatedAt = Date.now();
  }

  /**
   * Elimina una canción de la playlist
   */
  removeSong(songId: string): boolean {
    const index = this.getSongIndex(songId);
    if (index !== -1) {
      this.playlistSongs.removeAt(index);
      this.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Obtiene una canción por su ID
   */
  getSong(songId: string): Song | null {
    const songs = this.playlistSongs.toArray();
    return songs.find((song) => song.id === songId) || null;
  }

  /**
   * Obtiene el índice de una canción
   */
  getSongIndex(songId: string): number {
    const songs = this.playlistSongs.toArray();
    return songs.findIndex((song) => song.id === songId);
  }

  /**
   * Obtiene todas las canciones como array
   */
  getSongs(): Song[] {
    return this.playlistSongs.toArray();
  }

  /**
   * Obtiene el número de canciones
   */
  getSongCount(): number {
    return this.playlistSongs.getSize();
  }

  /**
   * Mueve una canción a otra posición
   */
  moveSong(fromIndex: number, toIndex: number): boolean {
    if (fromIndex < 0 || fromIndex >= this.playlistSongs.getSize() || toIndex < 0 || toIndex > this.playlistSongs.getSize()) {
      return false;
    }

    const song = this.playlistSongs.removeAt(fromIndex);
    if (song) {
      this.playlistSongs.insertAt(song, toIndex);
      this.updatedAt = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Actualiza la información de la playlist
   */
  updateInfo(name: string, description: string): void {
    this.name = name;
    this.description = description;
    this.updatedAt = Date.now();
  }

  /**
   * Limpia la playlist
   */
  clear(): void {
    this.playlistSongs.clear();
    this.updatedAt = Date.now();
  }

  /**
   * Convierte la playlist a JSON
   */
  toJSON(): IPlaylist {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      songs: this.songs,
    };
  }

  /**
   * Carga una playlist desde JSON
   */
  static fromJSON(data: IPlaylist): Playlist {
    const playlist = new Playlist(data.id, data.name, data.description);
    playlist.createdAt = data.createdAt;
    playlist.updatedAt = data.updatedAt;

    data.songs.forEach((songData) => {
      const song = new Song(songData);
      playlist.addSong(song);
    });

    return playlist;
  }
}
