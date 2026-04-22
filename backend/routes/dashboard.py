from fastapi import APIRouter, Request

from routes._response import ResponseEnvelope, versioned_response


router = APIRouter()


@router.get("/stats", response_model=ResponseEnvelope)
async def dashboard_stats(request: Request):
    return versioned_response(
        {
        "total_students": 1240,
        "at_risk_students": 85,
        "avg_grade": "B+",
        "avg_engagement": 78,
        "recent_alerts": [
            {
                "name": "Arjun Reddy",
                "subject": "Advanced Calculus",
                "issue": "Low attendance and missed quizzes",
                "risk": "CRITICAL",
            },
            {
                "name": "Sara Kapoor",
                "subject": "Macroeconomics",
                "issue": "Incomplete assignments",
                "risk": "MODERATE",
            },
            {
                "name": "David Vance",
                "subject": "Data Structures",
                "issue": "Engagement drop",
                "risk": "MONITORING",
            },
            {
                "name": "Mira Joshi",
                "subject": "Physics",
                "issue": "Low test consistency",
                "risk": "WARNING",
            },
        ],
        },
        request,
    )
