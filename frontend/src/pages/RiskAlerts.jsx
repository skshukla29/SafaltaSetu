import { useState } from "react"
import GlassCard from "../components/ui/GlassCard"
import RiskBadge from "../components/ui/RiskBadge"

const students = [
  { id: "arjun", name: "Arjun Reddy", subject: "Advanced Calculus", level: "CRITICAL", time: "2 hours ago" },
  { id: "sara", name: "Sara Kapoor", subject: "Macroeconomics", level: "MODERATE", time: "5 hours ago" },
  { id: "david", name: "David Vance", subject: "Data Structures", level: "MONITORING", time: "Yesterday" },
]

const toKey = (name) => name.trim().toLowerCase()

const toDisplayRisk = (level = "LOW") => {
  if (level === "HIGH") return "CRITICAL"
  if (level === "MEDIUM") return "MODERATE"
  return "MONITORING"
}

export default function RiskAlerts({ studentProfiles = {}, activeStudentName = "", onSetActiveStudent }) {
  const [expanded, setExpanded] = useState({})

  const profileEntries = Object.values(studentProfiles)
  const dynamic = profileEntries
    .filter((profile) => profile?.academic || profile?.platform)
    .map((profile) => {
      const risk = profile?.academic?.riskLevel || profile?.platform?.riskLevel || "LOW"
      return {
        id: toKey(profile.studentName),
        name: profile.studentName,
        subject: "Combined Academic + Platform Analysis",
        level: toDisplayRisk(risk),
        time: "Just now",
        profile,
      }
    })

  const prioritized = [...dynamic].sort((a, b) => {
    const score = { CRITICAL: 3, MODERATE: 2, MONITORING: 1 }
    return score[b.level] - score[a.level]
  })

  const selectedKey = toKey(activeStudentName)
  const selected = selectedKey ? prioritized.find((s) => s.id === selectedKey) : prioritized[0]
  const rows = prioritized.length ? prioritized : students

  const sentiment = rows.length
    ? `${((rows.filter((r) => r.level !== "CRITICAL").length / rows.length) * 100).toFixed(1)}%`
    : "0.0%"

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <p className="text-slate-300 text-sm">Risk Sentiment</p>
          <h2 className="text-3xl font-bold text-success">{sentiment}</h2>
          <p className="text-sm">Healthy-risk ratio from live student predictions</p>
        </GlassCard>
        <GlassCard dark className="p-5">
          <p className="text-slate-300 text-sm">Explainability Index</p>
          <h2 className="text-3xl font-bold">98.4%</h2>
          <button className="mt-3 bg-white/20 px-3 py-2 rounded-lg">Audit Model</button>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-xl font-semibold mb-3">Active Students at Risk</h3>
        <div className="space-y-2">
          {rows.map((s) => (
            <div key={s.id} className="glass p-3">
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="text-sm min-w-0 truncate">{s.name} | {s.subject}</div>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <RiskBadge level={s.level} />
                  <span className="text-xs text-slate-300">{s.time}</span>
                  <button
                    className="bg-accent px-3 py-1 rounded-lg text-xs"
                    onClick={() => {
                      setExpanded((p) => ({ ...p, [s.id]: !p[s.id] }))
                      onSetActiveStudent?.(s.name)
                    }}
                  >
                    VIEW ANALYSIS
                  </button>
                </div>
              </div>

              {expanded[s.id] ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <GlassCard className="p-3">
                    <p className="text-sm">Risk Driver: Attendance</p>
                    <p className="text-danger font-semibold">{Math.max(0, 100 - Number(s.profile?.academic?.input?.attendance ?? 55)).toFixed(0)}%</p>
                    <div className="h-2 bg-white/10 rounded mt-2"><div className="h-full bg-danger rounded" style={{ width: `${Math.max(0, 100 - Number(s.profile?.academic?.input?.attendance ?? 55)).toFixed(0)}%` }} /></div>
                    <p className="text-xs text-slate-300 mt-2">Attendance trend from academic prediction input.</p>
                  </GlassCard>
                  <GlassCard className="p-3">
                    <p className="text-sm">Risk Driver: Assignments</p>
                    <p className="text-warning font-semibold">{Math.max(0, 100 - Number(s.profile?.platform?.input?.submission_rate ?? 60)).toFixed(0)}%</p>
                    <div className="h-2 bg-white/10 rounded mt-2"><div className="h-full bg-warning rounded" style={{ width: `${Math.max(0, 100 - Number(s.profile?.platform?.input?.submission_rate ?? 60)).toFixed(0)}%` }} /></div>
                    <p className="text-xs text-slate-300 mt-2">Submission adherence from platform prediction.</p>
                  </GlassCard>
                  <GlassCard className="p-3">
                    <p className="text-sm">Risk Driver: Test Scores</p>
                    <p className="text-success font-semibold">{Number(s.profile?.academic?.passProbability ?? s.profile?.platform?.retentionProbability ?? 80).toFixed(0)}%</p>
                    <div className="h-2 bg-white/10 rounded mt-2"><div className="h-full bg-success rounded" style={{ width: `${Number(s.profile?.academic?.passProbability ?? s.profile?.platform?.retentionProbability ?? 80).toFixed(0)}%` }} /></div>
                    <p className="text-xs text-slate-300 mt-2">Predicted success/retention confidence indicator.</p>
                  </GlassCard>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <GlassCard className="xl:col-span-8 p-5">
          <h3 className="text-lg font-semibold">Automated Intervention</h3>
          <p className="text-sm text-slate-300 mt-2">
            {selected
              ? `Targeting ${selected.name} with personalized intervention from their latest prediction signals.`
              : "Trigger support workflows for identified cohorts."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="bg-accent px-3 py-2 rounded-lg">Launch Counselor Outreach</button>
            <button className="bg-white/15 px-3 py-2 rounded-lg">Send Parent Summary</button>
          </div>
          <div className="mt-4">
            <p className="text-sm">Quota Status 75%</p>
            <div className="h-2 bg-white/10 rounded mt-2"><div className="h-full bg-accent rounded" style={{ width: "75%" }} /></div>
          </div>
        </GlassCard>

        <GlassCard dark className="xl:col-span-4 p-5">
          <h3 className="text-lg font-semibold">AI Confidence: High 96.2%</h3>
          <p className="text-sm mt-2 text-slate-200">Model confidence remains robust across high variance cohorts.</p>
        </GlassCard>
      </div>
    </section>
  )
}
