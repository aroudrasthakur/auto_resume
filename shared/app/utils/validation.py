"""AI output validation and repair utilities."""

from typing import Any, Dict, List

from pydantic import BaseModel, ValidationError


def repair_json_from_errors(
    data: Dict[str, Any], errors: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Attempt to repair JSON data based on validation errors.

    This is a simple repair attempt - removes invalid fields,
    sets defaults for missing required fields, etc.

    Args:
        data: Invalid data dictionary
        errors: List of Pydantic validation errors

    Returns:
        Repaired data dictionary
    """
    repaired = data.copy()

    for error in errors:
        error_type = error.get("type")
        loc = error.get("loc", ())

        if error_type == "missing":
            # Set default value for missing field
            if len(loc) == 1:
                field_name = loc[0]
                if field_name == "education":
                    repaired[field_name] = []
                elif field_name == "experience":
                    repaired[field_name] = []
                elif field_name == "projects":
                    repaired[field_name] = []
                elif field_name == "skills":
                    repaired[field_name] = []
        elif error_type in ("value_error", "type_error"):
            # Remove invalid field or set to None
            if len(loc) == 1:
                field_name = loc[0]
                if field_name in repaired:
                    del repaired[field_name]
            elif len(loc) > 1:
                # Nested field - try to remove it
                parent = repaired
                for key in loc[:-1]:
                    if isinstance(parent, dict) and key in parent:
                        parent = parent[key]
                    else:
                        break
                else:
                    if isinstance(parent, dict):
                        parent.pop(loc[-1], None)

    return repaired


def validate_with_repair(
    data: Dict[str, Any], schema: type[BaseModel]
) -> tuple[BaseModel | None, List[str]]:
    """
    Validate data against schema with one repair attempt.

    Args:
        data: Data to validate
        schema: Pydantic model class

    Returns:
        Tuple of (validated model or None, list of error messages)
    """
    errors = []

    # First validation attempt
    try:
        validated = schema(**data)
        return validated, []
    except ValidationError as e:
        errors.extend([err for err in e.errors()])

    # Repair attempt
    repaired_data = repair_json_from_errors(data, errors)

    # Second validation attempt
    try:
        validated = schema(**repaired_data)
        return validated, []
    except ValidationError as e:
        errors.extend([err for err in e.errors()])
        error_messages = [
            f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}"
            for err in errors
        ]
        return None, error_messages

