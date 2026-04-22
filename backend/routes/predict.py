import json
import logging
from functools import lru_cache
from pathlib import Path
from time import perf_counter

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Request

from schemas.academic import AcademicInput, AcademicOutput
from schemas.platform import PlatformInput, PlatformOutput
from routes._response import ResponseEnvelope, versioned_response


router = APIRouter()
BASE_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BASE_DIR / "models"
SUPPORTED_MODELS = ["CatBoost", "XGBoost", "RandomForest", "SVM", "MLP", "LogisticRegression"]
logger = logging.getLogger(__name__)


def _risk_from_probability(prob: float):
    if prob >= 75:
        return "LOW"
    if prob >= 45:
        return "MEDIUM"
    return "HIGH"


@lru_cache(maxsize=1)
def load_academic_bundle():
    model_file = MODELS_DIR / "academic_model.pkl"
    if not model_file.exists():
        raise FileNotFoundError("Academic model not found. Run models/train_academic.py")
    return joblib.load(model_file)


@lru_cache(maxsize=1)
def load_academic_bundles():
    model_file = MODELS_DIR / "academic_models.pkl"
    if not model_file.exists():
        raise FileNotFoundError("Academic multi-model artifact not found")
    return joblib.load(model_file)


@lru_cache(maxsize=1)
def load_platform_bundle():
    model_file = MODELS_DIR / "platform_model.pkl"
    if not model_file.exists():
        raise FileNotFoundError("Platform model not found. Run models/train_platform.py")
    return joblib.load(model_file)


@lru_cache(maxsize=1)
def load_platform_bundles():
    model_file = MODELS_DIR / "platform_models.pkl"
    if not model_file.exists():
        raise FileNotFoundError("Platform multi-model artifact not found")
    return joblib.load(model_file)


def _validate_model_name(name: str) -> str:
    if name not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model_name '{name}'. Supported models: {', '.join(SUPPORTED_MODELS)}",
        )
    return name


def _resolve_academic_model(model_name: str):
    selected = _validate_model_name(model_name)
    try:
        multi = load_academic_bundles()
        if selected in multi.get("models", {}):
            return multi["models"][selected], multi["features"]
    except FileNotFoundError:
        pass
    if selected != "CatBoost":
        raise HTTPException(
            status_code=503,
            detail="Requested model artifacts not available. Re-run models/train_academic.py to generate all models.",
        )
    bundle = load_academic_bundle()
    return bundle["model"], bundle["features"]


def _resolve_platform_model(model_name: str):
    selected = _validate_model_name(model_name)
    try:
        multi = load_platform_bundles()
        if selected in multi.get("models", {}):
            return multi["models"][selected], multi["features"]
    except FileNotFoundError:
        pass
    if selected != "CatBoost":
        raise HTTPException(
            status_code=503,
            detail="Requested model artifacts not available. Re-run models/train_platform.py to generate all models.",
        )
    bundle = load_platform_bundle()
    return bundle["model"], bundle["features"]


def _rank_feature_importance(features, importances):
    total_importance = float(np.sum(importances)) if float(np.sum(importances)) > 0 else 1.0
    ranked = sorted(
        [
            {
                "feature": feature,
                "importance": round(float(score) / total_importance * 100, 2),
            }
            for feature, score in zip(features, importances)
        ],
        key=lambda item: item["importance"],
        reverse=True,
    )
    return ranked[:3]


def _build_model_input(payload: dict, features: list[str]) -> pd.DataFrame:
    missing_features = [feature for feature in features if feature not in payload]
    if missing_features:
        raise HTTPException(
            status_code=500,
            detail=f"Model feature mismatch detected. Missing required features: {', '.join(missing_features)}",
        )
    return pd.DataFrame([payload], columns=features)


@router.post("/academic", response_model=ResponseEnvelope, summary="Predict academic outcome")
async def predict_academic(data: AcademicInput, request: Request):
    start = perf_counter()
    try:
        model, features = _resolve_academic_model(data.model_name)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    payload = data.model_dump()
    input_df = _build_model_input(payload, features)

    try:
        pass_probability = float(model.predict_proba(input_df)[0][1] * 100)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Academic prediction failed")
        raise HTTPException(status_code=500, detail="Unable to generate academic prediction") from exc

    prediction = "PASS" if pass_probability >= 50 else "FAIL"
    confidence = max(pass_probability, 100 - pass_probability)
    risk_level = _risk_from_probability(pass_probability)

    importances = getattr(model, "feature_importances_", np.ones(len(features)))
    ranked = _rank_feature_importance(features, importances)

    recommendations = []
    if data.attendance < 60:
        recommendations.append("Increase your attendance to at least 75%")
    if data.study_hours < 2:
        recommendations.append("Study at least 3-4 hours daily")
    if data.gpa < 2.0:
        recommendations.append("Focus on improving your GPA with regular revision")
    if data.assignment_score < 50:
        recommendations.append("Complete all assignments on time")
    if data.sleep_hours < 6:
        recommendations.append("Ensure 7-8 hours of sleep for better focus")
    if not recommendations:
        recommendations.append("Maintain your current consistency and monitor weak subjects weekly")

    response = AcademicOutput(
        prediction=prediction,
        confidence=round(confidence, 2),
        risk_level=risk_level,
        pass_probability=round(pass_probability, 2),
        top_features=ranked,
        recommendations=recommendations,
    )
    logger.info("Academic prediction completed in %.2f ms", (perf_counter() - start) * 1000)
    return versioned_response(response.model_dump(), request)


@router.post("/platform", response_model=ResponseEnvelope, summary="Predict platform retention risk")
async def predict_platform(data: PlatformInput, request: Request):
    start = perf_counter()
    try:
        model, features = _resolve_platform_model(data.model_name)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    payload = data.model_dump()
    input_df = _build_model_input(payload, features)

    try:
        retention_probability = float(model.predict_proba(input_df)[0][1] * 100)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Platform prediction failed")
        raise HTTPException(status_code=500, detail="Unable to generate platform prediction") from exc

    dropout_likelihood = 100 - retention_probability
    prediction = "SAFE" if retention_probability >= 50 else "AT RISK"
    confidence = max(retention_probability, dropout_likelihood)
    risk_level = _risk_from_probability(retention_probability)

    importances = getattr(model, "feature_importances_", np.ones(len(features)))
    ranked = _rank_feature_importance(features, importances)

    recommendations = []
    if data.login_frequency < 3:
        recommendations.append("Log in to the platform at least 5 days a week")
    if data.video_time < 2:
        recommendations.append("Watch at least 4 hours of course videos weekly")
    if data.submission_rate < 60:
        recommendations.append("Improve assignment submission rate")
    if data.quiz_attempt_rate < 50:
        recommendations.append("Attempt all quizzes to reinforce learning")
    if not recommendations:
        recommendations.append("Keep momentum by maintaining your current learning rhythm")

    response = PlatformOutput(
        prediction=prediction,
        retention_probability=round(retention_probability, 2),
        dropout_likelihood=round(dropout_likelihood, 2),
        confidence=round(confidence, 2),
        risk_level=risk_level,
        top_features=ranked,
        recommendations=recommendations,
    )
    logger.info("Platform prediction completed in %.2f ms", (perf_counter() - start) * 1000)
    return versioned_response(response.model_dump(), request)


@router.get("/model-stats", response_model=ResponseEnvelope, summary="Get model benchmark metrics")
async def get_model_stats(request: Request):
    model_stats = MODELS_DIR / "comparison.json"
    if not model_stats.exists():
        raise HTTPException(status_code=404, detail="comparison.json not found. Train models first.")

    with model_stats.open("r", encoding="utf-8") as f:
        return versioned_response(json.load(f), request)


@router.get("/confusion-matrix", response_model=ResponseEnvelope, summary="Get academic model confusion matrix")
async def get_confusion_matrix(request: Request):
    cm_file = MODELS_DIR / "confusion_matrix_academic.json"
    if not cm_file.exists():
        raise HTTPException(status_code=404, detail="confusion_matrix_academic.json not found.")

    with cm_file.open("r", encoding="utf-8") as f:
        return versioned_response(json.load(f), request)
