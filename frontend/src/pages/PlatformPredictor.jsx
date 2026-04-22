import { useState } from "react"
import { predictPlatform } from "../utils/api"
import { usePredictor } from "../hooks/usePredictor"
import GlassCard from "../components/ui/GlassCard"
import RiskBadge from "../components/ui/RiskBadge"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const initial = {
  name: "",
  login_frequency: 4,
  video_time: 6,
  quiz_attempt_rate: 72,
  submission_rate: 70,
  resources_accessed: 8,
  forum_participation: 1,
  deadline_adherence: 74,
}

const demoFallback = (d) => {
  const retention_probability = Math.min(
    98,
    Math.max(
      8,
      (d.login_frequency / 7) * 20 +
        (d.video_time / 20) * 15 +
        (d.quiz_attempt_rate / 100) * 18 +
        (d.submission_rate / 100) * 20 +
        (Math.min(d.resources_accessed, 25) / 25) * 10 +
        (d.forum_participation / 3) * 7 +
        (d.deadline_adherence / 100) * 10,
    ),
  )

  return {
    prediction: retention_probability >= 50 ? "SAFE" : "AT RISK",
    retention_probability,
    dropout_likelihood: 100 - retention_probability,
    confidence: Math.max(retention_probability, 100 - retention_probability),
    risk_level: retention_probability >= 75 ? "LOW" : retention_probability >= 45 ? "MEDIUM" : "HIGH",
    top_features: [
      { feature: "submission_rate", importance: 29.3 },
      { feature: "quiz_attempt_rate", importance: 24.9 },
      { feature: "deadline_adherence", importance: 18.4 },
    ],
    recommendations: ["Backend offline - showing demo results", "Improve assignment submission rate"],
  }
}

export default function PlatformPredictor({
  onSaveHistory,
  onUpdateStudentProfile,
  onSetActiveStudent,
  activeModelName = "CatBoost",
}) {
  const [form, setForm] = useState(initial)
  const { loading, result, runPrediction } = usePredictor(
    (payload) => predictPlatform(payload, activeModelName),
    demoFallback,
    "Backend offline - showing demo results",
  )

  const setValue = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const handlePredict = async () => {
    const studentName = form.name.trim() || "Unknown Student"
    const payload = { ...form }
    delete payload.name
    const output = await runPrediction(payload)

    if (onSetActiveStudent) {
      onSetActiveStudent(studentName)
    }

    if (output && onSaveHistory) {
      onSaveHistory({
        id: `plat-${Date.now()}`,
        type: "platform",
        studentName,
        prediction: output.prediction,
        riskLevel: output.risk_level,
        probability: Number(output.retention_probability || 0).toFixed(1),
        confidence: Number(output.confidence || 0).toFixed(1),
        modelName: activeModelName,
        timestamp: new Date().toISOString(),
      })
    }

    if (output && onUpdateStudentProfile) {
      onUpdateStudentProfile({
        studentName,
        source: "platform",
        input: payload,
        output,
        modelName: activeModelName,
      })
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <GlassCard className="xl:col-span-7 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Predict Platform Engagement Risk</h2>
          <input
            className="glass-input"
            placeholder="Student Name"
            value={form.name}
            onChange={(e) => setValue("name", e.target.value)}
          />

          {[
            ["login_frequency", "Login Frequency (days/week)", 0, 7, 1],
            ["video_time", "Video Watch Time (hrs/week)", 0, 20, 0.5],
            ["quiz_attempt_rate", "Quiz Attempt Rate", 0, 100, 1],
            ["submission_rate", "Assignment Submission Rate", 0, 100, 1],
            ["deadline_adherence", "Deadline Adherence", 0, 100, 1],
          ].map(([key, label, min, max, step]) => (
            <div key={key}>
              <div className="flex justify-between text-sm"><span>{label}</span><span>{form[key]}</span></div>
              <input className="range" type="range" min={min} max={max} step={step} value={form[key]} onChange={(e) => setValue(key, Number(e.target.value))} />
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="glass-input" type="number" min="0" value={form.resources_accessed} onChange={(e) => setValue("resources_accessed", Number(e.target.value))} placeholder="Resources Accessed" />
            <select className="glass-input" value={form.forum_participation} onChange={(e) => setValue("forum_participation", Number(e.target.value))}>
              <option value={0}>Forum: None</option>
              <option value={1}>Forum: Low</option>
              <option value={2}>Forum: Moderate</option>
              <option value={3}>Forum: High</option>
            </select>
          </div>

          <button className="bg-accent px-4 py-2 rounded-lg w-full" onClick={handlePredict}>
            Predict Engagement Risk
          </button>
          {loading ? <LoadingSpinner /> : null}
        </GlassCard>

        <GlassCard className="xl:col-span-5 p-5">
          <h3 className="text-lg font-semibold mb-3">Result Intelligence</h3>
          {result ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">Model: {activeModelName}</p>
              <p className={`text-2xl font-bold ${result.prediction === "SAFE" ? "text-success" : "text-danger"}`}>{result.prediction}</p>
              <p>Retention Probability: {result.retention_probability.toFixed(1)}%</p>
              <p>Dropout Risk: {result.dropout_likelihood.toFixed(1)}%</p>
              <p>Confidence: {result.confidence.toFixed(1)}%</p>
              <RiskBadge level={result.risk_level} />

              <div className="space-y-2">
                {result.top_features?.map((f) => (
                  <div key={f.feature}>
                    <div className="flex justify-between text-xs"><span>{f.feature}</span><span>{f.importance}%</span></div>
                    <div className="h-2 bg-white/10 rounded-full"><div className="h-full bg-accent2 rounded-full" style={{ width: `${f.importance}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {result.recommendations?.map((r) => (
                  <span key={r} className="text-xs bg-white/10 px-3 py-2 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-300">Submit platform metrics to predict retention and risk.</p>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <GlassCard dark className="xl:col-span-8 p-5">
          <h3 className="text-2xl font-bold">Platform load is projected to surge by 22% in Q3</h3>
          <p className="text-slate-200 mt-2">Confidence gauge: 90%</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="glass p-3">Peak concurrent users: 4.9k</div>
            <div className="glass p-3">Projected assignment traffic: +19%</div>
            <div className="glass p-3">Forum activity increase: +27%</div>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-4 p-5">
          <h4 className="font-semibold mb-2">Comparative Analysis</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="text-left text-slate-300"><th className="py-1">Segment</th><th className="py-1">Now</th><th className="py-1">Q3</th></tr>
              </thead>
              <tbody>
                <tr><td>Engagement</td><td>74%</td><td>81%</td></tr>
                <tr><td>Dropout Risk</td><td>14%</td><td>9%</td></tr>
                <tr><td>Submissions</td><td>68%</td><td>79%</td></tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
