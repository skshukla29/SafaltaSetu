export default function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 text-slate-200">
      <span className="w-5 h-5 border-2 border-white/40 border-t-accent rounded-full animate-spin" />
      <span>Running prediction...</span>
    </div>
  )
}
