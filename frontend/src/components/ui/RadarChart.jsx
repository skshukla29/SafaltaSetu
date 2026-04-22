import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart as ReRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

export default function RadarChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ReRadarChart data={data} outerRadius={90}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis dataKey="skill" stroke="white" fontSize={12} />
          <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
          <Radar dataKey="value" stroke="#A78BFA" fill="#4A6CF7" fillOpacity={0.5} />
          <Tooltip contentStyle={{ background: "rgba(15,12,41,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "white" }} />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
