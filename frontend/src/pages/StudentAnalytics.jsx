import GlassCard from "../components/ui/GlassCard"
import RadarChart from "../components/ui/RadarChart"

const fallback = {
  student: {
    name: "Ishaan Sharma",
    id: "SS-2024-9402",
    program: "B.TECH COMPUTER SCIENCE",
    gpa: 3.82,
    semester: "5th Year",
    hostel: "C-14",
  },
  retention_probability: 96,
  credits_completed: 142,
  credits_total: 160,
  skills: [
    { skill: "Attendance", value: 94 },
    { skill: "Participation", value: 88 },
    { skill: "Peer Interaction", value: 42 },
    { skill: "Quiz Scores", value: 91 },
    { skill: "Submission Rate", value: 98 },
    { skill: "Focus Index", value: 85 },
    { skill: "Concept Retention", value: 89 },
  ],
}

const toKey = (name) => name.trim().toLowerCase()

export default function StudentAnalytics({ studentProfiles = {}, activeStudentName = "" }) {
  const activeKey = toKey(activeStudentName)
  const profile = studentProfiles[activeKey]

  const academic = profile?.academic
  const platform = profile?.platform

  const data = profile
    ? {
        student: {
          name: profile.studentName,
          id: profile.studentId,
          program: "PERSONALIZED TRACK",
          gpa: Number(academic?.input?.gpa ?? fallback.student.gpa).toFixed(2),
          semester: "Live Profile",
          hostel: "N/A",
        },
        retention_probability: Number(platform?.retentionProbability ?? fallback.retention_probability).toFixed(0),
        credits_completed: fallback.credits_completed,
        credits_total: fallback.credits_total,
        skills: [
          { skill: "Attendance", value: Math.round(Number(academic?.input?.attendance ?? 70)) },
          { skill: "Participation", value: Math.round(Number(platform?.input?.forum_participation ?? 1) / 3 * 100) },
          { skill: "Peer Interaction", value: Math.round(Number(platform?.input?.resources_accessed ?? 8) / 25 * 100) },
          { skill: "Quiz Scores", value: Math.round(Number(academic?.input?.math_score ?? 75)) },
          { skill: "Submission Rate", value: Math.round(Number(platform?.input?.submission_rate ?? 70)) },
          { skill: "Focus Index", value: Math.round(Number(academic?.input?.study_hours ?? 4) / 12 * 100) },
          {
            skill: "Concept Retention",
            value: Math.round(Number(platform?.retentionProbability ?? 80)),
          },
        ],
      }
    : fallback

  const creditsPct = (data.credits_completed / data.credits_total) * 100

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-4 space-y-4">
        <GlassCard className="p-5">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-xl font-bold">IS</div>
          <h2 className="text-xl font-semibold mt-3">{data.student.name}</h2>
          <p className="text-slate-300 text-sm">ID: {data.student.id}</p>
          <span className="inline-block mt-2 text-xs bg-accent/30 px-2 py-1 rounded-full">{data.student.program}</span>
          <div className="mt-3 text-sm space-y-1">
            <p>GPA: {data.student.gpa}/4.0</p>
            <p>Semester: {data.student.semester}</p>
            <p>Hostel: {data.student.hostel}</p>
          </div>
        </GlassCard>

        <GlassCard dark className="p-5">
          <h3 className="font-semibold">AI Performance Insight</h3>
          <p className="text-sm mt-2 text-slate-200">
            {profile
              ? `${profile.studentName} analytics is now consolidated from Academic and Platform predictors.`
              : "Run predictions in Academic and Platform pages with same student name to build a full profile."}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm">Retention Probability</p>
          <div className="h-2 rounded-full bg-white/10 mt-2">
            <div className="h-full rounded-full bg-success" style={{ width: `${data.retention_probability}%` }} />
          </div>
          <p className="mt-1 text-sm">{data.retention_probability}%</p>

          <p className="text-sm mt-4">Academic Credits</p>
          <div className="h-2 rounded-full bg-white/10 mt-2">
            <div className="h-full rounded-full bg-accent2" style={{ width: `${creditsPct}%` }} />
          </div>
          <p className="mt-1 text-sm">{data.credits_completed}/{data.credits_total}</p>
        </GlassCard>
      </div>

      <div className="xl:col-span-8 space-y-4">
        <GlassCard className="p-5">
          <h3 className="text-xl font-semibold mb-3">Cognitive Skill Profile</h3>
          <RadarChart data={data.skills} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <GlassCard className="p-3">Time 24.5hrs</GlassCard>
            <GlassCard className="p-3">Resources 112</GlassCard>
            <GlassCard className="p-3">Missed Deadlines 0</GlassCard>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-xl font-semibold mb-3">Recent Academic Footprint</h3>
          <div className="space-y-2 text-sm">
            <div className="glass p-3">Data Structures Quiz 04 | 19/20 | <span className="text-success">EXCELLENT</span></div>
            <div className="glass p-3">Cloud Architecture Discussion | Passive | <span className="text-warning">LOW INTENSITY</span></div>
            <div className="glass p-3">Algorithms Lab Submission | Pending | <span className="text-yellow-300">REVIEWING</span></div>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
