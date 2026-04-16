import { ISong, IUserPlaylist } from '@interfaces';
import { PlaylistService } from '@services/PlaylistService';
import { Player } from '@controllers/Player';
import {
  PlaylistListView,
  SongListView,
  PlayerControlsView,
  EditSongModalView,
  PlaylistModalView,
  createButton,
  createIcon,
  showNotification,
} from '@views/components';

export class AppView {
  private rootElement: HTMLElement;
  private playlistService: PlaylistService;
  private player: Player;
  private playlistListView!: PlaylistListView;
  private songListView!: SongListView;
  private playerControlsView!: PlayerControlsView;
  private editSongModalView!: EditSongModalView;
  private playlistModalView!: PlaylistModalView;
  private currentPlaylistImage!: HTMLImageElement;
  private currentPlaylistImagePlaceholder!: HTMLSpanElement;
  private currentPlaylistName!: HTMLHeadingElement;
  private currentPlaylistMeta!: HTMLParagraphElement;
  private onSelectPlaylistCallback: (playlistId: string) => void = () => {};
  private onPlaySongCallback: (songIndex: number) => void = () => {};
  private onDeletePlaylistCallback: (playlistId: string) => void = () => {};
  private onDeleteSongCallback: (songId: string) => void = () => {};
  private onEditSongCallback: (song: ISong) => void = () => {};
  private onAddSongsCallback: () => void = () => {};
  private onImportFilesCallback: () => void = () => {};
  private onMoveQueueSongCallback: (fromIndex: number, toIndex: number) => void = () => {};

  constructor(rootSelector: string, playlistService: PlaylistService, player: Player) {
    this.playlistService = playlistService;
    this.player = player;
    this.rootElement = document.querySelector(rootSelector) || document.body;
    this.render();
  }

  private render(): void {
    this.rootElement.innerHTML = '';
    this.rootElement.className = 'h-screen bg-secondary flex flex-col';

    const header = this.createHeader();
    this.rootElement.appendChild(header);

    const mainContent = document.createElement('div');
    mainContent.className = 'flex-1 overflow-hidden flex gap-0';

    const sidebar = document.createElement('div');
    sidebar.className = 'w-60 bg-tertiary border-r border-yt-border p-4 flex flex-col max-h-full overflow-y-auto';

    const playlistsTitle = document.createElement('h2');
    playlistsTitle.className = 'font-bold text-sm mb-4 text-yt-gray uppercase tracking-wide';
    playlistsTitle.textContent = 'Mis Playlists';

    const createPlaylistBtn = createButton('+ Nueva Playlist', {
      class: 'w-full mb-4 bg-primary text-white hover:bg-red-600 transition rounded-full font-semibold',
      onClick: () => this.playlistModalView.openForCreate(),
    });

    const playlistsContainer = document.createElement('div');
    playlistsContainer.id = 'playlists-list';
    playlistsContainer.className = 'flex-1 overflow-y-auto';

    this.playlistListView = new PlaylistListView(playlistsContainer);

    sidebar.appendChild(playlistsTitle);
    sidebar.appendChild(createPlaylistBtn);
    sidebar.appendChild(playlistsContainer);

    const mainArea = document.createElement('div');
    mainArea.className = 'flex-1 flex flex-col gap-0 overflow-hidden';

    const songsSection = document.createElement('div');
    songsSection.className = 'flex-1 bg-secondary p-4 flex flex-col overflow-hidden';

    const songsHeader = document.createElement('div');
    songsHeader.className = 'flex justify-between items-center mb-4';

    const currentPlaylistInfo = document.createElement('div');
    currentPlaylistInfo.className = 'mb-4 p-3 rounded-lg bg-white border border-yt-border flex items-center gap-3';

    const playlistCoverContainer = document.createElement('div');
    playlistCoverContainer.className = 'w-16 h-16 rounded-lg overflow-hidden bg-yt-light-gray flex items-center justify-center shrink-0';

    this.currentPlaylistImage = document.createElement('img');
    this.currentPlaylistImage.className = 'w-full h-full object-cover hidden';

    this.currentPlaylistImagePlaceholder = document.createElement('span');
    this.currentPlaylistImagePlaceholder.className = 'text-yt-gray font-bold';
    this.currentPlaylistImagePlaceholder.textContent = '♪';

    playlistCoverContainer.appendChild(this.currentPlaylistImage);
    playlistCoverContainer.appendChild(this.currentPlaylistImagePlaceholder);

    const playlistTextInfo = document.createElement('div');
    playlistTextInfo.className = 'min-w-0';

    this.currentPlaylistName = document.createElement('h3');
    this.currentPlaylistName.className = 'font-bold text-yt-dark truncate';
    this.currentPlaylistName.textContent = 'Sin playlist seleccionada';

    this.currentPlaylistMeta = document.createElement('p');
    this.currentPlaylistMeta.className = 'text-sm text-yt-gray';
    this.currentPlaylistMeta.textContent = '0 canciones';

    playlistTextInfo.appendChild(this.currentPlaylistName);
    playlistTextInfo.appendChild(this.currentPlaylistMeta);

    currentPlaylistInfo.appendChild(playlistCoverContainer);
    currentPlaylistInfo.appendChild(playlistTextInfo);

    const songsTitle = document.createElement('h2');
    songsTitle.className = 'font-bold text-lg text-yt-dark';
    songsTitle.textContent = 'Canciones';

    const addSongBtn = createButton('+ Agregar', {
      class: 'bg-primary text-white hover:bg-red-600 transition rounded-full font-semibold px-4 py-2',
      onClick: () => this.onAddSongsCallback(),
    });

    songsHeader.appendChild(songsTitle);
    songsHeader.appendChild(addSongBtn);

    const songsContainer = document.createElement('div');
    songsContainer.id = 'songs-list';
    songsContainer.className = 'flex-1 overflow-y-auto';

    this.songListView = new SongListView(songsContainer);

    songsSection.appendChild(currentPlaylistInfo);
    songsSection.appendChild(songsHeader);
    songsSection.appendChild(songsContainer);

    const playerContainer = document.createElement('div');
    playerContainer.id = 'player-controls';
    playerContainer.className = 'bg-tertiary border-t border-yt-border';

    this.playerControlsView = new PlayerControlsView(playerContainer);

    mainArea.appendChild(songsSection);
    mainArea.appendChild(playerContainer);

    mainContent.appendChild(sidebar);
    mainContent.appendChild(mainArea);

    this.rootElement.appendChild(mainContent);

    this.editSongModalView = new EditSongModalView(this.rootElement);
    this.playlistModalView = new PlaylistModalView(this.rootElement);

    this.setupComponentCallbacks();
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'bg-secondary border-b border-yt-border text-yt-dark p-4';

    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto flex justify-between items-center';

    const title = document.createElement('h1');
    title.className = 'text-2xl font-bold';
    title.textContent = '🎵 Karden Music';

    const actions = document.createElement('div');
    actions.className = 'flex gap-3';

    const importBtn = createButton('Importar', {
      class: 'bg-primary text-white hover:bg-red-600 transition px-4 py-2 rounded-full font-semibold',
      onClick: () => this.onImportFilesCallback(),
    });

    actions.appendChild(importBtn);

    container.appendChild(title);
    container.appendChild(actions);

    header.appendChild(container);

    return header;
  }

  private setupComponentCallbacks(): void {
    this.playlistListView.setOnSelectPlaylist((playlist) => this.onSelectPlaylistCallback(playlist.id));
    this.playlistListView.setOnDeletePlaylist((playlistId) => this.onDeletePlaylistCallback(playlistId));
    this.playlistListView.setOnEditPlaylist((playlist) => this.playlistModalView.openForEdit(playlist));

    this.songListView.setOnPlaySong((index) => this.onPlaySongCallback(index));
    this.songListView.setOnDeleteSong((songId) => this.onDeleteSongCallback(songId));
    this.songListView.setOnEditSong((song) => this.editSongModalView.open(song));

    this.editSongModalView.setOnSave((song, updates) => {
      const updated = { ...song, ...updates };
      this.onEditSongCallback(updated as any);
    });

    this.playlistModalView.setOnSave((name, coverImage) => this.savePlaylist(name, coverImage));

    this.playerControlsView.setOnPlay(() => this.player.play());
    this.playerControlsView.setOnPause(() => this.player.pause());
    this.playerControlsView.setOnNext(() => this.player.next());
    this.playerControlsView.setOnPrevious(() => this.player.previous());
    this.playerControlsView.setOnTimeChange((time) => this.player.seek(time));
    this.playerControlsView.setOnVolumeChange((volume) => this.player.setVolume(volume));
    this.playerControlsView.setOnToggleLoop(() => this.player.cycleRepeatMode());
    this.playerControlsView.setOnToggleShuffle(() => this.player.toggleShuffle());
    this.playerControlsView.setOnMoveQueueSong((fromIndex, toIndex) => this.onMoveQueueSongCallback(fromIndex, toIndex));
  }

  updatePlaylistsView(playlists: IUserPlaylist[]): void {
    this.playlistListView.update(playlists);
  }

  updateSongsView(songs: ISong[], currentSongId: string | null): void {
    this.songListView.update(songs as any, currentSongId);
  }

  updatePlayerState(): void {
    const state = this.player.getPlayerState();
    this.playerControlsView.update({
      currentSong: state.currentSong as any,
      currentSongId: state.currentSong?.id || null,
      queueSongs: this.player.getCurrentPlaylist()?.songs || [],
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
      isLooping: state.repeatMode !== 'off',
      isShuffle: state.shuffle,
    });
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    showNotification(message, type);
  }

  setCurrentPlaylist(playlist: IUserPlaylist | null): void {
    if (!playlist) {
      this.currentPlaylistName.textContent = 'Sin playlist seleccionada';
      this.currentPlaylistMeta.textContent = '0 canciones';
      this.currentPlaylistImage.classList.add('hidden');
      this.currentPlaylistImagePlaceholder.classList.remove('hidden');
      return;
    }

    this.currentPlaylistName.textContent = playlist.name;
    const totalSongs = playlist.songs?.length || 0;
    this.currentPlaylistMeta.textContent = `${totalSongs} canción${totalSongs !== 1 ? 'es' : ''}`;

    if (playlist.coverImage) {
      this.currentPlaylistImage.src = playlist.coverImage;
      this.currentPlaylistImage.classList.remove('hidden');
      this.currentPlaylistImagePlaceholder.classList.add('hidden');
    } else {
      this.currentPlaylistImage.classList.add('hidden');
      this.currentPlaylistImagePlaceholder.classList.remove('hidden');
    }
  }

  private savePlaylist(name: string, coverImage: string): void {
    let selectedPlaylistId: string | null = null;

    if (this.playlistModalView.isInEditMode()) {
      const editingPlaylistId = this.playlistModalView.getCurrentPlaylistId();
      if (editingPlaylistId) {
        this.playlistService.updatePlaylist(editingPlaylistId, { name, coverImage } as any);
        selectedPlaylistId = editingPlaylistId;
      }
    } else {
      const createdPlaylist = this.playlistService.createPlaylist(name, '', coverImage);
      selectedPlaylistId = createdPlaylist.id;
    }

    const playlists = this.playlistService.getAllPlaylists();
    this.updatePlaylistsView(playlists);

    if (selectedPlaylistId) {
      this.onSelectPlaylistCallback(selectedPlaylistId);
    }

    this.showNotification('Playlist guardada', 'success');
  }

  onSelectPlaylist(callback: (playlistId: string) => void): void {
    this.onSelectPlaylistCallback = callback;
  }

  onPlaySong(callback: (songIndex: number) => void): void {
    this.onPlaySongCallback = callback;
  }

  onDeletePlaylist(callback: (playlistId: string) => void): void {
    this.onDeletePlaylistCallback = callback;
  }

  onDeleteSong(callback: (songId: string) => void): void {
    this.onDeleteSongCallback = callback;
  }

  onEditSong(callback: (song: ISong) => void): void {
    this.onEditSongCallback = callback;
  }

  onAddSongsToPlaylist(callback: () => void): void {
    this.onAddSongsCallback = callback;
  }

  onImportFiles(callback: () => void): void {
    this.onImportFilesCallback = callback;
  }

  onMoveQueueSong(callback: (fromIndex: number, toIndex: number) => void): void {
    this.onMoveQueueSongCallback = callback;
  }
}
