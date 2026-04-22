from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ModelName = Literal["CatBoost", "XGBoost", "RandomForest", "SVM", "MLP", "LogisticRegression"]


class TopFeature(BaseModel):
    feature: str
    importance: float


class PlatformInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model_name: ModelName = "CatBoost"
    login_frequency: float = Field(..., ge=0, le=7)
    video_time: float = Field(..., ge=0, le=24)
    quiz_attempt_rate: float = Field(..., ge=0, le=100)
    submission_rate: float = Field(..., ge=0, le=100)
    resources_accessed: int = Field(..., ge=0)
    forum_participation: int = Field(..., ge=0)
    deadline_adherence: float = Field(..., ge=0, le=100)


class PlatformOutput(BaseModel):
    prediction: Literal["SAFE", "AT RISK"]
    retention_probability: float
    dropout_likelihood: float
    confidence: float
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    top_features: list[TopFeature]
    recommendations: list[str]
