import { IUserPlaylist } from '@interfaces';
import { createButton, createIcon, createCard } from './UIComponents';

/**
 * Componente para mostrar la lista de playlists
 */
export class PlaylistListView {
  private container: HTMLElement;
  private playlists: IUserPlaylist[] = [];
  private onSelectPlaylist: (playlist: IUserPlaylist) => void = () => {};
  private onDeletePlaylist: (playlistId: string) => void = () => {};
  private onEditPlaylist: (playlist: IUserPlaylist) => void = () => {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Establece el callback para seleccionar una playlist
   */
  setOnSelectPlaylist(callback: (playlist: IUserPlaylist) => void): void {
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
  setOnEditPlaylist(callback: (playlist: IUserPlaylist) => void): void {
    this.onEditPlaylist = callback;
  }

  /**
   * Actualiza la lista de playlists
   */
  update(playlists: IUserPlaylist[]): void {
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
  private createPlaylistItem(playlist: IUserPlaylist): HTMLElement {
    const card = createCard({class: 'bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer flex justify-between items-center'});

    const info = document.createElement('div');
    info.className = 'flex items-center gap-3 flex-1 cursor-pointer';
    info.addEventListener('click', () => this.onSelectPlaylist(playlist));

    const cover = document.createElement('div');
    cover.className = 'w-10 h-10 rounded-md overflow-hidden bg-yt-light-gray flex items-center justify-center shrink-0';

    if (playlist.coverImage) {
      const image = document.createElement('img');
      image.src = playlist.coverImage;
      image.alt = `Portada de ${playlist.name}`;
      image.className = 'w-full h-full object-cover';
      cover.appendChild(image);
    } else {
      cover.textContent = '♪';
      cover.classList.add('text-yt-gray', 'font-bold');
    }

    const textInfo = document.createElement('div');
    textInfo.className = 'min-w-0';

    const name = document.createElement('h3');
    name.className = 'font-semibold text-yt-dark truncate';
    name.textContent = playlist.name;

    const songCount = document.createElement('p');
    songCount.className = 'text-sm text-yt-gray';
    const totalSongs = playlist.songs?.length || 0;
    songCount.textContent = `${totalSongs} canción${totalSongs !== 1 ? 'es' : ''}`;

    textInfo.appendChild(name);
    textInfo.appendChild(songCount);

    info.appendChild(cover);
    info.appendChild(textInfo);

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
