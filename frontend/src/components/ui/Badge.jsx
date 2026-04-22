const styles = {
  success: "bg-success/20 text-success border-success/40",
  danger: "bg-danger/20 text-danger border-danger/40",
  warning: "bg-warning/20 text-warning border-warning/40",
  info: "bg-accent/20 text-accent2 border-accent/40",
}

export default function Badge({ type = "info", text }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${styles[type] || styles.info}`}>
      {text}
    </span>
  )
}
