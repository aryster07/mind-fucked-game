/**
 * @deprecated This file is deprecated. Use services/firebase/firebase.service.js instead
 * Kept for backwards compatibility during migration
 */

export { getDatabase, initializeFirebase } from './services/firebase/firebase.service';
export { getAuthInstance as auth } from './services/firebase/user.service';

// Alias for backwards compatibility
export const db = getDatabase;

