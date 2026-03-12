import { PlayerPublic } from '@/types/game';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface WaitingRoomProps {
  roomCode: string;
  gameId: string;
  players: Record<string, PlayerPublic>;
  isHost: boolean;
  onStart: () => void;
  startLoading: boolean;
}

export default function WaitingRoom({
  roomCode,
  gameId,
  players,
  isHost,
  onStart,
  startLoading,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const playerList = Object.entries(players);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/join/${gameId}`;
    if (navigator.share) {
      navigator.share({ title: 'Join my Mindfuck game!', url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Invite link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900/50 border border-white/10 rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Players</h2>
          <p className="text-white/50 text-sm">Share the room code with your friends</p>
        </div>

        {/* Room Code */}
        <div className="text-center">
          <button
            onClick={copyCode}
            className="inline-block bg-white/5 border border-white/20 rounded-xl px-8 py-4 hover:bg-white/10 transition-colors"
          >
            <div className="text-3xl font-mono font-bold tracking-[0.3em] text-emerald-400">
              {roomCode}
            </div>
            <div className="text-white/40 text-xs mt-1">
              {copied ? 'Copied!' : 'Click to copy'}
            </div>
          </button>
        </div>

        {/* Share Link */}
        <div className="text-center">
          <Button variant="secondary" size="sm" onClick={shareLink}>
            Share Invite Link
          </Button>
        </div>

        {/* Player List */}
        <div className="space-y-2">
          <p className="text-white/50 text-sm">
            Players ({playerList.length}/6)
          </p>
          {playerList.map(([id, player]) => (
            <div
              key={id}
              className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl"
            >
              <Avatar name={player.name} size="sm" />
              <span className="text-white font-medium">{player.name}</span>
              {player.seatIndex === 0 && (
                <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Start Button */}
        {isHost && (
          <Button
            onClick={onStart}
            loading={startLoading}
            disabled={playerList.length < 2}
            size="lg"
            className="w-full"
          >
            {playerList.length < 2 ? 'Need at least 2 players' : 'Start Game'}
          </Button>
        )}

        {!isHost && (
          <p className="text-center text-white/40 text-sm">
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
