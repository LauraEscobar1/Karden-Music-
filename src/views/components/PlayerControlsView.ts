import { ISong } from '@interfaces';
import { formatTime } from '@utils';
import { createButton, createIcon, createInput } from './UIComponents';

/**
 * Componente de controles del reproductor
 */
export class PlayerControlsView {
  private container: HTMLElement;
  private currentSong: ISong | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 1;
  private isLooping: boolean = false;
  private isShuffle: boolean = false;
  private queueOpen: boolean = false;
  private queueSongs: ISong[] = [];
  private currentSongId: string | null = null;

  private onPlay: () => void = () => {};
  private onPause: () => void = () => {};
  private onNext: () => void = () => {};
  private onPrevious: () => void = () => {};
  private onTimeChange: (time: number) => void = () => {};
  private onVolumeChange: (volume: number) => void = () => {};
  private onToggleLoop: () => void = () => {};
  private onToggleShuffle: () => void = () => {};
  private onMoveQueueSong: (fromIndex: number, toIndex: number) => void = () => {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Establece callbacks
   */
  setOnPlay(callback: () => void): void { this.onPlay = callback; }
  setOnPause(callback: () => void): void { this.onPause = callback; }
  setOnNext(callback: () => void): void { this.onNext = callback; }
  setOnPrevious(callback: () => void): void { this.onPrevious = callback; }
  setOnTimeChange(callback: (time: number) => void): void { this.onTimeChange = callback; }
  setOnVolumeChange(callback: (volume: number) => void): void { this.onVolumeChange = callback; }
  setOnToggleLoop(callback: () => void): void { this.onToggleLoop = callback; }
  setOnToggleShuffle(callback: () => void): void { this.onToggleShuffle = callback; }
  setOnMoveQueueSong(callback: (fromIndex: number, toIndex: number) => void): void { this.onMoveQueueSong = callback; }

  /**
   * Actualiza el estado del reproductor
   */
  update(options: {
    currentSong?: ISong | null;
    isPlaying?: boolean;
    currentTime?: number;
    duration?: number;
    volume?: number;
    isLooping?: boolean;
    isShuffle?: boolean;
    queueSongs?: ISong[];
    currentSongId?: string | null;
  }): void {
    if (options.currentSong !== undefined) this.currentSong = options.currentSong;
    if (options.isPlaying !== undefined) this.isPlaying = options.isPlaying;
    if (options.currentTime !== undefined) this.currentTime = options.currentTime;
    if (options.duration !== undefined) this.duration = options.duration;
    if (options.volume !== undefined) this.volume = options.volume;
    if (options.isLooping !== undefined) this.isLooping = options.isLooping;
    if (options.isShuffle !== undefined) this.isShuffle = options.isShuffle;
    if (options.queueSongs !== undefined) this.queueSongs = options.queueSongs;
    if (options.currentSongId !== undefined) this.currentSongId = options.currentSongId;
    this.render();
  }

  /**
   * Renderiza el componente
   */
  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'bg-tertiary text-yt-dark p-4 rounded-lg border border-yt-border';

    // Información de la canción actual
    const songInfo = this.createSongInfo();
    this.container.appendChild(songInfo);

    // Barra de tiempo
    const timeBar = this.createTimeBar();
    this.container.appendChild(timeBar);

    // Controles principales
    const controls = this.createMainControls();
    this.container.appendChild(controls);

    // Controles adicionales
    const additionalControls = this.createAdditionalControls();
    this.container.appendChild(additionalControls);

    if (this.queueOpen) {
      const queuePanel = this.createQueuePanel();
      this.container.appendChild(queuePanel);
    }
  }

  /**
   * Crea la información de la canción
   */
  private createSongInfo(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'mb-4 text-center';

    const title = document.createElement('h3');
    title.className = 'font-semibold text-lg truncate';
    title.textContent = this.currentSong?.title || 'Sin canción';

    const artist = document.createElement('p');
    artist.className = 'text-sm text-yt-gray truncate';
    artist.textContent = this.currentSong?.artist || 'Desconocido';

    container.appendChild(title);
    container.appendChild(artist);

    return container;
  }

  /**
   * Crea la barra de tiempo
   */
  private createTimeBar(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'mb-4';

    // Slider de progreso
    const progressSlider = createInput({
      type: 'range',
      value: '0',
      class: 'w-full cursor-pointer h-1 bg-yt-border rounded appearance-none',
    }) as HTMLInputElement;

    if (this.duration > 0) {
      progressSlider.max = String(this.duration);
      progressSlider.value = String(this.currentTime);
    }

    progressSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      this.onTimeChange(parseFloat(value));
    });

    // Tiempos
    const timesContainer = document.createElement('div');
    timesContainer.className = 'flex justify-between text-xs text-yt-gray mt-1';

    const currentTimeText = document.createElement('span');
    currentTimeText.textContent = formatTime(Math.floor(this.currentTime));

    const durationText = document.createElement('span');
    durationText.textContent = formatTime(Math.floor(this.duration));

    timesContainer.appendChild(currentTimeText);
    timesContainer.appendChild(durationText);

    container.appendChild(progressSlider);
    container.appendChild(timesContainer);

    return container;
  }

  /**
   * Crea los controles principales
   */
  private createMainControls(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex justify-center gap-3 items-center mb-4';

    // Botón cola de reproducción (lado izquierdo)
    const queueButton = createButton('', {
      class: `p-2 rounded-full transition text-primary ${this.queueOpen ? 'bg-red-50' : 'hover:bg-red-50'}`,
      onClick: () => {
        this.queueOpen = !this.queueOpen;
        this.render();
      },
    });
    queueButton.appendChild(createIcon('queue'));

    // Botón anterior
    const prevButton = createButton('', {
      class: 'p-2 hover:bg-red-50 rounded-full transition text-primary',
      onClick: () => this.onPrevious(),
    });
    prevButton.appendChild(createIcon('previous'));

    // Botón play/pause
    const playButton = createButton('', {
      class: 'p-3 bg-primary text-white hover:bg-red-600 rounded-full transition',
      onClick: () => this.isPlaying ? this.onPause() : this.onPlay(),
    });
    playButton.appendChild(createIcon(this.isPlaying ? 'pause' : 'play'));

    // Botón siguiente
    const nextButton = createButton('', {
      class: 'p-2 hover:bg-red-50 rounded-full transition text-primary',
      onClick: () => this.onNext(),
    });
    nextButton.appendChild(createIcon('next'));

    container.appendChild(queueButton);
    container.appendChild(prevButton);
    container.appendChild(playButton);
    container.appendChild(nextButton);

    return container;
  }

  /**
   * Crea los controles adicionales
   */
  private createAdditionalControls(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex justify-between items-center gap-3';

    // Volumen
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'flex items-center gap-2 flex-1';

    const volumeIcon = document.createElement('span');
    volumeIcon.textContent = '🔊';

    const volumeSlider = createInput({
      type: 'range',
      value: String(this.volume),
      class: 'flex-1 cursor-pointer',
    }) as HTMLInputElement;

    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';

    volumeSlider.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.onVolumeChange(value);
    });

    volumeContainer.appendChild(volumeIcon);
    volumeContainer.appendChild(volumeSlider);

    // Botones de modo
    const modeButtons = document.createElement('div');
    modeButtons.className = 'flex gap-2';

    // Botón loop
    const loopButton = createButton('', {
      class: `p-2 rounded transition text-primary ${this.isLooping ? 'bg-red-50' : 'hover:bg-red-50'}`,
      onClick: () => this.onToggleLoop(),
    });
    loopButton.appendChild(createIcon('loop'));

    // Botón shuffle
    const shuffleButton = createButton('', {
      class: `p-2 rounded transition text-primary ${this.isShuffle ? 'bg-red-50' : 'hover:bg-red-50'}`,
      onClick: () => this.onToggleShuffle(),
    });
    shuffleButton.appendChild(createIcon('shuffle'));

    modeButtons.appendChild(loopButton);
    modeButtons.appendChild(shuffleButton);

    container.appendChild(volumeContainer);
    container.appendChild(modeButtons);

    return container;
  }

  private createQueuePanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'mt-4 border border-yt-border rounded-lg bg-white max-h-56 overflow-y-auto';

    const header = document.createElement('div');
    header.className = 'px-3 py-2 border-b border-yt-border font-semibold text-sm text-yt-dark';
    header.textContent = 'Lista de reproducción';
    panel.appendChild(header);

    if (this.queueSongs.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'px-3 py-4 text-sm text-yt-gray';
      empty.textContent = 'No hay canciones para ordenar.';
      panel.appendChild(empty);
      return panel;
    }

    const list = document.createElement('div');
    list.className = 'py-1';

    this.queueSongs.forEach((song, index) => {
      const item = document.createElement('div');
      item.className = `px-3 py-2 text-sm cursor-move flex items-center justify-between ${
        song.id === this.currentSongId ? 'bg-red-50' : 'hover:bg-yt-light-gray'
      }`;
      item.draggable = true;
      item.dataset.index = String(index);

      const label = document.createElement('span');
      label.className = 'truncate pr-3';
      label.textContent = `${index + 1}. ${song.title}`;

      const dragHandle = document.createElement('span');
      dragHandle.className = 'text-yt-gray';
      dragHandle.textContent = '↕';

      item.addEventListener('dragstart', (event) => {
        event.dataTransfer?.setData('text/plain', String(index));
        event.dataTransfer!.effectAllowed = 'move';
      });

      item.addEventListener('dragover', (event) => {
        event.preventDefault();
        item.classList.add('bg-red-100');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('bg-red-100');
      });

      item.addEventListener('drop', (event) => {
        event.preventDefault();
        item.classList.remove('bg-red-100');

        const fromIndex = Number(event.dataTransfer?.getData('text/plain'));
        const toIndex = index;

        if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
          return;
        }

        this.onMoveQueueSong(fromIndex, toIndex);
      });

      item.appendChild(label);
      item.appendChild(dragHandle);
      list.appendChild(item);
    });

    panel.appendChild(list);
    return panel;
  }
}
