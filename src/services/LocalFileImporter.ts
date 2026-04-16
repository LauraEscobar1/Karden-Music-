import { ISong, IPlaylistImporter } from '@interfaces';
import { StorageService } from '@utils/StorageManager';
import { generateUUID } from '@utils';

/**
 * Importa canciones desde archivos locales
 */
export class LocalFileImporter implements IPlaylistImporter {
  private storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  /**
   * Importa archivos de audio locales
   * @param files - FileList desde input file
   */
  async import(files: FileList): Promise<ISong[]> {
    const songs: ISong[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const isAudioByMime = file.type.startsWith('audio/');
      const isAudioByExtension = /\.(mp3|flac)$/i.test(file.name);

      if (!isAudioByMime && !isAudioByExtension) {
        console.warn(`Archivo ignorado: ${file.name} (no es audio)`);
        continue;
      }

      try {
        const song = await this.processSongFile(file);
        songs.push(song);
      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
      }
    }

    return songs;
  }

  /**
   * Procesa un archivo de audio individual
   */
  private async processSongFile(file: File): Promise<ISong> {
    // Usar una URL temporal para metadatos y otra para reproducción.
    const metadataUrl = URL.createObjectURL(file);
    const duration = await this.getAudioDuration(metadataUrl);
    const audioUrl = URL.createObjectURL(file);

    // Parsear nombre del archivo
    const { artist, title } = this.parseFileName(file.name);

    // Guardar blob en IndexedDB
    const blobId = await this.storageService.saveAudioBlob(file, file.name);

    return {
      id: generateUUID(),
      title,
      artist,
      album: 'Archivo Local',
      duration,
      albumArt: '',
      audioUrl: audioUrl,
      blobId,
      source: 'local',
      isFileAvailable: true,
    };
  }

  /**
   * Obtiene la duración de un archivo de audio
   */
  private getAudioDuration(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener(
        'loadedmetadata',
        () => {
          resolve(audio.duration);
          URL.revokeObjectURL(url);
        },
        { once: true }
      );
      audio.addEventListener(
        'error',
        () => {
          URL.revokeObjectURL(url);
          reject(audio.error);
        },
        { once: true }
      );
      audio.src = url;
    });
  }

  /**
   * Parsea el nombre del archivo para extraer artista y título
   * Formato esperado: "Artist - Title.ext" o "Title.ext"
   */
  private parseFileName(filename: string): { artist: string; title: string } {
    // Remover extensión
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Buscar separador " - "
    const parts = nameWithoutExt.split(' - ');

    if (parts.length > 1) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim(),
      };
    }

    return {
      artist: 'Desconocido',
      title: nameWithoutExt.trim(),
    };
  }
}
