import { runAppController } from '@controllers/AppController';
import './styles.css';

/**
 * Punto de entrada de la aplicación
 */
async function main(): Promise<void> {
  try {
    await runAppController();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

// Inicia la aplicación cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
