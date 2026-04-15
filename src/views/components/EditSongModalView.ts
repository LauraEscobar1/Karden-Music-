import { Song } from '@models';
import { readImageAsDataURL, isImageFile } from '@utils';
import { createButton, createInput, createLabel, createModal, showNotification } from './UIComponents';

/**
 * Modal para editar una canción
 */
export class EditSongModalView {
  private modalElement: HTMLDivElement;
  private currentSong: Song | null = null;
  private onSave: (song: Song, updates: {title: string; artist: string; imageUrl: string}) => void = () => {};
  private onClose: () => void = () => {};

  constructor(private container: HTMLElement) {
    this.modalElement = this.createModalElement();
    this.container.appendChild(this.modalElement);
  }

  /**
   * Establece el callback de guardado
   */
  setOnSave(callback: (song: Song, updates: {title: string; artist: string; imageUrl: string}) => void): void {
    this.onSave = callback;
  }

  /**
   * Establece el callback de cierre
   */
  setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  /**
   * Abre el modal con una canción
   */
  async open(song: Song): Promise<void> {
    this.currentSong = song;
    await this.renderContent();
    this.modalElement.classList.remove('hidden');
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.modalElement.classList.add('hidden');
    this.onClose();
  }

  /**
   * Crea el elemento del modal
   */
  private createModalElement(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-secondary rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto border border-yt-border';

    modal.appendChild(modalContent);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    return modal;
  }

  /**
   * Renderiza el contenido del modal
   */
  private async renderContent(): Promise<void> {
    const modalContent = this.modalElement.querySelector('div');
    if (!modalContent) return;

    modalContent.innerHTML = '';

    // Título
    const title = document.createElement('h2');
    title.className = 'text-lg font-bold mb-4';
    title.textContent = 'Editar Canción';

    // Botón cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.className = 'absolute top-4 right-4 text-yt-gray hover:text-yt-dark text-xl bg-none border-none cursor-pointer';
    closeButton.addEventListener('click', () => this.close());

    // Campos del formulario
    const form = document.createElement('form');
    form.className = 'space-y-4';

    // Campo: Título
    const titleLabel = createLabel('Nombre de la Canción');
    const titleInput = createInput({
      value: this.currentSong?.title || '',
      placeholder: 'Ingresa el nombre de la canción',
    });

    form.appendChild(titleLabel);
    form.appendChild(titleInput);

    // Campo: Artista
    const artistLabel = createLabel('Artista');
    const artistInput = createInput({
      value: this.currentSong?.artist || '',
      placeholder: 'Ingresa el nombre del artista',
    });

    form.appendChild(artistLabel);
    form.appendChild(artistInput);

    // Campo: Imagen
    const imageLabel = createLabel('Cargar Imagen');
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

    // Previsualización de imagen
    const imagePreview = document.createElement('div');
    imagePreview.className = 'w-24 h-24 rounded bg-yt-light-gray flex items-center justify-center overflow-hidden';

    if (this.currentSong?.imageUrl) {
      const img = document.createElement('img');
      img.src = this.currentSong.imageUrl;
      img.className = 'w-full h-full object-cover';
      imagePreview.innerHTML = '';
      imagePreview.appendChild(img);
    } else {
      imagePreview.textContent = '🎵';
      imagePreview.className += ' text-3xl';
    }

    let selectedImageUrl = this.currentSong?.imageUrl || '';

    imageInput.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && isImageFile(file)) {
        try {
          selectedImageUrl = await readImageAsDataURL(file);
          imagePreview.innerHTML = '';
          const img = document.createElement('img');
          img.src = selectedImageUrl;
          img.className = 'w-full h-full object-cover';
          imagePreview.appendChild(img);
        } catch (error) {
          showNotification('Error al cargar la imagen', 'error');
        }
      }
    });

    form.appendChild(imageLabel);
    form.appendChild(imageInput);
    form.appendChild(imagePreview);

    // Botones de acción
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-2 mt-6';

    const saveButton = createButton('Guardar', {
      class: 'flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-red-600 transition font-semibold',
      onClick: (e) => {
        e.preventDefault();
        this.handleSave(titleInput.value, artistInput.value, selectedImageUrl);
      },
    });

    const cancelButton = createButton('Cancelar', {
      class: 'flex-1 px-4 py-2 bg-yt-light-gray text-yt-dark rounded hover:bg-gray-400 transition font-semibold',
      onClick: () => this.close(),
    });

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);

    form.appendChild(buttonContainer);

    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(form);
  }

  /**
   * Maneja el guardado de cambios
   */
  private handleSave(title: string, artist: string, imageUrl: string): void {
    if (!title.trim() || !artist.trim()) {
      showNotification('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.currentSong) {
      this.onSave(this.currentSong, {
        title: title.trim(),
        artist: artist.trim(),
        imageUrl,
      });
      this.close();
    }
  }
}
