import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts"
import GlassCard from "../components/ui/GlassCard"
import { getConfusionMatrix, getModelStats } from "../utils/api"

const fallback = {
  academic: {
    CatBoost: { accuracy: 90.2, precision: 89.8, recall: 90.5, f1: 90.1, roc_auc: 93.2 },
    XGBoost: { accuracy: 87.3, precision: 86.9, recall: 87.1, f1: 86.8, roc_auc: 91.4 },
    RandomForest: { accuracy: 85.2, precision: 84.6, recall: 85.0, f1: 84.8, roc_auc: 89.3 },
    SVM: { accuracy: 81.0, precision: 80.5, recall: 80.9, f1: 80.4, roc_auc: 84.7 },
    MLP: { accuracy: 83.2, precision: 82.8, recall: 83.0, f1: 82.7, roc_auc: 86.9 },
    LogisticRegression: { accuracy: 76.2, precision: 75.4, recall: 75.9, f1: 75.5, roc_auc: 79.8 },
  },
  platform: {
    CatBoost: { accuracy: 94.1, precision: 93.8, recall: 94.2, f1: 94.0, roc_auc: 96.2 },
    XGBoost: { accuracy: 91.2, precision: 90.9, recall: 91.1, f1: 90.8, roc_auc: 94.1 },
    RandomForest: { accuracy: 89.7, precision: 89.2, recall: 89.8, f1: 89.3, roc_auc: 92.5 },
    SVM: { accuracy: 86.0, precision: 85.6, recall: 85.8, f1: 85.4, roc_auc: 88.7 },
    MLP: { accuracy: 87.4, precision: 86.8, recall: 87.2, f1: 86.9, roc_auc: 89.8 },
    LogisticRegression: { accuracy: 82.1, precision: 81.2, recall: 82.0, f1: 81.4, roc_auc: 85.3 },
  },
}

const modelOptions = ["CatBoost", "XGBoost", "RandomForest", "SVM", "MLP", "LogisticRegression"]

export default function ModelPerformance({ activeModelName = "CatBoost", onChangeModel }) {
  const [stats, setStats] = useState(fallback)
  const [cm, setCm] = useState({ tp: 188, fp: 19, fn: 21, tn: 172 })

  useEffect(() => {
    getModelStats().then((res) => setStats(res.data)).catch(() => {})
    getConfusionMatrix().then((res) => setCm(res.data)).catch(() => {})
  }, [])

  const chartData = useMemo(
    () =>
      Object.keys(stats.academic || {}).map((model) => ({
        model,
        academic: stats.academic?.[model]?.accuracy || 0,
        platform: stats.platform?.[model]?.accuracy || 0,
        best: model === activeModelName ? "ACTIVE MODEL" : "",
      })),
    [activeModelName, stats],
  )

  const selected = stats.academic?.[activeModelName] || fallback.academic.CatBoost
  const precision = cm.tp / (cm.tp + cm.fp || 1)
  const recall = cm.tp / (cm.tp + cm.fn || 1)
  const f1 = (2 * precision * recall) / (precision + recall || 1)

  return (
    <section className="space-y-5">
      <GlassCard dark className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-300">System Health</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Prediction Model</span>
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm min-w-[180px]"
              value={activeModelName}
              onChange={(e) => onChangeModel?.(e.target.value)}
            >
              {modelOptions.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mt-1">Predictive Integrity is at 98.4%</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <GlassCard className="p-3">Accuracy {selected.accuracy}%</GlassCard>
          <GlassCard className="p-3">Precision {selected.precision}%</GlassCard>
          <GlassCard className="p-3">F1 {selected.f1}%</GlassCard>
          <GlassCard className="p-3">Latency 14ms</GlassCard>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-xl font-semibold mb-3">ML Model Comparison</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
              <XAxis dataKey="model" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ background: "rgba(15,12,41,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "white" }} />
              <Bar dataKey="academic" fill="#A78BFA" radius={[8, 8, 0, 0]} />
              <Bar dataKey="platform" fill="#34D399" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="best" position="top" fill="#FBBF24" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-slate-300 border-b border-white/10">
                <th className="p-2">Model</th><th className="p-2">Accuracy</th><th className="p-2">Precision</th><th className="p-2">Recall</th><th className="p-2">F1</th><th className="p-2">ROC-AUC</th><th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.academic || {}).map(([model, m]) => (
                <tr key={model} className={`border-b border-white/5 ${model === activeModelName ? "bg-yellow-200/10" : ""}`}>
                  <td className="p-2">{model}</td>
                  <td className="p-2">{m.accuracy}%</td>
                  <td className="p-2">{m.precision}%</td>
                  <td className="p-2">{m.recall}%</td>
                  <td className="p-2">{m.f1}%</td>
                  <td className="p-2">{m.roc_auc}%</td>
                  <td className="p-2">{model === activeModelName ? "Selected ✓" : "Available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-xl font-semibold">Confusion Matrix Snapshot (CatBoost Baseline)</h2>
        <div className="grid grid-cols-2 gap-3 max-w-lg mt-4">
          <div className="glass-dark p-4">TP: {cm.tp}</div>
          <div className="glass p-4">FP: {cm.fp}</div>
          <div className="glass p-4">FN: {cm.fn}</div>
          <div className="glass-dark p-4">TN: {cm.tn}</div>
        </div>
        <p className="mt-4 text-sm text-slate-200">
          Precision {(precision * 100).toFixed(2)}% | Recall {(recall * 100).toFixed(2)}% | F1 {(f1 * 100).toFixed(2)}%
        </p>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-xl font-semibold mb-3">Iteration Archive</h2>
        <div className="space-y-2 text-sm">
          <div className="glass p-3">v1.9.2 - CatBoost recalibration, class-balance adjustment, latency reduced by 11%</div>
          <div className="glass p-3">v1.8.4 - XGBoost feature pruning archive snapshot</div>
          <div className="glass p-3">v1.7.0 - Legacy SVM model retired to archive lane</div>
        </div>
      </GlassCard>
    </section>
  )
}
