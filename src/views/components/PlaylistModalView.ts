import { Playlist } from '@models';
import { createButton, createInput, createLabel, showNotification } from './UIComponents';

/**
 * Modal para crear/editar una playlist
 */
export class PlaylistModalView {
  private modalElement: HTMLDivElement;
  private isEditMode: boolean = false;
  private currentPlaylist: Playlist | null = null;
  private onSave: (name: string, description: string) => void = () => {};
  private onClose: () => void = () => {};

  constructor(private container: HTMLElement) {
    this.modalElement = this.createModalElement();
    this.container.appendChild(this.modalElement);
  }

  /**
   * Establece el callback de guardado
   */
  setOnSave(callback: (name: string, description: string) => void): void {
    this.onSave = callback;
  }

  /**
   * Establece el callback de cierre
   */
  setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  /**
   * Abre el modal para crear una nueva playlist
   */
  openForCreate(): void {
    this.isEditMode = false;
    this.currentPlaylist = null;
    this.renderContent('Nueva Playlist', '', '');
    this.modalElement.classList.remove('hidden');
  }

  /**
   * Abre el modal para editar una playlist
   */
  openForEdit(playlist: Playlist): void {
    this.isEditMode = true;
    this.currentPlaylist = playlist;
    this.renderContent('Editar Playlist', playlist.name, playlist.description);
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
    modalContent.className = 'bg-secondary rounded-lg shadow-lg p-6 max-w-md w-full mx-4 border border-yt-border';

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
  private renderContent(title: string, nameValue: string, descriptionValue: string): void {
    const modalContent = this.modalElement.querySelector('div');
    if (!modalContent) return;

    modalContent.innerHTML = '';

    // Título
    const titleElement = document.createElement('h2');
    titleElement.className = 'text-lg font-bold mb-4 text-yt-dark';
    titleElement.textContent = title;

    // Botón cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.className = 'absolute top-4 right-4 text-yt-gray hover:text-yt-dark text-xl bg-none border-none cursor-pointer';
    closeButton.addEventListener('click', () => this.close());

    // Formulario
    const form = document.createElement('form');
    form.className = 'space-y-4';

    // Campo: Nombre
    const nameLabel = createLabel('Nombre de la Playlist');
    const nameInput = createInput({
      value: nameValue,
      placeholder: 'Ingresa el nombre de la playlist',
    });

    form.appendChild(nameLabel);
    form.appendChild(nameInput);

    // Campo: Descripción
    const descriptionLabel = createLabel('Descripción (Opcional)');
    const descriptionInput = document.createElement('textarea');
    descriptionInput.className = 'w-full px-3 py-2 border border-yt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-yt-dark';
    descriptionInput.placeholder = 'Ingresa una descripción para la playlist';
    descriptionInput.value = descriptionValue;
    descriptionInput.rows = 3;

    form.appendChild(descriptionLabel);
    form.appendChild(descriptionInput);

    // Botones
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-2 mt-6';

    const saveButton = createButton(this.isEditMode ? 'Actualizar' : 'Crear', {
      class: 'flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-red-600 transition font-semibold',
      onClick: (e) => {
        e.preventDefault();
        this.handleSave(nameInput.value, descriptionInput.value);
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
    modalContent.appendChild(titleElement);
    modalContent.appendChild(form);
  }

  /**
   * Maneja el guardado
   */
  private handleSave(name: string, description: string): void {
    if (!name.trim()) {
      showNotification('El nombre de la playlist es requerido', 'warning');
      return;
    }

    this.onSave(name.trim(), description.trim());
    this.close();
  }
}
