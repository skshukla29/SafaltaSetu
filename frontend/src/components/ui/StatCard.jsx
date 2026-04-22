import Badge from "./Badge"
import GlassCard from "./GlassCard"

export default function StatCard({ label, value, change, icon, color = "info", badge }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon || "📌"}</div>
        {change ? <Badge type={color} text={change} /> : null}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-slate-300 mt-1">{label}</p>
      {badge ? (
        <div className="mt-3">
          <Badge type={color} text={badge} />
        </div>
      ) : null}
    </GlassCard>
  )
}
