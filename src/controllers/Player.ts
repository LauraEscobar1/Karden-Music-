import { ISong, IUserPlaylist, IEventEmitter } from '@interfaces';

/**
 * Eventos del reproductor
 */
export type PlayerEvent = 'play' | 'pause' | 'stop' | 'next' | 'previous' | 'timeupdate' | 'ended' | 'volumechange' | 'playlistchange';

/**
 * Tipos de repetición
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Listeners para eventos del reproductor
 */
type EventListener = (...args: any[]) => void;

/**
 * Controlador del reproductor de música (Singleton)
 */
export class Player implements IEventEmitter {
  private static instance: Player | null = null;
  private audioElement: HTMLAudioElement;
  private currentPlaylist: IUserPlaylist | null = null;
  private currentSongIndex: number = 0;
  private isPlaying: boolean = false;
  private eventListeners: Map<string, EventListener[]> = new Map();
  private repeatMode: RepeatMode = 'off';
  private isShuffle: boolean = false;
  private shuffleOrder: number[] = [];
  private shufflePosition: number = 0;
  private volumeLevel: number = 1;
  private updateIntervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.audioElement = new Audio();
    this.setupAudioEventListeners();
  }

  static getInstance(): Player {
    if (!Player.instance) {
      Player.instance = new Player();
    }
    return Player.instance;
  }

  private setupAudioEventListeners(): void {
    this.audioElement.addEventListener('ended', () => this.handleSongEnded());
    this.audioElement.addEventListener('timeupdate', () => this.emit('timeupdate'));
    this.audioElement.addEventListener('volumechange', () => this.emit('volumechange'));
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.emit('play');
    });
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.emit('pause');
    });
    this.audioElement.addEventListener('error', (error) => {
      console.error('Error de reproducción:', error);
      this.isPlaying = false;
      this.emit('pause');
    });
  }

  loadPlaylist(playlist: IUserPlaylist): void {
    this.currentPlaylist = playlist;
    this.currentSongIndex = 0;
    this.rebuildShuffleOrder(this.currentSongIndex);
    this.isPlaying = false;
    this.audioElement.pause();
    this.emit('playlistchange');
  }

  updatePlaylistOrder(playlist: IUserPlaylist): void {
    const currentSongId = this.getCurrentSong()?.id || null;
    this.currentPlaylist = playlist;

    if (currentSongId) {
      const updatedIndex = playlist.songs.findIndex((song) => song.id === currentSongId);
      this.currentSongIndex = updatedIndex >= 0 ? updatedIndex : 0;
    } else {
      this.currentSongIndex = 0;
    }

    this.rebuildShuffleOrder(this.currentSongIndex);

    this.emit('playlistchange');
  }

  play(): void {
    if (!this.currentPlaylist || this.currentPlaylist.songs.length === 0) {
      return;
    }

    if (this.audioElement.src) {
      this.audioElement.play().catch((error) => {
        console.error('Error al reproducir:', error);
      });
    } else {
      this.playSong(this.currentSongIndex);
    }
  }

  pause(): void {
    this.audioElement.pause();
  }

  stop(): void {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
    this.emit('stop');
  }

  playSong(songIndex: number, autoPlay: boolean = true): void {
    if (!this.currentPlaylist || songIndex < 0 || songIndex >= this.currentPlaylist.songs.length) {
      return;
    }

    this.currentSongIndex = songIndex;
    if (this.isShuffle) {
      const position = this.shuffleOrder.indexOf(songIndex);
      if (position >= 0) {
        this.shufflePosition = position;
      }
    }

    const song = this.currentPlaylist.songs[songIndex];

    if (song && song.audioUrl && song.isFileAvailable !== false) {
      this.audioElement.src = song.audioUrl;
      if (autoPlay) {
        this.play();
      } else {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.emit('playlistchange');
      }
    }
  }

  next(): void {
    if (!this.currentPlaylist || this.currentPlaylist.songs.length === 0) {
      return;
    }

    if (this.isShuffle) {
      if (this.shuffleOrder.length !== this.currentPlaylist.songs.length) {
        this.rebuildShuffleOrder(this.currentSongIndex);
      }

      this.shufflePosition = (this.shufflePosition + 1) % this.shuffleOrder.length;
      this.currentSongIndex = this.shuffleOrder[this.shufflePosition];
    } else {
      this.currentSongIndex = (this.currentSongIndex + 1) % this.currentPlaylist.songs.length;
    }

    this.playSong(this.currentSongIndex);
    this.emit('next');
  }

  previous(): void {
    if (!this.currentPlaylist || this.currentPlaylist.songs.length === 0) {
      return;
    }

    if (this.isShuffle) {
      if (this.shuffleOrder.length !== this.currentPlaylist.songs.length) {
        this.rebuildShuffleOrder(this.currentSongIndex);
      }

      this.shufflePosition = (this.shufflePosition - 1 + this.shuffleOrder.length) % this.shuffleOrder.length;
      this.currentSongIndex = this.shuffleOrder[this.shufflePosition];
    } else {
      this.currentSongIndex = (this.currentSongIndex - 1 + this.currentPlaylist.songs.length) % this.currentPlaylist.songs.length;
    }

    this.playSong(this.currentSongIndex);
    this.emit('previous');
  }

  getCurrentSong(): ISong | null {
    if (!this.currentPlaylist || this.currentSongIndex < 0 || this.currentSongIndex >= this.currentPlaylist.songs.length) {
      return null;
    }

    return this.currentPlaylist.songs[this.currentSongIndex] || null;
  }

  getCurrentPlaylist(): IUserPlaylist | null {
    return this.currentPlaylist;
  }

  getCurrentSongIndex(): number {
    return this.currentSongIndex;
  }

  seek(time: number): void {
    this.audioElement.currentTime = Math.max(0, Math.min(time, this.audioElement.duration || 0));
  }

  getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  getDuration(): number {
    return isNaN(this.audioElement.duration) ? 0 : this.audioElement.duration;
  }

  setVolume(volume: number): void {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = this.volumeLevel;
  }

  getVolume(): number {
    return this.volumeLevel;
  }

  cycleRepeatMode(): RepeatMode {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(this.repeatMode);
    this.repeatMode = modes[(currentIndex + 1) % modes.length];
    return this.repeatMode;
  }

  getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  toggleShuffle(): boolean {
    this.isShuffle = !this.isShuffle;

    if (this.isShuffle) {
      this.rebuildShuffleOrder(this.currentSongIndex);
    } else {
      this.shuffleOrder = [];
      this.shufflePosition = 0;
    }

    this.emit('playlistchange');
    return this.isShuffle;
  }

  isShuffling(): boolean {
    return this.isShuffle;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getPlayerState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.audioElement.currentTime,
      duration: this.getDuration(),
      volume: this.volumeLevel,
      repeatMode: this.repeatMode,
      shuffle: this.isShuffle,
      currentSongIndex: this.currentSongIndex,
      currentSong: this.getCurrentSong(),
    };
  }

  private handleSongEnded(): void {
    if (this.repeatMode === 'one') {
      this.playSong(this.currentSongIndex);
    } else {
      this.next();
    }
    this.emit('ended');
  }

  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: EventListener): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach((listener) => listener(...args));
    }
  }

  destroy(): void {
    this.stop();
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
    this.eventListeners.clear();
  }

  private rebuildShuffleOrder(anchorIndex: number): void {
    if (!this.currentPlaylist || this.currentPlaylist.songs.length === 0) {
      this.shuffleOrder = [];
      this.shufflePosition = 0;
      return;
    }

    const indices = this.currentPlaylist.songs.map((_, index) => index);
    const safeAnchor = Math.max(0, Math.min(anchorIndex, indices.length - 1));

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const anchorPos = indices.indexOf(safeAnchor);
    if (anchorPos > 0) {
      indices.splice(anchorPos, 1);
      indices.unshift(safeAnchor);
    } else if (anchorPos === -1) {
      indices.unshift(safeAnchor);
    }

    this.shuffleOrder = indices;
    this.shufflePosition = 0;
  }
}
