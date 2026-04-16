/**
 * Componentes UI base reutilizables
 */

/**
 * Crea un botón
 */
export function createButton(
  text: string,
  options: {
    class?: string;
    id?: string;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
  } = {}
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = options.class || 'px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition';
  if (options.id) button.id = options.id;
  if (options.disabled) button.disabled = true;
  if (options.onClick) button.addEventListener('click', options.onClick);
  return button;
}

/**
 * Crea un input
 */
export function createInput(
  options: {
    type?: string;
    placeholder?: string;
    value?: string;
    id?: string;
    class?: string;
    onChange?: (event: Event) => void;
  } = {}
): HTMLInputElement {
  const input = document.createElement('input');
  input.type = options.type || 'text';
  input.placeholder = options.placeholder || '';
  input.value = options.value || '';
  input.className = options.class || 'w-full px-3 py-2 border border-yt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-yt-dark';
  if (options.id) input.id = options.id;
  if (options.onChange) input.addEventListener('change', options.onChange);
  return input;
}

/**
 * Crea un label
 */
export function createLabel(text: string, forId?: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.textContent = text;
  label.className = 'block text-sm font-medium text-yt-dark mb-1';
  if (forId) label.htmlFor = forId;
  return label;
}

/**
 * Crea un modal
 */
export function createModal(
  title: string,
  content: HTMLElement,
  options: {
    id?: string;
    onClose?: () => void;
    closeButtonText?: string;
  } = {}
): HTMLDivElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden';
  if (options.id) modal.id = options.id;

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-secondary rounded-lg shadow-lg p-6 max-w-md w-full mx-4 border border-yt-border';

  const titleElement = document.createElement('h2');
  titleElement.textContent = title;
  titleElement.className = 'text-lg font-bold mb-4 text-yt-dark';

  const closeButton = document.createElement('button');
  closeButton.textContent = options.closeButtonText || '✕';
  closeButton.className = 'absolute top-4 right-4 text-yt-gray hover:text-yt-dark text-xl';
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    options.onClose?.();
  });

  modalContent.appendChild(closeButton);
  modalContent.appendChild(titleElement);
  modalContent.appendChild(content);

  modal.appendChild(modalContent);

  return modal;
}

/**
 * Muestra/oculta un elemento
 */
export function toggleElement(element: HTMLElement, show: boolean): void {
  if (show) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

/**
 * Crea un contenedor
 */
export function createContainer(options: {class?: string; id?: string} = {}): HTMLDivElement {
  const container = document.createElement('div');
  container.className = options.class || 'container mx-auto px-4';
  if (options.id) container.id = options.id;
  return container;
}

/**
 * Crea una tarjeta
 */
export function createCard(options: {class?: string; id?: string} = {}): HTMLDivElement {
  const card = document.createElement('div');
  card.className = options.class || 'bg-white rounded-lg shadow p-4';
  if (options.id) card.id = options.id;
  return card;
}

/**
 * Crea un spinner de carga
 */
export function createSpinner(): HTMLDivElement {
  const spinner = document.createElement('div');
  spinner.className = 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary';
  return spinner;
}

/**
 * Crea un ícono usando emojis o SVG
 */
export function createIcon(iconName: string): HTMLElement {
  const iconMap: Record<string, string> = {
    play: '▶',
    pause: '⏸',
    next: '⏭',
    previous: '⏮',
    volume: '🔊',
    mute: '🔇',
    download: '⬇',
    edit: '✎',
    delete: '🗑',
    add: '➕',
    search: '🔍',
    heart: '❤',
    queue: '☰',
    shuffle: '🔀',
    loop: '🔁',
  };

  const icon = document.createElement('span');
  icon.textContent = iconMap[iconName] || iconName;
  icon.className = 'text-lg';
  return icon;
}

/**
 * Muestra una notificación
 */
export function showNotification(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  duration: number = 3000
): void {
  const notification = document.createElement('div');
  const bgColorClass = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  notification.className = `fixed top-4 right-4 ${bgColorClass} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
}

/**
 * Confirma una acción
 */
export function confirmAction(message: string): Promise<boolean> {
  return Promise.resolve(window.confirm(message));
}
