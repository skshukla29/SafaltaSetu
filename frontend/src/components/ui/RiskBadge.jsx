const map = {
  CRITICAL: "bg-danger/25 text-danger border-danger/40",
  WARNING: "bg-warning/25 text-warning border-warning/40",
  LOW: "bg-success/25 text-success border-success/40",
  MODERATE: "bg-orange-400/25 text-orange-300 border-orange-300/40",
  MONITORING: "bg-sky-400/25 text-sky-300 border-sky-300/40",
  HIGH: "bg-danger/25 text-danger border-danger/40",
  MEDIUM: "bg-warning/25 text-warning border-warning/40",
}

export default function RiskBadge({ level }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${map[level] || map.MONITORING}`}>
      {level}
    </span>
  )
}
