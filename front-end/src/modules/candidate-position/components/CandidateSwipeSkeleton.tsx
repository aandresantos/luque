function CandidateSwipeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 rounded-[8px] border border-[#464554] bg-[#121212] px-6 py-4">
        <div className="mx-auto h-5 w-48 animate-pulse rounded bg-[#2a2a2c]" />
        <div className="mx-auto mt-3 h-1 w-36 animate-pulse rounded-full bg-[#2a2a2c]" />
      </div>

      <div className="mx-auto h-[720px] w-full max-w-[640px] animate-pulse rounded-[8px] border border-[#464554] bg-[#121212]" />
    </div>
  );
}

export { CandidateSwipeSkeleton };
