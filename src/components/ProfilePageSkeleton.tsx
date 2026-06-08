export default function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-md min-h-screen border-x border-white/[0.04] bg-[#030304]">
        <div className="py-5 text-center">
          <div className="mx-auto h-3 w-16 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="h-[168px] bg-white/[0.04] animate-pulse" />
        <div className="px-6 -mt-12">
          <div className="h-24 w-24 rounded-full bg-white/10 animate-pulse border-4 border-black" />
        </div>
        <div className="px-6 mt-5 space-y-3">
          <div className="h-7 w-40 rounded bg-white/10 animate-pulse" />
          <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
          <div className="h-16 rounded-2xl bg-white/[0.04] animate-pulse" />
          <div className="h-12 rounded-2xl bg-white/[0.04] animate-pulse" />
          <div className="space-y-2.5 pt-2">
            <div className="h-16 rounded-2xl bg-white/[0.04] animate-pulse" />
            <div className="h-16 rounded-2xl bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
