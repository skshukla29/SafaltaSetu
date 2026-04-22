import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const titleMap = {
  dashboard: "Dashboard",
  "model-performance": "Model Performance",
  "academic-predictor": "Academic Predictor",
  "platform-predictor": "Platform Predictor",
  "student-analytics": "Student Analytics",
  "risk-alerts": "Risk Alerts",
  recommendations: "Recommendations",
  history: "History",
}

export default function Navbar({
  activePage,
  activeStudentName = "",
  notificationCount = 0,
  theme = "light",
  onToggleTheme,
  onSearchStudent,
  onOpenAlerts,
  onOpenProfile,
}) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    setQuery(activeStudentName || "")
  }, [activeStudentName])

  const runSearch = () => {
    const name = query.trim()
    if (!name) {
      toast.error("Enter a student name to search")
      return
    }
    onSearchStudent?.(name)
    toast.success(`Loaded analytics for ${name}`)
  }

  return (
    <header className="fixed z-20 top-0 right-0 left-0 lg:left-[210px] h-16 box-border px-2 py-2 lg:px-3 lg:py-2">
      <div className="glass h-full rounded-xl px-3 lg:px-4 flex items-center gap-2 lg:gap-4 min-w-0">
        <h2 className="font-semibold text-base lg:text-lg truncate min-w-0">{titleMap[activePage]}</h2>

        <div className="hidden md:flex md:flex-1 gap-2 max-w-xl">
          <input
            className="glass-input"
            placeholder="Search student by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                runSearch()
              }
            }}
          />
          <button className="bg-accent px-3 py-2 rounded-lg text-sm" onClick={runSearch}>Go</button>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <button
            className="theme-switch"
            onClick={onToggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-label="Toggle theme"
          >
            <span className={`theme-switch-thumb ${theme === "dark" ? "is-dark" : "is-light"}`}>
              {theme === "light" ? "🌙" : "☀️"}
            </span>
            <span className="theme-switch-label">{theme === "light" ? "Dark" : "Light"}</span>
          </button>
          <button className="relative bg-white/10 px-3 py-2 rounded-lg" onClick={onOpenAlerts}>
            🔔
            {notificationCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-danger text-xs rounded-full px-1.5">{notificationCount}</span>
            ) : null}
          </button>
          <button
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold"
            onClick={onOpenProfile}
            title="Open history"
          >
            EV
          </button>
          <div className="hidden xl:block text-right">
            <p className="text-sm font-semibold">Dr. Elena Vance</p>
            <p className="text-xs text-slate-300">Chief Academic Officer</p>
          </div>
        </div>
      </div>
    </header>
  )
}
