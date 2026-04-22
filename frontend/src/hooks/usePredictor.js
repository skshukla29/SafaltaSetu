import { useState } from "react"
import toast from "react-hot-toast"

export function usePredictor(apiFn, demoFallback, offlineText = "Backend offline - showing demo results") {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const runPrediction = async (formData) => {
    setLoading(true)
    try {
      const res = await apiFn(formData)
      setResult(res.data)
      return res.data
    } catch (error) {
      const status = error?.response?.status
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error"

      toast.error(status ? `Prediction failed (${status})` : "Prediction failed. Is the backend running?")
      if (detail) {
        toast(typeof detail === "string" ? detail : "Prediction request failed")
      }
      toast(offlineText)
      const demo = demoFallback(formData)
      setResult(demo)
      return demo
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, runPrediction, setResult }
}
