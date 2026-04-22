from fastapi import APIRouter, Request

from routes._response import ResponseEnvelope, versioned_response


router = APIRouter()


@router.get("/student", response_model=ResponseEnvelope)
async def student_analytics(request: Request):
    return versioned_response(
        {
        "student": {
            "name": "Ishaan Sharma",
            "id": "SS-2024-9402",
            "program": "B.TECH COMPUTER SCIENCE",
            "gpa": 3.82,
            "semester": "5th Year",
            "hostel": "C-14",
        },
        "retention_probability": 96,
        "credits_completed": 142,
        "credits_total": 160,
        "skills": [
            {"skill": "Attendance", "value": 94},
            {"skill": "Participation", "value": 88},
            {"skill": "Peer Interaction", "value": 42},
            {"skill": "Quiz Scores", "value": 91},
            {"skill": "Submission Rate", "value": 98},
            {"skill": "Focus Index", "value": 85},
            {"skill": "Concept Retention", "value": 89},
        ],
        },
        request,
    )
