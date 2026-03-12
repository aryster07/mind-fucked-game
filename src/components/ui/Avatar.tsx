interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  connected?: boolean;
  isCurrentTurn?: boolean;
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500',
  ];
  return colors[Math.abs(hash) % colors.length];
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export default function Avatar({ name, size = 'md', connected = true, isCurrentTurn }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      <div
        className={`
          ${sizeClasses[size]} ${hashColor(name)}
          rounded-full flex items-center justify-center font-bold text-white
          ${!connected ? 'opacity-40' : ''}
          ${isCurrentTurn ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-900' : ''}
          transition-all duration-300
        `}
      >
        {initials}
      </div>
      {!connected && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900" />
      )}
    </div>
  );
}
