/**
 * Interfaz para los datos de una canción
 */
export interface ISong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  filePath: string;
  imageUrl: string;
  addedAt: number;
}

/**
 * Clase que representa una canción
 */
export class Song implements ISong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  filePath: string;
  imageUrl: string;
  addedAt: number;

  constructor(data: ISong) {
    this.id = data.id;
    this.title = data.title;
    this.artist = data.artist;
    this.duration = data.duration;
    this.filePath = data.filePath;
    this.imageUrl = data.imageUrl;
    this.addedAt = data.addedAt;
  }

  /**
   * Convierte la canción a objeto JSON
   */
  toJSON(): ISong {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      duration: this.duration,
      filePath: this.filePath,
      imageUrl: this.imageUrl,
      addedAt: this.addedAt,
    };
  }

  /**
   * Convierte la canción a formato M3U
   */
  toM3U(): string {
    return `#EXTINF:${this.duration},${this.artist} - ${this.title}\\n${this.filePath}`;
  }

  /**
   * Crea una canción desde datos M3U
   */
  static fromM3U(extinf: string, filePath: string): Song {
    const match = extinf.match(/#EXTINF:(-?\\d+),(.+)/);
    if (!match) {
      throw new Error('Invalid M3U format');
    }

    const [, durationStr, metadata] = match;
    const [artist, title] = metadata.split('-').map((s) => s.trim());

    return new Song({
      id: Math.random().toString(36).substr(2, 9),
      title: title || 'Unknown',
      artist: artist || 'Unknown',
      duration: parseInt(durationStr, 10) || 0,
      filePath,
      imageUrl: '',
      addedAt: Date.now(),
    });
  }

  /**
   * Obtiene el tiempo de duración formateado
   */
  getFormattedDuration(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
