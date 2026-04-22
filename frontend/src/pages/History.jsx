import GlassCard from "../components/ui/GlassCard"
import RiskBadge from "../components/ui/RiskBadge"

const activities = [
  { action: "Ran Risk Analysis", user: "Dr. Sarah Jenkins", time: "14:22 Today", status: "SUCCESS" },
  { action: "Updated Cohort", user: "Mark Thompson", time: "11:05 Today", status: "SUCCESS" },
  { action: "Risk Alert Generation", user: "System", time: "09:15 Today", status: "WARNING" },
  { action: "Exported Audit Trail", user: "Dr. Sarah Jenkins", time: "Yesterday", status: "SUCCESS" },
]

const archive = [
  { name: "Ishaan Sharma", id: "SS-2024-9402", cohort: "CS-5A", score: "92.3", date: "Apr 14", risk: "LOW" },
  { name: "Arjun Reddy", id: "SS-2023-1108", cohort: "MATH-2C", score: "46.2", date: "Apr 14", risk: "CRITICAL" },
  { name: "Sara Kapoor", id: "SS-2022-7214", cohort: "ECO-3B", score: "61.0", date: "Apr 13", risk: "MODERATE" },
  { name: "David Vance", id: "SS-2024-3351", cohort: "CS-3D", score: "68.1", date: "Apr 12", risk: "MONITORING" },
]

export default function History({ predictionHistory = [] }) {
  const records = predictionHistory.length
    ? predictionHistory.slice(0, 8).map((row, index) => ({
        id: row.id || `R-${index + 1}`,
        name: row.studentName,
        cohort: row.type === "academic" ? "Academic Predictor" : "Platform Predictor",
        source: row.type,
        modelName: row.modelName || "CatBoost",
        score: row.probability,
        date: new Date(row.timestamp).toLocaleDateString(),
        risk: row.riskLevel || "MONITORING",
      }))
    : archive

  return (
    <section className="space-y-4">
      <GlassCard dark className="p-6">
        <h1 className="text-3xl md:text-4xl font-bold">1,284 operations | <span className="text-accent2">99.8%</span> data consistency</h1>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <GlassCard className="xl:col-span-6 p-5">
          <h3 className="text-xl font-semibold mb-3">Recent System Activities</h3>
          <div className="space-y-2 text-sm">
            {activities.map((a) => (
              <div key={a.action} className="glass p-3 flex flex-wrap justify-between items-center gap-3">
                <div className="min-w-0">
                  <p>{a.action}</p>
                  <p className="text-xs text-slate-300 break-words">{a.user} | {a.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${a.status === "SUCCESS" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-6 p-5">
          <h3 className="text-xl font-semibold mb-3">Prediction Archive</h3>
          <div className="flex gap-2 mb-3 text-xs">
            <button className="glass px-3 py-1 rounded-lg">All</button>
            <button className="glass px-3 py-1 rounded-lg">Critical</button>
            <button className="glass px-3 py-1 rounded-lg">Low Risk</button>
          </div>
          <div className="space-y-2">
            {records.map((a) => (
              <div key={a.id} className="glass p-3 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center text-xs font-bold">
                    {a.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="text-sm min-w-0">
                    <p className="truncate">{a.name} ({a.id})</p>
                    <p className="text-xs text-slate-300 truncate">{a.cohort} | {a.modelName || "CatBoost"} | {a.score} | {a.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.source ? (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-white/10">
                      {a.source}
                    </span>
                  ) : null}
                  <RiskBadge level={a.risk} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-300 mt-3">
            Showing 1-{records.length} of {predictionHistory.length || 1284} records | Previous | Next
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-5 flex flex-wrap justify-between gap-3 items-center">
        <p>Archive Insight: Intervention-led cohorts showed 17% faster recovery vs control groups.</p>
        <button className="bg-accent px-4 py-2 rounded-lg">Download Audit Log</button>
      </GlassCard>
    </section>
  )
}
