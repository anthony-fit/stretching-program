import { STORAGE_VERSION, LOCAL_STORAGE_KEYS } from './storageKeys';

export function runStorageMigrations(): void {
  const currentVersion = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.VERSION) || '0');

  if (currentVersion === STORAGE_VERSION) {
    return;
  }

  console.log(`Running storage migration from version ${currentVersion} to ${STORAGE_VERSION}`);

  if (currentVersion < 1) {
    // Initial setup migration
    localStorage.setItem(LOCAL_STORAGE_KEYS.VERSION, STORAGE_VERSION.toString());
  }

  // Future migrations will go here
  // if (currentVersion < 2) { ... }

  localStorage.setItem(LOCAL_STORAGE_KEYS.VERSION, STORAGE_VERSION.toString());
}
