import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import GlassCard from "../components/ui/GlassCard"
import RiskBadge from "../components/ui/RiskBadge"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { predictAcademic } from "../utils/api"
import { usePredictor } from "../hooks/usePredictor"

const initialForm = {
  name: "",
  gpa: 3.2,
  attendance: 82,
  study_hours: 4,
  math_score: 75,
  science_score: 78,
  english_score: 81,
  assignment_score: 74,
  sleep_hours: 7,
  parental_education: 2,
  extracurricular: 1,
}

const demoFallback = (formData) => {
  const pass_probability = Math.min(
    98,
    Math.max(
      10,
      (formData.gpa / 4) * 32 +
        (formData.attendance / 100) * 26 +
        (formData.study_hours / 12) * 18 +
        ((formData.math_score + formData.science_score + formData.english_score) / 300) * 14 +
        (formData.assignment_score / 100) * 10,
    ),
  )
  return {
    prediction: pass_probability >= 50 ? "PASS" : "FAIL",
    confidence: Math.max(pass_probability, 100 - pass_probability),
    risk_level: pass_probability >= 75 ? "LOW" : pass_probability >= 45 ? "MEDIUM" : "HIGH",
    pass_probability,
    top_features: [
      { feature: "attendance", importance: 34.8 },
      { feature: "gpa", importance: 28.4 },
      { feature: "study_hours", importance: 16.2 },
    ],
    recommendations: ["Backend offline - showing demo results", "Increase your attendance to at least 75%"],
  }
}

export default function AcademicPredictor({
  onSaveHistory,
  onUpdateStudentProfile,
  onSetActiveStudent,
  predictionHistory = [],
  activeModelName = "CatBoost",
}) {
  const [activeTab, setActiveTab] = useState("predict")
  const [formData, setFormData] = useState(initialForm)
  const [sim, setSim] = useState({ attendance: 70, study_hours: 3, lms: 62 })

  const { loading, result, runPrediction } = usePredictor(
    (payload) => predictAcademic(payload, activeModelName),
    demoFallback,
    "Backend offline - showing demo results",
  )

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handlePredict = async () => {
    const studentName = formData.name.trim() || "Unknown Student"
    const payload = { ...formData }
    delete payload.name
    const output = await runPrediction(payload)

    if (onSetActiveStudent) {
      onSetActiveStudent(studentName)
    }

    if (output && onSaveHistory) {
      onSaveHistory({
        id: `acad-${Date.now()}`,
        type: "academic",
        studentName,
        prediction: output.prediction,
        riskLevel: output.risk_level,
        probability: Number(output.pass_probability || 0).toFixed(1),
        confidence: Number(output.confidence || 0).toFixed(1),
        modelName: activeModelName,
        timestamp: new Date().toISOString(),
      })
    }

    if (output && onUpdateStudentProfile) {
      onUpdateStudentProfile({
        studentName,
        source: "academic",
        input: payload,
        output,
        modelName: activeModelName,
      })
    }
  }

  const simData = useMemo(() => {
    const before = Math.max(8, 100 - (70 * 0.4 + 3 * 8 + 62 * 0.35))
    const after = Math.max(5, 100 - (sim.attendance * 0.4 + sim.study_hours * 8 + sim.lms * 0.35))
    return {
      before: Number(before.toFixed(1)),
      after: Number(after.toFixed(1)),
    }
  }, [sim])

  const visibleHistory = useMemo(() => {
    const name = formData.name.trim().toLowerCase()
    const rows = predictionHistory.filter((row) => row.type === "academic")
    if (!name) {
      return rows.slice(0, 6)
    }
    return rows.filter((row) => row.studentName.toLowerCase().includes(name)).slice(0, 6)
  }, [formData.name, predictionHistory])

  return (
    <section className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab("predict")} className={`px-4 py-2 rounded-lg ${activeTab === "predict" ? "bg-accent" : "glass"}`}>Predict Student</button>
        <button onClick={() => setActiveTab("whatif")} className={`px-4 py-2 rounded-lg ${activeTab === "whatif" ? "bg-accent" : "glass"}`}>What-If Simulation</button>
      </div>

      {activeTab === "predict" ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <GlassCard className="xl:col-span-7 p-5 space-y-3">
              <h2 className="text-xl font-semibold">Predict Student Outcome</h2>
              <input className="glass-input" placeholder="Student Name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />

              {[
              ["gpa", "GPA", 0, 4, 0.1],
              ["attendance", "Attendance %", 0, 100, 1],
              ["study_hours", "Daily Study Hours", 0, 12, 0.5],
              ["math_score", "Math Score", 0, 100, 1],
              ["science_score", "Science Score", 0, 100, 1],
              ["english_score", "English Score", 0, 100, 1],
              ["assignment_score", "Assignment Score", 0, 100, 1],
              ["sleep_hours", "Sleep Hours", 0, 12, 0.5],
              ].map(([key, label, min, max, step]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1"><span>{label}</span><span>{formData[key]}</span></div>
                  <input type="range" min={min} max={max} step={step} value={formData[key]} className="range" onChange={(e) => handleChange(key, Number(e.target.value))} />
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="glass-input" value={formData.parental_education} onChange={(e) => handleChange("parental_education", Number(e.target.value))}>
                  <option value={0}>No Formal Education</option>
                  <option value={1}>High School</option>
                  <option value={2}>Graduate</option>
                  <option value={3}>PostGrad</option>
                </select>
                <button className={`rounded-lg ${formData.extracurricular ? "bg-success/30" : "bg-white/10"}`} onClick={() => handleChange("extracurricular", formData.extracurricular ? 0 : 1)}>
                  Extracurricular: {formData.extracurricular ? "Yes" : "No"}
                </button>
              </div>

              <button onClick={handlePredict} className="bg-accent px-4 py-2 rounded-lg w-full">Run Prediction</button>
              {loading ? <LoadingSpinner /> : null}
            </GlassCard>

            <GlassCard className="xl:col-span-5 p-5">
              <h3 className="text-lg font-semibold mb-3">Prediction Result</h3>
              {result ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">Model: {activeModelName}</p>
                  <div className={`text-2xl font-bold ${result.prediction === "PASS" ? "text-success" : "text-danger"}`}>
                    {result.prediction === "PASS" ? "✓ PASS" : "✗ FAIL"}
                  </div>
                  <p>{Number(result.confidence).toFixed(1)}% Confident</p>
                  <RiskBadge level={result.risk_level} />

                  <div>
                    <p className="font-semibold mb-2">Why this prediction?</p>
                    <div className="space-y-2">
                      {result.top_features?.slice(0, 3).map((f) => (
                        <div key={f.feature}>
                          <div className="flex justify-between text-xs">
                            <span>{f.feature}</span>
                            <span>{f.importance}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${f.importance}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Recommendations</p>
                    <div className="flex flex-wrap gap-2">
                      {result.recommendations?.map((r) => (
                        <span key={r} className="text-xs bg-white/10 px-3 py-2 rounded-full">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300">Run a prediction to view AI insights.</p>
              )}
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <h3 className="text-lg font-semibold">Student Prediction History</h3>
            <p className="text-sm text-slate-300 mt-1">
              {formData.name.trim()
                ? `Showing recent checks matching "${formData.name.trim()}"`
                : "Showing latest academic predictions"}
            </p>

            <div className="mt-3 space-y-2">
              {visibleHistory.length > 0 ? (
                visibleHistory.map((row) => (
                  <div key={row.id} className="glass p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{row.studentName}</p>
                      <p className="text-xs text-slate-300">
                        {new Date(row.timestamp).toLocaleString()} | {row.modelName || "CatBoost"} | Confidence {row.confidence}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${row.prediction === "PASS" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                        {row.prediction}
                      </span>
                      <RiskBadge level={row.riskLevel} />
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{row.probability}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-300">No history found for this student yet.</p>
              )}
            </div>
          </GlassCard>
        </>
      ) : (
        <GlassCard className="p-5">
          <h2 className="text-xl font-semibold mb-3">What-If Simulation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              ["attendance", "Attendance", 0, 100],
              ["study_hours", "Study Hours", 0, 12],
              ["lms", "LMS Engagement", 0, 100],
            ].map(([key, label, min, max]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1"><span>{label}</span><span>{sim[key]}</span></div>
                <input type="range" min={min} max={max} value={sim[key]} className="range" onChange={(e) => setSim((prev) => ({ ...prev, [key]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ name: "Risk", value: simData.after }, { name: "Safe", value: 100 - simData.after }]} dataKey="value" outerRadius={110}>
                  <Cell fill="#F87171" />
                  <Cell fill="#34D399" />
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(15,12,41,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-200">
            Before vs After risk: {simData.before}% {"->"} {simData.after}%
          </p>
        </GlassCard>
      )}
    </section>
  )
}
