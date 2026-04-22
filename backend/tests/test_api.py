import unittest

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


class TestSafaltaSetuAPI(unittest.TestCase):
    def assertEnvelope(self, response):
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("version"), "v1")
        self.assertTrue(data.get("success"))
        self.assertIn("meta", data)
        self.assertIn("data", data)
        return data["data"]

    def test_root_health(self):
        response = client.get("/")
        data = self.assertEnvelope(response)
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("service"), "SafaltaSetu API")

    def test_dashboard_stats(self):
        response = client.get("/dashboard/stats")
        data = self.assertEnvelope(response)
        self.assertIn("total_students", data)
        self.assertIn("at_risk_students", data)
        self.assertIn("recent_alerts", data)
        self.assertIsInstance(data["recent_alerts"], list)

    def test_student_analytics(self):
        response = client.get("/analytics/student")
        data = self.assertEnvelope(response)
        self.assertIn("student", data)
        self.assertIn("retention_probability", data)
        self.assertIn("skills", data)
        self.assertIsInstance(data["skills"], list)

    def test_predict_academic_valid_payload(self):
        payload = {
            "model_name": "CatBoost",
            "gpa": 3.2,
            "attendance": 78,
            "study_hours": 3,
            "math_score": 82,
            "science_score": 79,
            "english_score": 85,
            "assignment_score": 88,
            "sleep_hours": 7,
            "parental_education": 2,
            "extracurricular": 1,
        }
        response = client.post("/predict/academic", json=payload)
        data = self.assertEnvelope(response)
        self.assertIn(data["prediction"], ["PASS", "FAIL"])
        self.assertIn(data["risk_level"], ["LOW", "MEDIUM", "HIGH"])
        self.assertGreaterEqual(data["pass_probability"], 0)
        self.assertLessEqual(data["pass_probability"], 100)
        self.assertIsInstance(data["top_features"], list)
        self.assertIsInstance(data["recommendations"], list)

    def test_predict_platform_valid_payload(self):
        payload = {
            "model_name": "CatBoost",
            "login_frequency": 4,
            "video_time": 3,
            "quiz_attempt_rate": 72,
            "submission_rate": 80,
            "resources_accessed": 12,
            "forum_participation": 5,
            "deadline_adherence": 86,
        }
        response = client.post("/predict/platform", json=payload)
        data = self.assertEnvelope(response)
        self.assertIn(data["prediction"], ["SAFE", "AT RISK"])
        self.assertIn(data["risk_level"], ["LOW", "MEDIUM", "HIGH"])
        self.assertGreaterEqual(data["retention_probability"], 0)
        self.assertLessEqual(data["retention_probability"], 100)
        self.assertGreaterEqual(data["dropout_likelihood"], 0)
        self.assertLessEqual(data["dropout_likelihood"], 100)
        self.assertIsInstance(data["top_features"], list)
        self.assertIsInstance(data["recommendations"], list)

    def test_predict_academic_rejects_out_of_range_gpa(self):
        payload = {
            "model_name": "CatBoost",
            "gpa": 9.9,
            "attendance": 78,
            "study_hours": 3,
            "math_score": 82,
            "science_score": 79,
            "english_score": 85,
            "assignment_score": 88,
            "sleep_hours": 7,
            "parental_education": 2,
            "extracurricular": 1,
        }
        response = client.post("/predict/academic", json=payload)
        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertEqual(data.get("detail"), "Invalid request payload")
        self.assertIsInstance(data.get("errors"), list)
        self.assertTrue(any(err.get("loc", [None, None])[-1] == "gpa" for err in data["errors"]))

    def test_predict_academic_rejects_extra_fields(self):
        payload = {
            "model_name": "CatBoost",
            "gpa": 3.2,
            "attendance": 78,
            "study_hours": 3,
            "math_score": 82,
            "science_score": 79,
            "english_score": 85,
            "assignment_score": 88,
            "sleep_hours": 7,
            "parental_education": 2,
            "extracurricular": 1,
            "extra_noise": 123,
        }
        response = client.post("/predict/academic", json=payload)
        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertEqual(data.get("detail"), "Invalid request payload")
        self.assertIsInstance(data.get("errors"), list)
        self.assertTrue(any(err.get("type") == "extra_forbidden" for err in data["errors"]))


if __name__ == "__main__":
    unittest.main()