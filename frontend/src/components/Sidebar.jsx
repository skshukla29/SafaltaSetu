const items = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "model-performance", label: "Model Performance", icon: "📊" },
  { id: "academic-predictor", label: "Academic Predictor", icon: "🎓" },
  { id: "platform-predictor", label: "Platform Predictor", icon: "💻" },
  { id: "student-analytics", label: "Student Analytics", icon: "📈" },
  { id: "risk-alerts", label: "Risk Alerts", icon: "🚨" },
  { id: "recommendations", label: "Recommendations", icon: "💡" },
  { id: "history", label: "History", icon: "📜" },
]

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <>
      <aside className="fixed z-30 left-0 top-0 h-full w-[210px] p-3 hidden lg:block">
        <div className="glass h-full p-4 flex flex-col">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-accent2">SafaltaSetu</h1>
            <p className="text-xs text-slate-300 tracking-[0.2em]">SCHOLASTIC ORACLE</p>
          </div>

          <nav className="space-y-1 flex-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  activePage === item.id ? "sidebar-active" : "hover:bg-white/10"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="glass-dark p-3 rounded-xl">
            <p className="text-xs text-slate-200">PROPLAN</p>
            <p className="text-sm font-semibold mt-1">Upgrade for district-wide forecasting</p>
            <button className="mt-3 text-xs bg-accent px-3 py-2 rounded-lg w-full">Upgrade</button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-2">
        <div className="glass px-2 py-1 flex gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`text-xs whitespace-nowrap px-3 py-2 rounded-lg ${
                activePage === item.id ? "bg-accent/40" : "bg-white/10"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
