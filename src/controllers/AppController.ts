import { Player } from './Player';
import { PlaylistService } from '@services/PlaylistService';
import { StorageService } from '@utils/StorageManager';
import { LocalFileImporter } from '@services/LocalFileImporter';
import { M3UImporter } from '@services/M3UImporter';
import { AppView } from '@views';

/**
 * Controlador principal de la aplicación
 * Coordina todos los servicios y vistas
 */
export class AppController {
  private static instance: AppController | null = null;

  private player: Player;
  private storageService: StorageService;
  private playlistService: PlaylistService;
  private appView: AppView;

  private localFileImporter: LocalFileImporter;
  private m3uImporter: M3UImporter;

  private constructor() {
    this.player = Player.getInstance();
    this.storageService = new StorageService();
    this.playlistService = new PlaylistService(this.storageService);
    this.appView = new AppView('#app', this.playlistService, this.player);

    this.localFileImporter = new LocalFileImporter(this.storageService);
    this.m3uImporter = new M3UImporter();

    this.initialize();
  }

  static getInstance(): AppController {
    if (!AppController.instance) {
      AppController.instance = new AppController();
    }
    return AppController.instance;
  }

  private initialize(): void {
    this.setupEventListeners();
    void this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    const playlists = this.playlistService.getAllPlaylists();
    await this.rehydrateLocalSongs(playlists);
    this.appView.updatePlaylistsView(playlists);

    if (playlists.length === 0) {
      const defaultPlaylist = this.playlistService.createPlaylist('Mi Playlist', 'Playlist predeterminada');
      this.appView.updatePlaylistsView([defaultPlaylist]);
      this.selectPlaylist(defaultPlaylist.id);
    } else {
      const rememberedPlaylistId = this.playlistService.getCurrentPlaylist()?.id;
      const playlistToSelect = rememberedPlaylistId && this.playlistService.getPlaylist(rememberedPlaylistId)
        ? rememberedPlaylistId
        : playlists[0].id;

      this.selectPlaylist(playlistToSelect);
      this.restoreAndTryPlayRememberedSong();
    }
  }

  private setupEventListeners(): void {
    this.player.on('play', () => this.appView.updatePlayerState());
    this.player.on('play', () => this.syncCurrentSongWithStorage());
    this.player.on('pause', () => this.appView.updatePlayerState());
    this.player.on('next', () => this.syncCurrentSongWithStorage());
    this.player.on('previous', () => this.syncCurrentSongWithStorage());
    this.player.on('timeupdate', () => this.appView.updatePlayerState());
    this.player.on('playlistchange', () => this.appView.updatePlayerState());
    this.player.on('volumechange', () => this.appView.updatePlayerState());

    this.appView.onSelectPlaylist((playlistId) => this.selectPlaylist(playlistId));
    this.appView.onPlaySong((songIndex) => this.playSongAtIndex(songIndex));
    this.appView.onDeletePlaylist((playlistId) => this.deletePlaylist(playlistId));
    this.appView.onDeleteSong((songId) => this.deleteSongFromCurrentPlaylist(songId));
    this.appView.onEditSong((song) => this.editSong(song));
    this.appView.onAddSongsToPlaylist(() => this.addSongsToCurrentPlaylist());
    this.appView.onImportFiles(() => this.importFiles());
    this.appView.onMoveQueueSong((fromIndex, toIndex) => this.reorderCurrentPlaylistSongs(fromIndex, toIndex));
  }

  private selectPlaylist(playlistId: string): void {
    const playlist = this.playlistService.getPlaylist(playlistId);
    if (!playlist) return;

    this.playlistService.setCurrentPlaylist(playlistId);
    this.player.loadPlaylist(playlist);
    this.appView.setCurrentPlaylist(playlist);
    this.appView.updateSongsView(playlist.songs, this.player.getCurrentSong()?.id || null);
  }

  private async playSongAtIndex(index: number): Promise<void> {
    const currentPlaylist = this.player.getCurrentPlaylist();
    const song = currentPlaylist?.songs[index];

    if (song && song.isFileAvailable === false) {
      const relinked = await this.tryRelinkSongFile(song.id);
      if (!relinked) {
        this.appView.showNotification(song.missingReason || 'Archivo no disponible para reproducir', 'warning');
        return;
      }
    }

    this.player.playSong(index);
    this.syncCurrentSongWithStorage();
    this.appView.updatePlayerState();
  }

  private deletePlaylist(playlistId: string): void {
    this.playlistService.deletePlaylist(playlistId);
    const playlists = this.playlistService.getAllPlaylists();
    this.appView.updatePlaylistsView(playlists);

    if (this.player.getCurrentPlaylist()?.id === playlistId) {
      if (playlists.length > 0) {
        this.selectPlaylist(playlists[0].id);
      } else {
        this.appView.setCurrentPlaylist(null);
        this.appView.updateSongsView([], null);
      }
    }

    this.appView.showNotification('Playlist eliminada', 'success');
  }

  private deleteSongFromCurrentPlaylist(songId: string): void {
    const currentPlaylistId = this.playlistService.getCurrentPlaylist()?.id;
    if (!currentPlaylistId) return;

    this.playlistService.removeSongFromPlaylist(currentPlaylistId, songId);
    const playlist = this.playlistService.getPlaylist(currentPlaylistId);
    if (playlist) {
      this.player.loadPlaylist(playlist);
      this.appView.updateSongsView(playlist.songs, this.player.getCurrentSong()?.id || null);
    }

    this.appView.showNotification('Canción eliminada', 'success');
  }

  private editSong(song: any): void {
    const currentPlaylistId = this.playlistService.getCurrentPlaylist()?.id;
    if (!currentPlaylistId) return;

    this.playlistService.updateSong(currentPlaylistId, song.id, song);
    const playlist = this.playlistService.getPlaylist(currentPlaylistId);
    if (playlist) {
      this.player.loadPlaylist(playlist);
      this.appView.updateSongsView(playlist.songs, this.player.getCurrentSong()?.id || null);
    }

    this.appView.showNotification('Canción actualizada', 'success');
  }

  private async addSongsToCurrentPlaylist(): Promise<void> {
    const currentPlaylist = this.playlistService.getCurrentPlaylist();
    if (!currentPlaylist) {
      this.appView.showNotification('Selecciona una playlist primero', 'warning');
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.mp3,.flac,audio/*';

    fileInput.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      try {
        const songs = await this.localFileImporter.import(files);
        this.playlistService.addSongsToPlaylist(currentPlaylist.id, songs);

        const updatedPlaylist = this.playlistService.getPlaylist(currentPlaylist.id);
        if (updatedPlaylist) {
          this.player.loadPlaylist(updatedPlaylist);
          this.appView.updateSongsView(updatedPlaylist.songs, null);
        }

        this.appView.showNotification(`${songs.length} canción(es) agregadas`, 'success');
      } catch (error) {
        this.appView.showNotification('Error al agregar canciones', 'error');
        console.error(error);
      }
    });

    fileInput.click();
  }

  private async importFiles(): Promise<void> {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.m3u,.m3u8,.mp3,.flac';
    fileInput.multiple = true;

    fileInput.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      try {
        const selectedFiles = Array.from(files);
        const m3uFiles = selectedFiles.filter((file) => /\.m3u8?$/i.test(file.name));
        const audioFiles = selectedFiles.filter(
          (file) => file.type.startsWith('audio/') || /\.(mp3|flac)$/i.test(file.name)
        );

        let importedSongsCount = 0;
        let createdPlaylistsCount = 0;
        let playlistToOpenId: string | null = null;

        for (const m3uFile of m3uFiles) {
          const songs = await this.m3uImporter.import(m3uFile);
          if (songs.length === 0) {
            continue;
          }

          const playlistName = m3uFile.name.replace(/\.[^/.]+$/, '');
          const createdPlaylist = this.playlistService.importPlaylistFromM3U(playlistName, 'Importada desde M3U', songs);

          createdPlaylistsCount += 1;
          importedSongsCount += songs.length;

          if (!playlistToOpenId) {
            playlistToOpenId = createdPlaylist.id;
          }
        }

        if (audioFiles.length > 0) {
          let targetPlaylist = this.playlistService.getCurrentPlaylist();

          if (!targetPlaylist) {
            const generatedName = `Importadas ${new Date().toLocaleDateString('es-ES')}`;
            targetPlaylist = this.playlistService.createPlaylist(generatedName, 'Canciones importadas');
            createdPlaylistsCount += 1;

            if (!playlistToOpenId) {
              playlistToOpenId = targetPlaylist.id;
            }
          }

          const audioSongs = await this.localFileImporter.import(this.toFileList(audioFiles));

          if (audioSongs.length > 0 && targetPlaylist) {
            this.playlistService.addSongsToPlaylist(targetPlaylist.id, audioSongs);
            importedSongsCount += audioSongs.length;
            playlistToOpenId = targetPlaylist.id;
          }
        }

        if (importedSongsCount === 0) {
          this.appView.showNotification('No se encontraron canciones válidas para importar', 'warning');
          return;
        }

        const playlists = this.playlistService.getAllPlaylists();
        this.appView.updatePlaylistsView(playlists);

        if (playlistToOpenId) {
          this.selectPlaylist(playlistToOpenId);
        }

        if (createdPlaylistsCount > 0) {
          this.appView.showNotification(
            `Importación completada: ${importedSongsCount} canción(es) en ${createdPlaylistsCount} playlist(s)`,
            'success'
          );
        } else {
          this.appView.showNotification(`${importedSongsCount} canción(es) importada(s)`, 'success');
        }
      } catch (error) {
        this.appView.showNotification('Error al importar', 'error');
        console.error(error);
      }
    });

    fileInput.click();
  }

  private downloadPlaylistAsM3U(playlistId: string): void {
    const m3uContent = this.playlistService.exportPlaylistToM3U(playlistId);
    const playlist = this.playlistService.getPlaylist(playlistId);

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(m3uContent)}`);
    element.setAttribute('download', `${playlist?.name || 'playlist'}.m3u`);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    this.appView.showNotification('Playlist descargada', 'success');
  }

  private toFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  }

  private async rehydrateLocalSongs(playlists: ReturnType<PlaylistService['getAllPlaylists']>): Promise<void> {
    for (const playlist of playlists) {
      let playlistChanged = false;
      let migratedToM3U = false;

      for (const song of playlist.songs) {
        if (song.source !== 'local') {
          continue;
        }

        if (!song.blobId) {
          if (this.canUseM3URedirect(song.audioUrl)) {
            song.source = 'm3u';
            song.isFileAvailable = true;
            song.missingReason = undefined;
            migratedToM3U = true;
          } else {
            song.isFileAvailable = false;
            song.missingReason = 'Archivo local legado requiere re-vincular archivo';
          }

          playlistChanged = true;
          continue;
        }

        try {
          const blob = await this.storageService.getAudioBlob(song.blobId);
          if (!blob) {
            song.isFileAvailable = false;
            song.missingReason = 'Archivo local no encontrado';
            continue;
          }

          song.audioUrl = URL.createObjectURL(blob);
          song.isFileAvailable = true;
          song.missingReason = undefined;
          playlistChanged = true;
        } catch (error) {
          song.isFileAvailable = false;
          song.missingReason = 'Error recuperando archivo local';
          playlistChanged = true;
          console.error(`No se pudo recuperar el audio local: ${song.title}`, error);
        }
      }

      if (playlistChanged) {
        playlist.m3uContent = this.playlistService.exportPlaylistToM3U(playlist.id);
        this.playlistService.updatePlaylist(playlist.id, {
          songs: playlist.songs,
          m3uContent: playlist.m3uContent,
          source: migratedToM3U || playlist.source === 'imported' ? 'imported' : 'local',
        });
      }
    }
  }

  private canUseM3URedirect(audioUrl: string | undefined): boolean {
    if (!audioUrl) return false;
    return !audioUrl.startsWith('blob:');
  }

  private async tryRelinkSongFile(songId: string): Promise<boolean> {
    const currentPlaylistId = this.playlistService.getCurrentPlaylist()?.id;
    if (!currentPlaylistId) {
      return false;
    }

    const currentPlaylist = this.playlistService.getPlaylist(currentPlaylistId);
    const songToRelink = currentPlaylist?.songs.find((song) => song.id === songId);
    if (!songToRelink) {
      return false;
    }

    const shouldRelink = window.confirm(
      `La canción "${songToRelink.title}" no está disponible. ¿Quieres seleccionar el archivo para recuperarla?`
    );
    if (!shouldRelink) {
      return false;
    }

    const selectedFile = await this.promptForSingleAudioFile();
    if (!selectedFile) {
      return false;
    }

    try {
      const recoveredSongs = await this.localFileImporter.import(this.toFileList([selectedFile]));
      if (recoveredSongs.length === 0) {
        this.appView.showNotification('No se pudo recuperar el archivo seleccionado', 'error');
        return false;
      }

      const recoveredSong = recoveredSongs[0];
      this.playlistService.updateSong(currentPlaylistId, songId, {
        audioUrl: recoveredSong.audioUrl,
        blobId: recoveredSong.blobId,
        duration: recoveredSong.duration || songToRelink.duration,
        source: 'local',
        isFileAvailable: true,
        missingReason: undefined,
      });

      const updatedPlaylist = this.playlistService.getPlaylist(currentPlaylistId);
      if (updatedPlaylist) {
        this.player.loadPlaylist(updatedPlaylist);
        this.appView.setCurrentPlaylist(updatedPlaylist);
        this.appView.updateSongsView(updatedPlaylist.songs, songId);

        const recoveredIndex = updatedPlaylist.songs.findIndex((song) => song.id === songId);
        if (recoveredIndex >= 0) {
          this.player.playSong(recoveredIndex, false);
        }
      }

      this.appView.showNotification('Canción re-vinculada y guardada correctamente', 'success');
      return true;
    } catch (error) {
      console.error('Error re-vinculando canción', error);
      this.appView.showNotification('Error al re-vincular la canción', 'error');
      return false;
    }
  }

  private promptForSingleAudioFile(): Promise<File | null> {
    return new Promise((resolve) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.mp3,.flac,audio/*';
      fileInput.multiple = false;

      fileInput.addEventListener(
        'change',
        () => {
          const selected = fileInput.files?.[0] || null;
          resolve(selected);
        },
        { once: true }
      );

      fileInput.click();
    });
  }

  private restoreAndTryPlayRememberedSong(): void {
    const rememberedSong = this.playlistService.getCurrentSong();
    if (!rememberedSong) {
      return;
    }

    const currentPlaylist = this.player.getCurrentPlaylist();
    if (!currentPlaylist) {
      return;
    }

    const songIndex = currentPlaylist.songs.findIndex((song) => song.id === rememberedSong.id);
    if (songIndex === -1) {
      return;
    }

    this.player.playSong(songIndex, false);
    this.appView.updateSongsView(currentPlaylist.songs, rememberedSong.id);
    this.appView.updatePlayerState();
  }

  private syncCurrentSongWithStorage(): void {
    const currentSong = this.player.getCurrentSong();
    if (!currentSong) {
      return;
    }

    this.playlistService.setCurrentSong(currentSong.id);

    const currentPlaylist = this.player.getCurrentPlaylist();
    if (currentPlaylist) {
      this.appView.updateSongsView(currentPlaylist.songs, currentSong.id);
    }

    this.appView.updatePlayerState();
  }

  private reorderCurrentPlaylistSongs(fromIndex: number, toIndex: number): void {
    const currentPlaylist = this.playlistService.getCurrentPlaylist();
    if (!currentPlaylist) {
      return;
    }

    this.playlistService.moveSong(currentPlaylist.id, fromIndex, toIndex);
    const updatedPlaylist = this.playlistService.getPlaylist(currentPlaylist.id);
    if (!updatedPlaylist) {
      return;
    }

    this.player.updatePlaylistOrder(updatedPlaylist);
    this.appView.setCurrentPlaylist(updatedPlaylist);
    this.appView.updateSongsView(updatedPlaylist.songs, this.player.getCurrentSong()?.id || null);
    this.appView.updatePlayerState();
  }

  getPlayer(): Player {
    return this.player;
  }

  getPlaylistService(): PlaylistService {
    return this.playlistService;
  }
}

export async function runAppController(): Promise<void> {
  AppController.getInstance();
  console.log('[Karden Music Player] Iniciado');
}
