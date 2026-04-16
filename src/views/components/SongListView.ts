import { Song } from '@models';
import { createButton, createIcon, createCard } from './UIComponents';

/**
 * Componente para mostrar la lista de canciones
 */
export class SongListView {
  private container: HTMLElement;
  private songs: Song[] = [];
  private currentSongId: string | null = null;
  private onPlaySong: (songIndex: number) => void = () => {};
  private onDeleteSong: (songId: string) => void = () => {};
  private onEditSong: (song: Song) => void = () => {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Establece el callback para reproducir una canción
   */
  setOnPlaySong(callback: (songIndex: number) => void): void {
    this.onPlaySong = callback;
  }

  /**
   * Establece el callback para eliminar una canción
   */
  setOnDeleteSong(callback: (songId: string) => void): void {
    this.onDeleteSong = callback;
  }

  /**
   * Establece el callback para editar una canción
   */
  setOnEditSong(callback: (song: Song) => void): void {
    this.onEditSong = callback;
  }

  /**
   * Actualiza la lista de canciones
   */
  update(songs: Song[], currentSongId: string | null = null): void {
    this.songs = songs;
    this.currentSongId = currentSongId;
    this.render();
  }

  /**
   * Renderiza el componente
   */
  private render(): void {
    this.container.innerHTML = '';

    if (this.songs.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'text-yt-gray text-center py-8';
      emptyMessage.textContent = 'No hay canciones en esta playlist.';
      this.container.appendChild(emptyMessage);
      return;
    }

    const list = document.createElement('div');
    list.className = 'space-y-2 max-h-96 overflow-y-auto';

    this.songs.forEach((song, index) => {
      const item = this.createSongItem(song, index);
      list.appendChild(item);
    });

    this.container.appendChild(list);
  }

  /**
   * Crea un elemento de canción
   */
  private createSongItem(song: Song, index: number): HTMLElement {
    const card = createCard({
      class: `bg-tertiary rounded-lg shadow p-3 hover:shadow-lg transition flex items-center gap-3 ${
        song.id === this.currentSongId ? 'border-l-4 border-primary bg-yt-light-gray' : ''
      }`,
    });

    // Imagen
    const imageContainer = document.createElement('div');
    imageContainer.className = 'w-12 h-12 flex-shrink-0 rounded bg-yt-light-gray flex items-center justify-center overflow-hidden';

    if (song.imageUrl) {
      const img = document.createElement('img');
      img.src = song.imageUrl;
      img.className = 'w-full h-full object-cover';
      imageContainer.appendChild(img);
    } else {
      const placeholder = document.createElement('span');
      placeholder.textContent = '🎵';
      placeholder.className = 'text-xl';
      imageContainer.appendChild(placeholder);
    }

    // Información
    const info = document.createElement('div');
    info.className = 'flex-1 cursor-pointer';
    info.addEventListener('click', () => this.onPlaySong(index));

    const title = document.createElement('h4');
    title.className = 'font-semibold text-yt-dark truncate';
    title.textContent = song.title;

    const artist = document.createElement('p');
    artist.className = 'text-sm text-yt-gray truncate';
    artist.textContent = song.artist;

    info.appendChild(title);
    info.appendChild(artist);

    // Acciones
    const actions = document.createElement('div');
    actions.className = 'flex gap-1';

    const playButton = createButton('', {
      class: 'p-2 text-primary hover:bg-primary hover:text-white rounded transition',
      onClick: (e) => {
        e.stopPropagation();
        this.onPlaySong(index);
      },
    });
    playButton.appendChild(createIcon('play'));

    const editButton = createButton('', {
      class: 'p-2 text-blue-600 hover:bg-blue-100 rounded transition',
      onClick: (e) => {
        e.stopPropagation();
        this.onEditSong(song);
      },
    });
    editButton.appendChild(createIcon('edit'));

    const deleteButton = createButton('', {
      class: 'p-2 text-red-600 hover:bg-red-100 rounded transition',
      onClick: (e) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar "${song.title}"?`)) {
          this.onDeleteSong(song.id);
        }
      },
    });
    deleteButton.appendChild(createIcon('delete'));

    actions.appendChild(playButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(imageContainer);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }
}
