from fastapi import HTTPException
from schemas import AssessmentCreate, AssessmentUpdate


# Validation helpers
def validate_score_list(values, max_value=100):
    if values is None:
        return []

    if not isinstance(values, list):
        raise HTTPException(status_code=400, detail="Scores must be a list")

    cleaned = []

    for v in values:
        if v is None:
            cleaned.append(None)
            continue

        if v < 0 or v > max_value:
            raise HTTPException(
                status_code=400,
                detail=f"Score must be between 0 and {max_value}"
            )

        cleaned.append(v)

    return cleaned


def validate_single(value, max_value):
    if value is None:
        return None

    if value < 0 or value > max_value:
        raise HTTPException(
            status_code=400,
            detail=f"Value must be between 0 and {max_value}"
        )

    return value


# Create payload
def build_assessment_payload(data: AssessmentCreate) -> dict:

    validated = data.data

    if hasattr(validated, "model_dump"):
        validated = validated.model_dump()


    # Score
    if validated["type"] == "score":

        validated["scores"] = validate_score_list(
            validated.get("scores"),
            100
        )

    # Attendance
    elif validated["type"] == "attendance":

        validated["present"] = validated.get("present", [])

    # Exam
    elif validated["type"] == "exam":

        validated["midtermScore"] = validate_single(
            validated.get("midtermScore"),
            100
        )

        validated["endtermScore"] = validate_single(
            validated.get("endtermScore"),
            100
        )

    # Grade
    elif validated["type"] == "grade":

        validated["midtermGrade"] = validate_single(
            validated.get("midtermGrade"),
            99
        )

        validated["endtermGrade"] = validate_single(
            validated.get("endtermGrade"),
            99
        )

        validated["finalGrade"] = validate_single(
            validated.get("finalGrade"),
            99
        )

        validated["gwa"] = validate_single(
            validated.get("gwa"),
            99
        )


    return {
        "class_id": data.class_id,
        "student_id": data.student_id,
        "type": validated["type"],
        "data": validated,
    }


# Update payload
def apply_assessment_update(existing, data: AssessmentUpdate):

    if data.data is None:
        return existing

    validated = data.data

    if hasattr(validated, "model_dump"):
        validated = validated.model_dump()


    # Score
    if validated["type"] == "score":

        validated["scores"] = validate_score_list(
            validated.get("scores"),
            100
        )

    # Exam
    elif validated["type"] == "exam":

        validated["midtermScore"] = validate_single(
            validated.get("midtermScore"),
            100
        )

        validated["endtermScore"] = validate_single(
            validated.get("endtermScore"),
            100
        )

    # Grade
    elif validated["type"] == "grade":

        validated["midtermGrade"] = validate_single(
            validated.get("midtermGrade"),
            99
        )

        validated["endtermGrade"] = validate_single(
            validated.get("endtermGrade"),
            99
        )

        validated["finalGrade"] = validate_single(
            validated.get("finalGrade"),
            99
        )

        validated["gwa"] = validate_single(
            validated.get("gwa"),
            99
        )

    # Attendanc
    elif validated["type"] == "attendance":

        validated["present"] = validated.get("present", [])


    # Merge
    existing.type = validated["type"]
    existing.data = {**existing.data, **validated}

    return existing


# Response formatter
def format_assessment(a) -> dict:
    return {
        "id": a.id,
        "class_id": a.class_id,
        "student_id": a.student_id,
        "type": a.type,
        "data": a.data,
    }