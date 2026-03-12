import { signInAnonymously, updateProfile, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';

export async function signInAsGuest(displayName: string): Promise<User> {
  const credential = await signInAnonymously(auth);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getPlayerId(): string | null {
  return auth.currentUser?.uid ?? null;
}
