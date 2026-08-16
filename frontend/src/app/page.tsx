export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg">
      <div className="bg-surface border border-border rounded-xl p-8 max-w-sm">
        <h1 className="font-display text-3xl font-medium text-text mb-2">
          Trackly
        </h1>
        <p className="text-text-secondary text-sm mb-4">
          A quiet home for your job search.
        </p>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-interview-bg text-interview">
          Interview
        </span>
      </div>
    </div>
  );
}