import { Playlist } from '@models';
import { createButton, createIcon, createCard } from './UIComponents';

/**
 * Componente para mostrar la lista de playlists
 */
export class PlaylistListView {
  private container: HTMLElement;
  private playlists: Playlist[] = [];
  private onSelectPlaylist: (playlist: Playlist) => void = () => {};
  private onDeletePlaylist: (playlistId: string) => void = () => {};
  private onEditPlaylist: (playlist: Playlist) => void = () => {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Establece el callback para seleccionar una playlist
   */
  setOnSelectPlaylist(callback: (playlist: Playlist) => void): void {
    this.onSelectPlaylist = callback;
  }

  /**
   * Establece el callback para eliminar una playlist
   */
  setOnDeletePlaylist(callback: (playlistId: string) => void): void {
    this.onDeletePlaylist = callback;
  }

  /**
   * Establece el callback para editar una playlist
   */
  setOnEditPlaylist(callback: (playlist: Playlist) => void): void {
    this.onEditPlaylist = callback;
  }

  /**
   * Actualiza la lista de playlists
   */
  update(playlists: Playlist[]): void {
    this.playlists = playlists;
    this.render();
  }

  /**
   * Renderiza el componente
   */
  private render(): void {
    this.container.innerHTML = '';

    if (this.playlists.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'text-yt-gray text-center py-8';
      emptyMessage.textContent = 'No hay playlists. ¡Crea una!';
      this.container.appendChild(emptyMessage);
      return;
    }

    const list = document.createElement('div');
    list.className = 'space-y-3';

    this.playlists.forEach((playlist) => {
      const item = this.createPlaylistItem(playlist);
      list.appendChild(item);
    });

    this.container.appendChild(list);
  }

  /**
   * Crea un elemento de playlist
   */
  private createPlaylistItem(playlist: Playlist): HTMLElement {
    const card = createCard({class: 'bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer flex justify-between items-center'});

    const info = document.createElement('div');
    info.className = 'flex-1 cursor-pointer';
    info.addEventListener('click', () => this.onSelectPlaylist(playlist));

    const name = document.createElement('h3');
    name.className = 'font-semibold text-yt-dark';
    name.textContent = playlist.name;

    const songCount = document.createElement('p');
    songCount.className = 'text-sm text-yt-gray';
    songCount.textContent = `${playlist.getSongCount()} canción${playlist.getSongCount() !== 1 ? 'es' : ''}`;

    info.appendChild(name);
    info.appendChild(songCount);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2';

    const editButton = createButton('', {
      class: 'p-2 text-primary hover:bg-red-50 rounded transition',
      onClick: (e) => {
        e.stopPropagation();
        this.onEditPlaylist(playlist);
      },
    });
    editButton.appendChild(createIcon('edit'));

    const deleteButton = createButton('', {
      class: 'p-2 text-primary hover:bg-red-50 rounded transition',
      onClick: (e) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar la playlist "${playlist.name}"?`)) {
          this.onDeletePlaylist(playlist.id);
        }
      },
    });
    deleteButton.appendChild(createIcon('delete'));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }
}
