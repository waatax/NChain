from decimal import Decimal
from typing import Literal, Optional, Any
from pydantic import BaseModel

class ValidationIssue(BaseModel):
    severity: Literal["error", "warning", "info"]
    code: Literal[
        "DUPLICATE_ITEM",
        "MISSING_ITEM",
        "KEYWORD_VARIANT",
        "DAMAGED_CHAR",
        "PARSE_FAILURE",
        "RANGE_MISMATCH"
    ]
    message: str
    source: Optional[dict] = None  # e.g. {"sheet": "00-20", "cell": "B67"}
    context: Optional[dict] = None  # e.g. {"expected": "耳玲", "actual": "耳玲（耳鈴/耳環）"}

def normalize_number(raw: Any) -> str:
    if raw is None:
        raise ValueError("Number cannot be None")
    if isinstance(raw, bool):
        raise ValueError("Number cannot be boolean")
    
    val_str = str(raw).strip()
    if not val_str:
        raise ValueError("Number cannot be empty string")
        
    try:
        # Check if it has decimal or is simple int
        val = Decimal(val_str)
    except Exception:
        raise ValueError(f"Invalid numeric string: {val_str}")
        
    # Check if integer
    if val != val.to_integral_value():
        raise ValueError(f"Number must be an integer: {val_str}")
        
    n = int(val)
    if not (0 <= n <= 100):
        raise ValueError(f"Number must be between 0 and 100: {n}")
        
    if n == 100:
        return "100"
    return f"{n:02d}"
