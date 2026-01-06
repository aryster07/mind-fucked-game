# Mindfucked Multiplayer Runbook (VS Code Context)

## Quick Facts
- Stack: Vite + React, Firestore (rooms + gameState), localStorage userId per device.
- Max players: 6. Host-only start enforced.
- Local user always rendered at bottom (display reorder), turn index kept from server ordering.
- Game state sync: every client writes gameState to Firestore on state change; remote updates set `fromRemote` to prevent loops.

## Files to know
- src/context/GameContext.jsx — game reducer, turn logic, online state sync, host init.
- src/components/Lobby.jsx — create/join, host-only start, applies remote gameState.
- src/components/GameBoard.jsx — seating layout, turn gating to currentUserId, renders reordered players.
- src/services/firebase/room.service.js — room CRUD, host-only startGame, updateGameState.

## How to test with two devices
1) Open Device A (host): go to https://mindcooked.web.app . Click “Create / Join a Room”, create room, note the code.
2) Open Device B (guest): same URL with code (or paste share URL). Enter a username.
3) Verify lobby: both see both names; only host sees Start active. If guest can start, report.
4) Host clicks Start: both should enter PRE_GAME with 8s countdown. Cards for your own seat show face-up initially.
5) Turns: Only the current turn player can throw/draw. On your device your cards are at bottom; opponents around table. Click a card to THROW, then DRAW happens automatically.
6) Discard/turn advance should reflect on both devices within a second. If not, capture console errors (likely Firestore rules) and report.

## If you see issues
- Only host can start: ensured in room.service startGame. If guest can start, we need to check Firestore rules or stale client.
- Missing other players: confirm Firestore room document has `players` array; lobby subscribes and writes into context. If empty, room join failed (check console).
- No state sync: updateGameState writes gameState; Firestore rules must allow update on /rooms/{code}. Provide rule if blocked.

## Operational checklist
- Build: npm run build
- Deploy: firebase deploy --only hosting
- Local userId: auto-generated in localStorage `userId`. Different browsers/incognito get different IDs.

## Next hardening ideas
- Throttle sync: only current turn player writes, others read.
- Add optimism guard: compare turnIndex before writing to reduce races.
- Store usernames in gameState for consistent display even if room doc stale.
