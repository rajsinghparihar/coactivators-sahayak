"""grade_adapter_agent."""

import os

from google.adk import Agent
from . import prompt

MODEL = os.getenv("MODEL")

grade_adapter_agent = Agent(
    model=MODEL,
    name="grade_adapter_agent",
    instruction=prompt.CONTENT_SIMPLIFICATION_PROMPT,
    output_key="simplified_content",
    # tools=[google_search],
)
