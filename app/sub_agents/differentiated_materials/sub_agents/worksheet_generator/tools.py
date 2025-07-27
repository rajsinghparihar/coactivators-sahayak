import math


def safe_eval(expr):
    """
    Safely evaluate a math expression.
    Only allows math module functions and basic arithmetic.
    """
    allowed_names = {k: v for k, v in math.__dict__.items() if not k.startswith("__")}
    allowed_names["abs"] = abs
    allowed_names["round"] = round

    code = compile(expr, "<string>", "eval")
    for name in code.co_names:
        if name not in allowed_names:
            raise NameError(f"Use of '{name}' not allowed in math expressions.")
    return eval(code, {"__builtins__": {}}, allowed_names)


def calculator(expression: str) -> str:
    """
    Tool: Calculator
    Description: Evaluates a math expression and returns the result.
    Usage: calculator("2 + 2 * 3")
    """
    try:
        result = safe_eval(expression)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"
