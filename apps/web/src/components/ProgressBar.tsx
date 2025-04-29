export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="text-lg flex flex-row overflow-hidden select-none">
      <div
        className="overflow-hidden tracking-[1px]"
        style={{
          width: `${progress}%`,
        }}
      >
        {"█".repeat(30)}
      </div>
      <div
        className="overflow-hidden"
        style={{
          width: `${100 - progress}%`,
        }}
      >
        {"░".repeat(30)}
      </div>
    </div>
  );
}
