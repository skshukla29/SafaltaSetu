import { useEffect, useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import toast from "react-hot-toast"
import StatCard from "../components/ui/StatCard"
import GlassCard from "../components/ui/GlassCard"
import RiskBadge from "../components/ui/RiskBadge"
import { getDashboardStats } from "../utils/api"

const trendData = [
  { month: "Sep", engagement: 68, grade: 72 },
  { month: "Oct", engagement: 71, grade: 74 },
  { month: "Nov", engagement: 75, grade: 78 },
  { month: "Dec", engagement: 77, grade: 80 },
  { month: "Jan", engagement: 79, grade: 81 },
  { month: "Feb", engagement: 78, grade: 83 },
]

const defaultAlerts = [
  { name: "Arjun Reddy", subject: "Calculus", issue: "Low attendance", risk: "CRITICAL" },
  { name: "Sara Kapoor", subject: "Economics", issue: "Missing tasks", risk: "MODERATE" },
  { name: "David Vance", subject: "Data Structures", issue: "Low engagement", risk: "MONITORING" },
  { name: "Mira Joshi", subject: "Physics", issue: "Test inconsistency", risk: "WARNING" },
]

export default function Dashboard({ predictionHistory = [] }) {
  const [stats, setStats] = useState({
    total_students: 1240,
    at_risk_students: 85,
    avg_grade: "B+",
    avg_engagement: 78,
    recent_alerts: defaultAlerts,
  })

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
  }, [])

  const handleExport = () => {
    toast.success("Export report generated successfully")
  }

  const liveStats = useMemo(() => {
    const history = predictionHistory || []

    if (!history.length) {
      return {
        ...stats,
        source: "fallback",
      }
    }

    const latestByStudent = new Map()
    for (const row of history) {
      const key = (row.studentName || "").trim().toLowerCase()
      if (!key || latestByStudent.has(key)) continue
      latestByStudent.set(key, row)
    }

    const latestRows = [...latestByStudent.values()]
    const totalStudents = latestRows.length
    const atRiskStudents = latestRows.filter((r) => ["HIGH", "MEDIUM"].includes(r.riskLevel)).length

    const avgProbability = latestRows.length
      ? latestRows.reduce((sum, r) => sum + Number(r.probability || 0), 0) / latestRows.length
      : 0

    const avgGrade =
      avgProbability >= 90 ? "A" : avgProbability >= 80 ? "B+" : avgProbability >= 70 ? "B" : avgProbability >= 60 ? "C+" : "C"

    const recentAlerts = latestRows.slice(0, 4).map((s) => ({
      name: s.studentName,
      subject: s.type === "academic" ? "Academic Predictor" : "Platform Predictor",
      issue: `${s.prediction} | ${s.modelName || "CatBoost"}`,
      risk:
        s.riskLevel === "HIGH"
          ? "CRITICAL"
          : s.riskLevel === "MEDIUM"
            ? "MODERATE"
            : "MONITORING",
    }))

    return {
      total_students: totalStudents,
      at_risk_students: atRiskStudents,
      avg_grade: avgGrade,
      avg_engagement: Math.round(avgProbability),
      recent_alerts: recentAlerts,
      source: "live",
    }
  }, [predictionHistory, stats])

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Academic Pulse</h1>
          <p className="text-slate-300">Live institution intelligence and predictive monitoring</p>
        </div>
        <div className="flex gap-2">
          <button className="glass px-4 py-2">Filter Cohort</button>
          <button onClick={handleExport} className="bg-accent px-4 py-2 rounded-lg">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={liveStats.total_students}
          change={liveStats.source === "live" ? "Live entered data" : "+4.2%"}
          color="success"
          icon="👥"
        />
        <StatCard
          label="At-Risk Students"
          value={liveStats.at_risk_students}
          change={liveStats.source === "live" ? "From current entries" : "+12 students"}
          color="danger"
          icon="🚨"
        />
        <StatCard label="Avg. Grade" value={liveStats.avg_grade} badge="Stable" color="info" icon="🎯" />
        <StatCard label="Avg. Engagement" value={`${liveStats.avg_engagement}%`} change="-1.5%" color="danger" icon="📈" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <GlassCard className="xl:col-span-7 p-5">
          <h3 className="text-lg font-semibold mb-3">Recent Risk Alerts</h3>
          <div className="space-y-3">
            {liveStats.recent_alerts.slice(0, 4).map((s) => (
              <div key={s.name} className="flex flex-wrap items-center justify-between gap-3 bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-accent/40 flex items-center justify-center font-semibold">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-slate-300 truncate">{s.subject} - {s.issue}</p>
                  </div>
                </div>
                <RiskBadge level={s.risk} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-5 p-5">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <XAxis dataKey="month" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip contentStyle={{ background: "rgba(15,12,41,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "white" }} />
                <Line type="monotone" dataKey="engagement" stroke="#34D399" strokeWidth={3} />
                <Line type="monotone" dataKey="grade" stroke="#A78BFA" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-dark p-3 mt-4">
            <p className="text-xs uppercase tracking-wide text-accent2">Oracle Insight</p>
            <p className="text-sm mt-1">Engagement is stable, but calculus-heavy cohorts need proactive interventions.</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <GlassCard dark className="xl:col-span-8 p-5">
          <h3 className="text-xl font-semibold">Predictive Enrollment Model</h3>
          <p className="text-slate-200 mt-2 max-w-2xl">
            Projected intake growth of 11.8% with a risk-adjusted confidence of 92.1% for next semester.
          </p>
          <button className="mt-4 bg-white/20 px-4 py-2 rounded-lg">Open Forecast Console</button>
        </GlassCard>

        <GlassCard className="xl:col-span-4 p-5">
          <h3 className="text-lg font-semibold">Focus Areas</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>- Attendance dip in first-year engineering cohorts</li>
            <li>- Submission rate drop in evening batches</li>
            <li>- Peer interaction deficit in remote learners</li>
          </ul>
        </GlassCard>
      </div>
    </section>
  )
}
