import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import HowToPlayModal from '@/components/game/HowToPlayModal';
import { signInAsGuest } from '@/lib/firebase/auth';
import { useGameActions } from '@/lib/hooks/useGameActions';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const actions = useGameActions();

  const [name, setName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }
    try {
      await signInAsGuest(name.trim());
      const result = await actions.createGame.call({ name: name.trim() });
      if (result) {
        router.push(`/game/${result.gameId}`);
      } else {
        toast.error(actions.createGame.error || 'Failed to create game');
      }
    } catch {
      toast.error('Failed to sign in');
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }
    if (!roomCode.trim()) {
      toast.error('Enter room code');
      return;
    }
    try {
      await signInAsGuest(name.trim());
      const result = await actions.joinGame.call({
        roomCode: roomCode.trim().toUpperCase(),
        name: name.trim(),
      });
      if (result) {
        router.push(`/game/${result.gameId}`);
      } else {
        toast.error(actions.joinGame.error || 'Game not found');
      }
    } catch {
      toast.error('Failed to join game');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <motion.div
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero */}
        <div>
          <motion.h1
            className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            MINDFUCK
          </motion.h1>
          <p className="text-white/50 mt-3 text-lg">The memory card game that messes with your head</p>
        </div>

        {/* Floating cards decoration */}
        <div className="flex justify-center gap-3 py-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-12 h-17 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border border-white/10"
              initial={{ y: 20, rotate: -10 + i * 7 }}
              animate={{ y: [0, -8, 0], rotate: -10 + i * 7 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={() => setShowCreate(true)} size="lg" className="w-full">
            Create Game
          </Button>
          <Button onClick={() => setShowJoin(true)} variant="secondary" size="lg" className="w-full">
            Join Game
          </Button>
          <Button onClick={() => router.push('/solo')} variant="secondary" size="lg" className="w-full">
            Play Solo (vs Bots)
          </Button>
          <Button onClick={() => setShowRules(true)} variant="ghost" size="sm" className="w-full">
            How to Play
          </Button>
        </div>
      </motion.div>

      {/* Create Game Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Game">
        <div className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Enter your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          <Button onClick={handleCreate} loading={actions.createGame.loading} className="w-full" size="lg">
            Create & Play
          </Button>
        </div>
      </Modal>

      {/* Join Game Modal */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join Game">
        <div className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Enter your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          <Input
            label="Room Code"
            placeholder="Enter 6-character code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="font-mono tracking-[0.2em] text-center text-lg"
          />
          <Button onClick={handleJoin} loading={actions.joinGame.loading} className="w-full" size="lg">
            Join Game
          </Button>
        </div>
      </Modal>

      <HowToPlayModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
