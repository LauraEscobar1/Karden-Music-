import { ISong, IPlaylistImporter } from '@interfaces';
import { generateUUID } from '@utils';

/**
 * Importa canciones desde archivos M3U y MP3
 */
export class M3UImporter implements IPlaylistImporter {
  /**
   * Importa un archivo M3U o MP3
   * @param file - Archivo M3U o MP3 seleccionado
   */
  async import(file: File): Promise<ISong[]> {
    // Si es un archivo MP3, crear una canción directamente
    if (file.type.includes('audio') || file.name.endsWith('.mp3')) {
      return this.importMP3(file);
    }

    // Si es M3U, parsear el contenido
    const content = await file.text();
    return this.parseM3U(content);
  }

  /**
   * Crea una canción desde un archivo MP3
   */
  private importMP3(file: File): ISong[] {
    const title = file.name.replace(/\.[^/.]+$/, '');
    const song: ISong = {
      id: generateUUID(),
      title: title,
      artist: 'Desconocido',
      album: '',
      duration: 0, // Se obtiene cuando se reproduce
      albumArt: '',
      audioUrl: URL.createObjectURL(file),
      source: 'local',
      isFileAvailable: true,
    };
    return [song];
  }

  /**
   * Parsea contenido M3U
   */
  private parseM3U(content: string): ISong[] {
    const songs: ISong[] = [];
    const lines = content.split('\n').map((line) => line.trim());

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('#EXTINF:')) {
        const extinf = line;
        const audioPath = lines[i + 1]?.trim() || '';

        if (audioPath && !audioPath.startsWith('#')) {
          try {
            const song = this.parseSongLine(extinf, audioPath);
            if (song) {
              songs.push(song);
            }
          } catch (error) {
            console.warn(`Error parsing M3U line: ${extinf}`, error);
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
   * Parsea una línea EXTINF del M3U
   * Formato: #EXTINF:duration,artist - title
   */
  private parseSongLine(extinf: string, audioPath: string): ISong | null {
    const match = extinf.match(/#EXTINF:([\d.-]+),(.+)/);
    if (!match) return null;

    const [, durationStr, metadata] = match;
    const duration = Math.floor(parseFloat(durationStr));

    // Parsear metadata "artist - title"
    let artist = 'Desconocido';
    let title = 'Sin título';

    const parts = metadata.split('-').map((s) => s.trim());
    if (parts.length > 1) {
      artist = parts[0];
      title = parts.slice(1).join('-').trim();
    } else {
      title = metadata.trim();
    }

    return {
      id: generateUUID(),
      title,
      artist,
      album: 'Importado M3U',
      duration,
      albumArt: '',
      audioUrl: audioPath,
      source: 'm3u',
      isFileAvailable: audioPath.startsWith('http') || audioPath.startsWith('/'),
    };
  }

  /**
   * Serializa canciones a formato M3U
   */
  static serializeToM3U(songs: ISong[]): string {
    const lines = ['#EXTM3U'];

    songs.forEach((song) => {
      lines.push(`#EXTINF:${Math.floor(song.duration)},${song.artist} - ${song.title}`);
      lines.push(song.audioUrl);
    });

    return lines.join('\n');
  }
}
