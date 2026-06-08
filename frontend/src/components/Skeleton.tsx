import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
}

export function Skeleton({ className = '', count = 1, circle = false }: SkeletonProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`bg-slate-800/50 ${
            circle ? 'rounded-full' : 'rounded-lg'
          }`}
          style={{
            width: circle ? '40px' : '100%',
            height: circle ? '40px' : '20px',
          }}
        />
      ))}
    </div>
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton circle count={1} />
          <div className="flex flex-col gap-1">
            <Skeleton className="w-24" />
            <Skeleton className="w-16" />
          </div>
        </div>
        <Skeleton className="w-8 h-4" />
      </div>
      <Skeleton className="w-full mb-3" />
      <div className="flex gap-3">
        <Skeleton className="w-20" />
        <Skeleton className="w-20" />
      </div>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        <Skeleton className="w-16 h-5 rounded" />
        <Skeleton className="w-14 h-5 rounded" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton circle count={1} />
            <Skeleton className="w-20 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-64 h-9 rounded-full" />
            <Skeleton className="w-24 h-9 rounded-full" />
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-24 h-5" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Skeleton className="w-32 mb-1" />
        <div className="flex items-center gap-4 mt-3">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
