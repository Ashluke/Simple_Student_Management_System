from fastapi import HTTPException
from models import AssessmentConfig


# Validation helpers
def validate_max_scores(values, size=15):
    if values is None:
        return []

    if not isinstance(values, list):
        raise HTTPException(status_code=400, detail="max_scores must be a list")

    if len(values) > size:
        raise HTTPException(status_code=400, detail="Too many max score columns")

    cleaned = []

    for v in values:
        if v is None:
            cleaned.append(None)
            continue

        if not isinstance(v, (int, float)):
            raise HTTPException(status_code=400, detail="Invalid score value")

        if v < 0:
            raise HTTPException(status_code=400, detail="Score cannot be negative")

        cleaned.append(v)

    return cleaned


def validate_exam_score(value):
    if value is None:
        return None

    if not isinstance(value, (int, float)):
        raise HTTPException(status_code=400, detail="Invalid exam score")

    if value < 0 or value > 100:
        raise HTTPException(status_code=400, detail="Exam score must be 0-100")

    return value


def validate_dates(dates, limit=20):
    if dates is None:
        return []

    if not isinstance(dates, list):
        raise HTTPException(status_code=400, detail="Dates must be a list")

    if len(dates) > limit:
        raise HTTPException(status_code=400, detail="Too many dates")

    cleaned = []

    for d in dates:
        if d is None:
            cleaned.append("")
        elif not isinstance(d, str):
            raise HTTPException(status_code=400, detail="Invalid date format")
        else:
            cleaned.append(d)

    return cleaned


# Get config
def get_config_obj(db, class_id: int):
    return db.query(AssessmentConfig).filter(
        AssessmentConfig.class_id == class_id
    ).first()


# Create config
def ensure_config(db, class_id: int):
    config = get_config_obj(db, class_id)

    if not config:
        config = AssessmentConfig(
            class_id=class_id,
            data={}
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config


# Update config
def update_config(db, class_id: int, data: dict):

    # keep your original behavior
    config = ensure_config(db, class_id)

    config_type = data.get("type")

    # Max scores
    if config_type == "score":
        data["max_scores"] = validate_max_scores(
            data.get("max_scores"),
            size=15
        )

    # Max exam scores
    elif config_type == "exam":
        data["maxMidtermScore"] = validate_exam_score(
            data.get("maxMidtermScore")
        )

        data["maxEndtermScore"] = validate_exam_score(
            data.get("maxEndtermScore")
        )

    # Attendance dates
    elif config_type == "attendance":
        data["dates"] = validate_dates(
            data.get("dates")
        )

    # Merge
    config.data = {**config.data, **data}

    db.commit()
    db.refresh(config)

    return config


# Response formatter
def format_config(config: AssessmentConfig):
    return {
        "id": config.id,
        "class_id": config.class_id,
        "data": config.data
    }