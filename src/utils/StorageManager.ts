import { IUserPlaylist, ILibraryState } from '@interfaces';

export class StorageService {
  private static readonly LIBRARY_KEY = 'karden_library_state';
  private static readonly AUDIO_BLOBS_DB = 'karden_audio_blobs';
  private static readonly AUDIO_STORE = 'audio_files';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeIndexedDB();
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(StorageService.AUDIO_BLOBS_DB, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(StorageService.AUDIO_STORE)) {
          db.createObjectStore(StorageService.AUDIO_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async saveAudioBlob(blob: Blob, filename: string): Promise<string> {
    if (!this.db) {
      await this.initializeIndexedDB();
    }

    const id = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageService.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(StorageService.AUDIO_STORE);
      const request = store.add({ id, blob, filename, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(id);
    });
  }

  async getAudioBlob(id: string): Promise<Blob | null> {
    if (!this.db) {
      await this.initializeIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageService.AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(StorageService.AUDIO_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.blob || null);
    });
  }

  async deleteAudioBlob(id: string): Promise<void> {
    if (!this.db) {
      await this.initializeIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageService.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(StorageService.AUDIO_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  saveLibraryState(state: ILibraryState): void {
    try {
      localStorage.setItem(StorageService.LIBRARY_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error guardando estado de librería:', error);
    }
  }

  getLibraryState(): ILibraryState {
    try {
      const data = localStorage.getItem(StorageService.LIBRARY_KEY);
      return data
        ? JSON.parse(data)
        : {
            playlists: [],
            currentPlaylistId: null,
            currentSongId: null,
          };
    } catch (error) {
      console.error('Error cargando estado de librería:', error);
      return {
        playlists: [],
        currentPlaylistId: null,
        currentSongId: null,
      };
    }
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(StorageService.LIBRARY_KEY);

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageService.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(StorageService.AUDIO_STORE);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
