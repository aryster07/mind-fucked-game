import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signInAsGuest } from '@/lib/firebase/auth';
import { useGameActions } from '@/lib/hooks/useGameActions';
import toast, { Toaster } from 'react-hot-toast';

export default function JoinByLink() {
  const router = useRouter();
  const gameId = router.query.roomCode as string; // This is actually gameId from invite link
  const actions = useGameActions();
  const [name, setName] = useState('');

  const handleJoin = async () => {
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }
    if (!gameId) return;

    try {
      await signInAsGuest(name.trim());
      const result = await actions.joinGameById.call({ gameId, name: name.trim() });
      if (result) {
        router.push(`/game/${gameId}`);
      } else {
        toast.error(actions.joinGameById.error || 'Failed to join game');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <motion.div
        className="max-w-md w-full bg-gray-900/50 border border-white/10 rounded-2xl p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            MINDFUCK
          </h1>
          <p className="text-white/50 mt-2">You&apos;ve been invited to play!</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Enter your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <Button onClick={handleJoin} loading={actions.joinGameById.loading} className="w-full" size="lg">
            Join Game
          </Button>
        </div>

        <p className="text-center">
          <button onClick={() => router.push('/')} className="text-white/40 hover:text-white/70 text-sm transition-colors">
            or go to home page
          </button>
        </p>
      </motion.div>
    </div>
  );
}
