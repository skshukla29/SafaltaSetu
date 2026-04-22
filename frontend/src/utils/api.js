import axios from "axios"

const BASE = "http://localhost:8000"
const api = axios.create({ baseURL: BASE })

api.interceptors.response.use((response) => {
	const payload = response.data
	if (payload && typeof payload === "object" && payload.version && payload.success === true && Object.prototype.hasOwnProperty.call(payload, "data")) {
		return { ...response, data: payload.data, envelope: payload }
	}
	return response
})

export const predictAcademic = (data, modelName = "CatBoost") =>
	api.post(`/predict/academic`, { ...data, model_name: modelName })
export const predictPlatform = (data, modelName = "CatBoost") =>
	api.post(`/predict/platform`, { ...data, model_name: modelName })
export const getModelStats = () => api.get(`/predict/model-stats`)
export const getConfusionMatrix = () => api.get(`/predict/confusion-matrix`)
export const getDashboardStats = () => api.get(`/dashboard/stats`)
export const getStudentAnalytics = () => api.get(`/analytics/student`)
