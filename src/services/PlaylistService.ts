import { ISong, IUserPlaylist, ILibraryState } from '@interfaces';
import { StorageService } from '@utils/StorageManager';
import { generateUUID } from '@utils';

export class PlaylistService {
  private storageService: StorageService;
  private libraryState: ILibraryState;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
    this.libraryState = this.storageService.getLibraryState();
  }

  createPlaylist(name: string, description: string = '', coverImage: string = ''): IUserPlaylist {
    const playlist: IUserPlaylist = {
      id: generateUUID(),
      name,
      description,
      coverImage,
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: 'local',
    };

    this.libraryState.playlists.push(playlist);
    this.storageService.saveLibraryState(this.libraryState);
    return playlist;
  }

  getAllPlaylists(): IUserPlaylist[] {
    return this.libraryState.playlists;
  }

  getPlaylist(playlistId: string): IUserPlaylist | null {
    return this.libraryState.playlists.find((p) => p.id === playlistId) || null;
  }

  deletePlaylist(playlistId: string): void {
    this.libraryState.playlists = this.libraryState.playlists.filter((p) => p.id !== playlistId);
    if (this.libraryState.currentPlaylistId === playlistId) {
      this.libraryState.currentPlaylistId = null;
    }
    this.storageService.saveLibraryState(this.libraryState);
  }

  updatePlaylist(playlistId: string, updates: Partial<IUserPlaylist>): void {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return;

    Object.assign(playlist, updates, {
      updatedAt: Date.now(),
    });

    this.storageService.saveLibraryState(this.libraryState);
  }

  addSongsToPlaylist(playlistId: string, songs: ISong[]): void {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return;

    playlist.songs.push(...songs);
    playlist.updatedAt = Date.now();
    this.storageService.saveLibraryState(this.libraryState);
  }

  removeSongFromPlaylist(playlistId: string, songId: string): void {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return;

    playlist.songs = playlist.songs.filter((s) => s.id !== songId);
    this.storageService.saveLibraryState(this.libraryState);
  }

  updateSong(playlistId: string, songId: string, updates: Partial<ISong>): void {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return;

    const song = playlist.songs.find((s) => s.id === songId);
    if (!song) return;

    Object.assign(song, updates);
    this.storageService.saveLibraryState(this.libraryState);
  }

  moveSong(playlistId: string, fromIndex: number, toIndex: number): void {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return;

    const [song] = playlist.songs.splice(fromIndex, 1);
    playlist.songs.splice(toIndex, 0, song);
    this.storageService.saveLibraryState(this.libraryState);
  }

  searchSongs(playlistId: string, query: string): ISong[] {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return [];

    const lowerQuery = query.toLowerCase();
    return playlist.songs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist?.toLowerCase().includes(lowerQuery) ||
        song.album?.toLowerCase().includes(lowerQuery)
    );
  }

  exportPlaylistToM3U(playlistId: string): string {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return '';

    let m3u = '#EXTM3U\n';
    playlist.songs.forEach((song) => {
      m3u += `#EXTINF:${Math.floor(song.duration)},${song.artist || ''} - ${song.title}\n`;
      m3u += `${song.audioUrl}\n`;
    });

    return m3u;
  }

  importPlaylistFromM3U(name: string, description: string, songs: ISong[], coverImage: string = ''): IUserPlaylist {
    const playlist = this.createPlaylist(name, description, coverImage);
    this.addSongsToPlaylist(playlist.id, songs);
    return playlist;
  }

  setCurrentPlaylist(playlistId: string): void {
    this.libraryState.currentPlaylistId = playlistId;
    this.storageService.saveLibraryState(this.libraryState);
  }

  getCurrentPlaylist(): IUserPlaylist | null {
    if (!this.libraryState.currentPlaylistId) return null;
    return this.getPlaylist(this.libraryState.currentPlaylistId);
  }

  setCurrentSong(songId: string): void {
    this.libraryState.currentSongId = songId;
    this.storageService.saveLibraryState(this.libraryState);
  }

  getCurrentSong(): ISong | null {
    const playlist = this.getCurrentPlaylist();
    if (!playlist || !this.libraryState.currentSongId) return null;
    return playlist.songs.find((s) => s.id === this.libraryState.currentSongId) || null;
  }
}
