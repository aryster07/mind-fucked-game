/**
 * Room Service
 * Handles multiplayer room creation and management
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getDatabase } from './firebase.service';
import { FIRESTORE_COLLECTIONS } from '../../config/firebase.config';

const roomChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('multiplayer-rooms') 
  : null;

/**
 * Generate random room code
 * @returns {string} 6-character room code
 */
export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Create a new game room
 * @param {Object} hostPlayer - Host player data
 * @returns {Promise<string>} Room code
 */
export const createRoom = async (hostPlayer) => {
  const db = getDatabase();
  const roomCode = generateRoomCode();

  if (!db) {
    // Local fallback
    const room = {
      code: roomCode,
      host: hostPlayer.uid,
      players: [hostPlayer],
      status: 'waiting',
      gameState: null,
      chat: [],
      createdAt: new Date().toISOString(),
      logs: [],
    };
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
    
    if (roomChannel) {
      roomChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room });
    }
    
    return roomCode;
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);

  await setDoc(roomRef, {
    code: roomCode,
    host: hostPlayer.uid,
    players: [hostPlayer],
    status: 'waiting',
    gameState: null,
    createdAt: serverTimestamp(),
    logs: [{
      type: 'system',
      message: `Room ${roomCode} created`,
      timestamp: new Date().toISOString(),
    }],
  });

  return roomCode;
};

/**
 * Join an existing room
 * @param {string} roomCode - Room code to join
 * @param {Object} player - Player data
 * @returns {Promise<Object>} Room data
 */
export const joinRoom = async (roomCode, player) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const roomData = localStorage.getItem(`room_${roomCode}`);
    if (!roomData) {
      throw new Error(`Room ${roomCode} not found`);
    }

    const room = JSON.parse(roomData);
    
    if (room.players.length >= 6) {
      throw new Error('Room is full (max 6 players)');
    }

    if (!room.players.find(p => p.uid === player.uid)) {
      room.players.push(player);
      room.logs.push({
        type: 'player',
        message: `${player.name} joined`,
        timestamp: new Date().toISOString(),
      });
      
      localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
      
      if (roomChannel) {
        roomChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room });
      }
    }
    
    return room;
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }

  const roomData = roomSnap.data();

  if (roomData.players.length >= 6) {
    throw new Error('Room is full');
  }

  if (roomData.status !== 'waiting') {
    throw new Error('Game already started');
  }

  await updateDoc(roomRef, {
    players: arrayUnion(player),
    logs: arrayUnion({
      type: 'player',
      message: `${player.name} joined the room`,
      timestamp: new Date().toISOString(),
    }),
  });

  return roomData;
};

/**
 * Subscribe to room updates
 * @param {string} roomCode - Room code
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToRoom = (roomCode, callback) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const updateRoom = () => {
      const roomData = localStorage.getItem(`room_${roomCode}`);
      if (roomData) {
        callback(JSON.parse(roomData));
      }
    };

    updateRoom();

    const handleMessage = (event) => {
      if (event.data.type === 'ROOM_UPDATE' && event.data.roomCode === roomCode) {
        callback(event.data.room);
      }
    };

    if (roomChannel) {
      roomChannel.addEventListener('message', handleMessage);
    }

    const interval = setInterval(updateRoom, 500);

    return () => {
      clearInterval(interval);
      if (roomChannel) {
        roomChannel.removeEventListener('message', handleMessage);
      }
    };
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

/**
 * Update game state
 * @param {string} roomCode - Room code
 * @param {Object} gameState - New game state
 * @param {string} logMessage - Optional log message
 */
export const updateGameState = async (roomCode, gameState, logMessage = null) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const roomData = localStorage.getItem(`room_${roomCode}`);
    if (!roomData) return;

    const room = JSON.parse(roomData);
    room.gameState = gameState;
    
    if (logMessage) {
      room.logs.push({
        type: 'game',
        message: logMessage,
        timestamp: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
    
    if (roomChannel) {
      roomChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room });
    }
    
    return;
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);
  const updates = { gameState };

  if (logMessage) {
    updates.logs = arrayUnion({
      type: 'game',
      message: logMessage,
      timestamp: new Date().toISOString(),
    });
  }

  await updateDoc(roomRef, updates);
};

/**
 * Start game in room
 * @param {string} roomCode - Room code
 */
export const startGame = async (roomCode, requesterId) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const roomData = localStorage.getItem(`room_${roomCode}`);
    if (!roomData) return;

    const room = JSON.parse(roomData);
    if (room.host !== requesterId) {
      throw new Error('Only the host can start the game');
    }

    room.status = 'playing';
    room.logs.push({
      type: 'system',
      message: 'Game started!',
      timestamp: new Date().toISOString(),
    });
    
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
    
    if (roomChannel) {
      roomChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room });
    }
    
    return;
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const roomData = snap.data();

  if (roomData.host !== requesterId) {
    throw new Error('Only the host can start the game');
  }

  await updateDoc(roomRef, {
    status: 'playing',
    logs: arrayUnion({
      type: 'system',
      message: 'Game started! Good luck everyone!',
      timestamp: new Date().toISOString(),
    }),
  });
};

/**
 * Leave room
 * @param {string} roomCode - Room code
 * @param {string} playerId - Player ID leaving
 */
export const leaveRoom = async (roomCode, playerId) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const roomData = localStorage.getItem(`room_${roomCode}`);
    if (!roomData) return;

    const room = JSON.parse(roomData);
    room.players = room.players.filter(p => p.uid !== playerId);
    
    if (room.players.length === 0) {
      localStorage.removeItem(`room_${roomCode}`);
    } else {
      localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
    }
    
    if (roomChannel) {
      roomChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room });
    }
    
    return;
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const roomData = roomSnap.data();
  const updatedPlayers = roomData.players.filter(p => p.uid !== playerId);

  if (updatedPlayers.length === 0) {
    await deleteDoc(roomRef);
  } else {
    await updateDoc(roomRef, {
      players: updatedPlayers,
    });
  }
};

/**
 * Send chat message
 * @param {string} roomCode - Room code
 * @param {string} playerId - Player ID
 * @param {string} playerName - Player name
 * @param {string} message - Chat message
 */
export const sendChatMessage = async (roomCode, playerId, playerName, message) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const roomData = localStorage.getItem(`room_${roomCode}`);
    if (!roomData) return;

    const room = JSON.parse(roomData);
    if (!room.chat) room.chat = [];
    
    room.chat.push({
      player: playerName,
      playerId,
      message,
      timestamp: Date.now(),
    });
    
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
    
    if (roomChannel) {
      roomChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room });
    }
    
    return;
  }

  const roomRef = doc(db, FIRESTORE_COLLECTIONS.ROOMS, roomCode);
  
  await updateDoc(roomRef, {
    logs: arrayUnion({
      type: 'chat',
      player: playerName,
      message,
      timestamp: new Date().toISOString(),
    }),
  });
};
