import { ISong, IPlaylistImporter } from '@interfaces';
import { generateUUID } from '@utils';

/**
 * Importa canciones desde archivos M3U y audio local
 */
export class M3UImporter implements IPlaylistImporter {
  /**
   * Importa un archivo M3U o audio
   * @param file - Archivo M3U o audio seleccionado
   */
  async import(file: File): Promise<ISong[]> {
    // Si es un archivo de audio, crear una canción directamente
    if (file.type.includes('audio') || /\.(mp3|flac)$/i.test(file.name)) {
      return this.importAudioFile(file);
    }

    // Si es M3U, parsear el contenido
    const content = await file.text();
    return this.parseM3U(content);
  }

  /**
  * Crea una canción desde un archivo de audio
   */
  private importAudioFile(file: File): ISong[] {
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

    let pendingExtinf: string | null = null;

    for (const line of lines) {
      if (!line) continue;

      if (line.startsWith('#EXTINF:')) {
        pendingExtinf = line;
        continue;
      }

      if (line.startsWith('#')) {
        continue;
      }

      try {
        const song = pendingExtinf ? this.parseSongLine(pendingExtinf, line) : this.createSongFromPath(line);
        if (song) {
          songs.push(song);
        }
      } catch (error) {
        console.warn(`Error parsing M3U entry: ${line}`, error);
      }

      pendingExtinf = null;
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
    const parsedDuration = Math.floor(parseFloat(durationStr));
    const duration = Number.isFinite(parsedDuration) ? parsedDuration : 0;

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
      isFileAvailable: !audioPath.startsWith('blob:'),
    };
  }

  private createSongFromPath(audioPath: string): ISong {
    const normalizedPath = audioPath.trim();
    const fileName = normalizedPath.split('/').pop() || normalizedPath;
    const title = fileName.replace(/\.[^/.]+$/, '') || 'Sin título';

    return {
      id: generateUUID(),
      title,
      artist: 'Desconocido',
      album: 'Importado M3U',
      duration: 0,
      albumArt: '',
      audioUrl: normalizedPath,
      source: 'm3u',
      isFileAvailable: !normalizedPath.startsWith('blob:'),
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
