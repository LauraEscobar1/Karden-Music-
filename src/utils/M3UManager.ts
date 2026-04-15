import { Song, Playlist } from '@models';

/**
 * Clase para manejar archivos M3U
 */
export class M3UManager {
  /**
   * Genera contenido M3U a partir de una playlist
   */
  static generateM3U(playlist: Playlist): string {
    const lines: string[] = ['#EXTM3U'];
    const songs = playlist.getSongs();

    songs.forEach((song) => {
      lines.push(`#EXTINF:${song.duration},${song.artist} - ${song.title}`);
      lines.push(song.filePath);
    });

    return lines.join('\\n');
  }

  /**
   * Descarga una playlist como archivo M3U
   */
  static downloadM3U(playlist: Playlist): void {
    const m3uContent = this.generateM3U(playlist);
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(m3uContent)}`);
    element.setAttribute('download', `${playlist.name}.m3u`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Parsea un archivo M3U
   */
  static parseM3U(content: string): Song[] {
    const lines = content.split('\\n').filter((line) => line.trim());
    const songs: Song[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        const extinf = line;
        const filePath = lines[i + 1]?.trim() || '';

        if (filePath && !filePath.startsWith('#')) {
          try {
            const song = Song.fromM3U(extinf, filePath);
            songs.push(song);
          } catch (error) {
            console.warn(`Failed to parse M3U entry: ${extinf}`);
          }
        }

        i += 2;
      } else {
        i++;
      }
    }

    return songs;
  }

  /**
   * Importa un archivo M3U
   */
  static async importM3U(file: File): Promise<Song[]> {
    try {
      const content = await file.text();
      return this.parseM3U(content);
    } catch (error) {
      console.error('Error importing M3U file:', error);
      throw new Error('Error al importar archivo M3U');
    }
  }

  /**
   * Crea un archivo M3U en memoria
   */
  static createM3UBlob(playlist: Playlist): Blob {
    const m3uContent = this.generateM3U(playlist);
    return new Blob([m3uContent], { type: 'application/vnd.apple.mpegurl' });
  }
}
