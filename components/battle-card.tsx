export function BattleCard() {
  return (
    <div className="mt-auto rounded-xl bg-black/40 border border-white/5 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold tracking-wider text-purple-400">
          LIVE WAR STATUS
        </span>
        <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
          04h 20m LEFT
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm font-medium text-white">
          <span>Cluster</span>
          <span className="text-gray-500">vs</span>
          <span>Enemy</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>125 Stars (94.2%)</span>
          <span>118 Stars (88.5%)</span>
        </div>

        <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
          {/* Enemy Bar (Right) */}
          <div className="absolute right-0 h-full bg-red-500/50 w-[48%]" />
          {/* Friendly Bar (Left) */}
          <div className="absolute left-0 h-full bg-purple-500 w-[52%]" />
          {/* Center Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/50 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
}
