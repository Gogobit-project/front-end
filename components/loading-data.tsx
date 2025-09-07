// --- Skeleton card untuk grid saat loading awal ---
export function AuctionSkeletonCard() {
  return (
    <div className="border border-white/10 rounded-xl bg-white/[0.05] backdrop-blur-sm p-6 skeleton">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-40 rounded bg-white/10" />
        <div className="h-6 w-20 rounded bg-white/10" />
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-4 w-16 rounded bg-white/10" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="h-4 w-20 rounded bg-white/10" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-4 w-10 rounded bg-white/10" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-white/10" />
          <div className="h-6 w-16 rounded bg-white/10" />
        </div>
      </div>
      <div className="h-10 w-full rounded bg-white/10" />
    </div>
  );
}

// --- Bar tipis di atas grid saat refresh periodik (tidak blank konten) ---
export function RefreshingBar({ visible }: { visible: boolean }) {
  return (
    <div className="relative h-0">
      <div
        className={`pointer-events-none absolute -top-1 left-0 h-[3px] w-full bg-indigo-500/20 overflow-hidden transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full w-1/3 bg-indigo-400/80 animate-[shimmer_1.2s_linear_infinite]" />
      </div>
    </div>
  );
}
