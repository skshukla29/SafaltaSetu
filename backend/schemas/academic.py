from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ModelName = Literal["CatBoost", "XGBoost", "RandomForest", "SVM", "MLP", "LogisticRegression"]


class TopFeature(BaseModel):
    feature: str
    importance: float


class AcademicInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model_name: ModelName = "CatBoost"
    gpa: float = Field(..., ge=0, le=4)
    attendance: float = Field(..., ge=0, le=100)
    study_hours: float = Field(..., ge=0, le=24)
    math_score: float = Field(..., ge=0, le=100)
    science_score: float = Field(..., ge=0, le=100)
    english_score: float = Field(..., ge=0, le=100)
    assignment_score: float = Field(..., ge=0, le=100)
    sleep_hours: float = Field(..., ge=0, le=24)
    parental_education: int = Field(..., ge=0, le=5)
    extracurricular: int = Field(..., ge=0, le=1)


class AcademicOutput(BaseModel):
    prediction: Literal["PASS", "FAIL"]
    confidence: float
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    pass_probability: float
    top_features: list[TopFeature]
    recommendations: list[str]
