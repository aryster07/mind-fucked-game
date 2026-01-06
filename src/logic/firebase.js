/**
 * Firebase Integration Module
 * Centralized Firestore operations for room management and game state sync
 */

import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';

const roomsCollection = collection(db, 'rooms');

// ============================================================================
// ROOM MANAGEMENT
// ============================================================================

/**
 * Creates a new game room
 * @param {string} roomCode - Unique room identifier
 * @param {string} hostId - Host player's UID
 * @param {string} hostName - Host player's display name
 * @returns {Promise<string>} Room code on success
 * @throws {Error} If parameters are missing or creation fails
 */
export async function createRoom(roomCode, hostId, hostName) {
  if (!roomCode || !hostId || !hostName) {
    throw new Error('Missing required parameters');
  }
  
  const roomRef = doc(roomsCollection, roomCode);

  await setDoc(roomRef, {
    roomCode,
    host: hostId,
    status: 'waiting',
    players: [
      {
        uid: hostId,
        name: hostName,
        ready: true,
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return roomCode;
}

/**
 * Joins an existing room
 * @param {string} roomCode - Room to join
 * @param {string} playerId - Joining player's UID
 * @param {string} playerName - Joining player's display name
 * @returns {Promise<Object>} Room data
 * @throws {Error} If room not found or full
 */
export async function joinRoom(roomCode, playerId, playerName) {
  const roomRef = doc(roomsCollection, roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }

  const roomData = roomSnap.data();

  // Player already in room
  if (roomData.players.some((p) => p.uid === playerId)) {
    return roomData;
  }

  if (roomData.players.length >= 6) {
    throw new Error('Room is full');
  }

  await updateDoc(roomRef, {
    players: arrayUnion({
      uid: playerId,
      name: playerName,
      ready: true,
    }),
    updatedAt: serverTimestamp(),
  });

  return roomData;
}

/**
 * Removes a player from a room
 * @param {string} roomCode - Room to leave
 * @param {string} playerId - Player's UID
 * @param {boolean} isHost - Whether the leaving player is the host
 */
export async function leaveRoom(roomCode, playerId, isHost = false) {
  const roomRef = doc(roomsCollection, roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data();
  
  // If host leaves during waiting phase, disband the room entirely
  if (isHost && roomData.status === 'waiting') {
    await deleteDoc(roomRef);
    return;
  }
  
  const updatedPlayers = roomData.players.filter((p) => p.uid !== playerId);

  // Delete room if empty, otherwise update
  if (updatedPlayers.length === 0) {
    await deleteDoc(roomRef);
  } else {
    // Transfer host if host is leaving during a game
    const newHost = roomData.host === playerId 
      ? updatedPlayers[0].uid 
      : roomData.host;
      
    await updateDoc(roomRef, {
      players: updatedPlayers,
      host: newHost,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Fetches room data
 * @param {string} roomCode - Room identifier
 * @returns {Promise<Object>} Room data
 * @throws {Error} If room not found
 */
export async function getRoom(roomCode) {
  const roomRef = doc(roomsCollection, roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }

  return roomSnap.data();
}

/**
 * Deletes a room
 * @param {string} roomCode - Room to delete
 */
export async function deleteRoom(roomCode) {
  const roomRef = doc(roomsCollection, roomCode);
  await deleteDoc(roomRef);
}

// ============================================================================
// GAME STATE SYNC
// ============================================================================

/**
 * Updates the game state in Firebase
 * @param {string} roomCode - Room identifier
 * @param {Object} gameState - Complete game state object
 */
export async function updateGameState(roomCode, gameState) {
  const roomRef = doc(roomsCollection, roomCode);
  
  // Map game status to room status
  let status = 'waiting';
  if (gameState.status === 'PLAYING' || gameState.status === 'PRE_GAME') {
    status = 'playing';
  } else if (gameState.status === 'GAME_OVER') {
    status = 'ended';
  }
  
  await updateDoc(roomRef, {
    gameState,
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribes to real-time room updates
 * @param {string} roomCode - Room to subscribe to
 * @param {Function} callback - Called with room data on each update
 * @param {Function} onDeleted - Called when room is deleted
 * @returns {Function} Unsubscribe function
 */
export function subscribeToRoom(roomCode, callback, onDeleted = null) {
  const roomRef = doc(roomsCollection, roomCode);

  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else if (onDeleted) {
      onDeleted();
    }
  });
}
