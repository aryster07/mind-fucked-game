import Modal from '@/components/ui/Modal';

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="How to Play">
      <div className="space-y-4 text-white/80 text-sm leading-relaxed">
        <section>
          <h4 className="text-white font-semibold mb-1">Objective</h4>
          <p>
            Get the sum of your 4 cards to <span className="text-emerald-400 font-bold">10 or below</span>, then call
            &quot;Show&quot; to win!
          </p>
        </section>

        <section>
          <h4 className="text-white font-semibold mb-1">Setup</h4>
          <p>
            Each player gets 4 cards. You can see and arrange them at the start, but then they flip face-down.
            You must remember where each card is!
          </p>
        </section>

        <section>
          <h4 className="text-white font-semibold mb-1">Turn Flow</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Draw a card from the deck</li>
            <li>Look at the drawn card</li>
            <li>Swap it with one of your 4 face-down cards</li>
            <li>The old card goes to the discard pile</li>
          </ol>
        </section>

        <section>
          <h4 className="text-white font-semibold mb-1">Calling Show</h4>
          <p>
            You can call &quot;Show&quot; on your turn <span className="text-amber-400">only if you haven&apos;t drawn a card
            this round</span>. If your sum is 10 or below, you win instantly!
          </p>
        </section>

        <section>
          <h4 className="text-white font-semibold mb-1">Power-up Cards</h4>
          <p className="mb-2">When you discard these cards, their power activates:</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold w-6">7</span>
              <span><span className="text-white font-medium">View & Rearrange</span> &mdash; See your cards and rearrange them</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold w-6">9</span>
              <span><span className="text-white font-medium">Swap</span> &mdash; Exchange one of your cards with any opponent&apos;s card</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold w-6">J</span>
              <span><span className="text-white font-medium">Shuffle</span> &mdash; Shuffle any opponent&apos;s card positions</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold w-6">K</span>
              <span><span className="text-white font-medium">Peek</span> &mdash; View any opponent&apos;s entire hand</span>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-white font-semibold mb-1">Card Values</h4>
          <p>
            A = 1, 2-10 = face value, J = 11, Q = 12, K = 13
          </p>
        </section>
      </div>
    </Modal>
  );
}
