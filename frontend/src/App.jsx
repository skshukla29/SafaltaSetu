import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import ModelPerformance from "./pages/ModelPerformance"
import AcademicPredictor from "./pages/AcademicPredictor"
import PlatformPredictor from "./pages/PlatformPredictor"
import StudentAnalytics from "./pages/StudentAnalytics"
import RiskAlerts from "./pages/RiskAlerts"
import Recommendations from "./pages/Recommendations"
import History from "./pages/History"

const HISTORY_STORAGE_KEY = "safaltasetu_prediction_history"
const PROFILE_STORAGE_KEY = "safaltasetu_student_profiles"
const ACTIVE_STUDENT_STORAGE_KEY = "safaltasetu_active_student"
const ACTIVE_MODEL_STORAGE_KEY = "safaltasetu_active_model"
const THEME_STORAGE_KEY = "safaltasetu_theme"

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (_error) {
    return []
  }
}

const loadProfiles = () => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (_error) {
    return {}
  }
}

const loadActiveStudent = () => {
  try {
    return localStorage.getItem(ACTIVE_STUDENT_STORAGE_KEY) || ""
  } catch (_error) {
    return ""
  }
}

const loadActiveModel = () => {
  try {
    return localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY) || "CatBoost"
  } catch (_error) {
    return "CatBoost"
  }
}

const loadTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === "light" || stored === "dark") {
      return stored
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }
    return "light"
  } catch (_error) {
    return "light"
  }
}

const toStudentId = (name) => {
  const seed = (name || "student").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
  const num = Math.abs(
    (name || "student").split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 10000, 7),
  )
  return `SS-${new Date().getFullYear()}-${String(num).padStart(4, "0")}-${seed || "STU"}`
}

const normalizeName = (name) => name.trim().toLowerCase()

const hasActionableRisk = (profile) => {
  const a = profile?.academic?.riskLevel
  const p = profile?.platform?.riskLevel
  return a === "HIGH" || a === "MEDIUM" || p === "HIGH" || p === "MEDIUM"
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard")
  const [predictionHistory, setPredictionHistory] = useState(loadHistory)
  const [studentProfiles, setStudentProfiles] = useState(loadProfiles)
  const [activeStudentName, setActiveStudentName] = useState(loadActiveStudent)
  const [activeModelName, setActiveModelName] = useState(loadActiveModel)
  const [theme, setTheme] = useState(loadTheme)

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(predictionHistory))
  }, [predictionHistory])

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(studentProfiles))
  }, [studentProfiles])

  useEffect(() => {
    localStorage.setItem(ACTIVE_STUDENT_STORAGE_KEY, activeStudentName)
  }, [activeStudentName])

  useEffect(() => {
    localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, activeModelName)
  }, [activeModelName])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const addPredictionHistory = (entry) => {
    setPredictionHistory((prev) => [entry, ...prev].slice(0, 500))
  }

  const focusStudent = (name) => {
    const clean = name.trim()
    if (!clean) {
      return
    }
    setActiveStudentName(clean)
    setActivePage("student-analytics")
  }

  const notificationCount = Math.max(
    0,
    Object.values(studentProfiles).filter((profile) => hasActionableRisk(profile)).length,
  )

  const updateStudentProfile = ({ studentName, source, input, output, modelName = "CatBoost" }) => {
    const cleanName = studentName.trim()
    const key = normalizeName(cleanName)
    const now = new Date().toISOString()

    if (!key) {
      return
    }

    setStudentProfiles((prev) => {
      const existing = prev[key] || {
        studentName: cleanName,
        studentId: toStudentId(cleanName),
      }

      const next = {
        ...existing,
        studentName: cleanName,
        updatedAt: now,
      }

      if (source === "academic") {
        next.academic = {
          modelName,
          input,
          prediction: output.prediction,
          riskLevel: output.risk_level,
          passProbability: output.pass_probability,
          confidence: output.confidence,
          recommendations: output.recommendations,
          timestamp: now,
        }
      }

      if (source === "platform") {
        next.platform = {
          modelName,
          input,
          prediction: output.prediction,
          riskLevel: output.risk_level,
          retentionProbability: output.retention_probability,
          dropoutLikelihood: output.dropout_likelihood,
          confidence: output.confidence,
          recommendations: output.recommendations,
          timestamp: now,
        }
      }

      return {
        ...prev,
        [key]: next,
      }
    })

    setActiveStudentName(cleanName)
  }

  const pages = {
    dashboard: <Dashboard predictionHistory={predictionHistory} />,
    "model-performance": (
      <ModelPerformance
        activeModelName={activeModelName}
        onChangeModel={setActiveModelName}
      />
    ),
    "academic-predictor": (
      <AcademicPredictor
        onSaveHistory={addPredictionHistory}
        onUpdateStudentProfile={updateStudentProfile}
        onSetActiveStudent={setActiveStudentName}
        predictionHistory={predictionHistory}
        activeModelName={activeModelName}
      />
    ),
    "platform-predictor": (
      <PlatformPredictor
        onSaveHistory={addPredictionHistory}
        onUpdateStudentProfile={updateStudentProfile}
        onSetActiveStudent={setActiveStudentName}
        activeModelName={activeModelName}
      />
    ),
    "student-analytics": (
      <StudentAnalytics
        studentProfiles={studentProfiles}
        activeStudentName={activeStudentName}
      />
    ),
    "risk-alerts": (
      <RiskAlerts
        studentProfiles={studentProfiles}
        activeStudentName={activeStudentName}
        onSetActiveStudent={setActiveStudentName}
      />
    ),
    recommendations: (
      <Recommendations
        studentProfiles={studentProfiles}
        activeStudentName={activeStudentName}
      />
    ),
    history: <History predictionHistory={predictionHistory} />,
  }

  return (
    <div className="min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="lg:ml-[210px]">
        <Navbar
          activePage={activePage}
          activeStudentName={activeStudentName}
          notificationCount={notificationCount}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSearchStudent={focusStudent}
          onOpenAlerts={() => setActivePage("risk-alerts")}
          onOpenProfile={() => setActivePage("history")}
        />
        <main className="px-4 pt-24 pb-24 lg:px-6 lg:pt-24 lg:pb-6">{pages[activePage]}</main>
      </div>
    </div>
  )
}
