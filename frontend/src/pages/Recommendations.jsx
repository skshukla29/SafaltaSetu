import toast from "react-hot-toast"
import { useMemo } from "react"
import GlassCard from "../components/ui/GlassCard"

const cards = [
  {
    priority: "HIGH PRIORITY",
    time: "Today 10:32",
    title: "Implement Peer Tutoring for CS101",
    cohort: "Target cohort: First-year Computer Science",
    roi: "+14% Retention",
  },
  {
    priority: "MEDIUM PRIORITY",
    time: "Today 08:15",
    title: "Personalized Math Review Workshops",
    cohort: "Target cohort: Quant-heavy low performers",
    roi: "+8% GPA",
  },
  {
    priority: "LOW PRIORITY",
    time: "Yesterday",
    title: "Extracurricular Engagement Emailer",
    cohort: "Target cohort: Low participation segments",
    roi: "+5% Wellbeing",
  },
]

const toKey = (name) => name.trim().toLowerCase()

const buildPriority = (risk = "LOW") => {
  if (risk === "HIGH") return "HIGH PRIORITY"
  if (risk === "MEDIUM") return "MEDIUM PRIORITY"
  return "LOW PRIORITY"
}

export default function Recommendations({ studentProfiles = {}, activeStudentName = "" }) {
  const profile = studentProfiles[toKey(activeStudentName)]

  const personalized = useMemo(() => {
    if (!profile) return []

    const risk = profile?.academic?.riskLevel || profile?.platform?.riskLevel || "LOW"
    const recs = [
      ...(profile?.academic?.recommendations || []),
      ...(profile?.platform?.recommendations || []),
    ]

    const unique = [...new Set(recs)].slice(0, 4)
    return unique.map((text, idx) => ({
      priority: buildPriority(risk),
      time: "Live",
      title: text,
      cohort: `Target student: ${profile.studentName}`,
      roi: `+${Math.max(5, 14 - idx * 2)}% Expected Improvement`,
    }))
  }, [profile])

  const cardsToRender = personalized.length ? personalized : cards

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-8 space-y-4">
        <h1 className="text-3xl font-bold">Scholastic Interventions</h1>
        {profile ? (
          <p className="text-slate-300">
            Personalized recommendation stream for {profile.studentName} based on academic + platform predictions.
          </p>
        ) : null}

        {cardsToRender.map((c) => (
          <GlassCard key={c.title} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-accent/40 px-2 py-1 rounded-full">{c.priority}</span>
                <span className="text-xs text-slate-300">{c.time}</span>
              </div>
              <h3 className="text-xl font-semibold mt-2 break-words">{c.title}</h3>
              <p className="text-sm text-slate-300 break-words">{c.cohort}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-success font-semibold text-lg">{c.roi}</p>
              <button
                className="mt-2 bg-accent px-4 py-2 rounded-lg"
                onClick={() => toast.success("Campaign launched!")}
              >
                Launch Campaign
              </button>
            </div>
          </GlassCard>
        ))}

        <GlassCard className="p-5">
          <h3 className="text-xl font-semibold mb-3">Success Rate of Previous Recommendations</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-slate-300 border-b border-white/10">
                  <th className="p-2">Intervention</th><th className="p-2">Date</th><th className="p-2">Target</th><th className="p-2">Rating</th><th className="p-2">Success %</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2">Peer Tutoring</td><td className="p-2">Jan 12</td><td className="p-2">CS101</td><td className="p-2">★★★★★</td><td className="p-2 text-success">84%</td></tr>
                <tr><td className="p-2">Math Workshop</td><td className="p-2">Feb 02</td><td className="p-2">Batch M4</td><td className="p-2">★★★★☆</td><td className="p-2 text-warning">67%</td></tr>
                <tr><td className="p-2">Email Nudges</td><td className="p-2">Mar 08</td><td className="p-2">Dorm C</td><td className="p-2">★★★☆☆</td><td className="p-2 text-success">72%</td></tr>
              </tbody>
            </table>
          </div>
          <button className="mt-4 bg-white/15 px-4 py-2 rounded-lg">Download Full Archive</button>
        </GlassCard>
      </div>

      <div className="xl:col-span-4 space-y-4 xl:sticky xl:top-20 h-fit">
        <GlassCard dark className="p-5">
          <p className="text-sm text-slate-300">Intervention Impact</p>
          <h3 className="text-3xl font-bold">22% improvement</h3>
          <p className="text-sm mt-2">Confidence 94.2%</p>
          <div className="h-2 bg-white/10 rounded mt-2"><div className="h-full bg-success rounded" style={{ width: "94.2%" }} /></div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="font-semibold">Performance Metrics</h3>
          <div className="space-y-2 mt-2 text-sm">
            <p>Active 12</p>
            <p>Reach 2.4k</p>
            <p>Conversion 18.5%</p>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
